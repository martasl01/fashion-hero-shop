"use client";
import { useCallback, useSyncExternalStore } from "react";

// Stan checkboxów akcji trzymany w localStorage pod kluczem z `stateKeyForSku`
// (@/lib/action-state-key). Czytamy go przez useSyncExternalStore (a NIE w inicjalizatorze
// useState), bo strony akcji są prerenderowane statycznie: serwer nie ma localStorage, więc
// początkowy render musi być pusty, a klient dociąga wartość po hydracji bez ostrzeżenia
// o niezgodności. To też synchronizuje licznik widgetu na dashboardzie z checklistą na
// stronie akcji (ten sam klucz, wspólny store + zdarzenie „storage" między kartami).

const EMPTY = new Set<string>();

// Cache referencji per klucz — getSnapshot MUSI zwracać tę samą instancję dopóki dane
// się nie zmieniły, inaczej useSyncExternalStore wpada w nieskończoną pętlę renderów.
const snapshots = new Map<string, { raw: string | null; value: Set<string> }>();
const listeners = new Map<string, Set<() => void>>();

function readSet(stateKey: string): Set<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(stateKey);
  } catch {
    raw = null;
  }
  const cached = snapshots.get(stateKey);
  if (cached && cached.raw === raw) return cached.value;

  let value: Set<string>;
  try {
    value = raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
  } catch {
    value = new Set<string>();
  }
  snapshots.set(stateKey, { raw, value });
  return value;
}

function emit(stateKey: string) {
  listeners.get(stateKey)?.forEach((cb) => cb());
}

export function useCheckboxState(stateKey: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      let set = listeners.get(stateKey);
      if (!set) {
        set = new Set();
        listeners.set(stateKey, set);
      }
      set.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === stateKey) cb();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set!.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [stateKey]
  );

  const checked = useSyncExternalStore(
    subscribe,
    () => readSet(stateKey),
    () => EMPTY
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(readSet(stateKey));
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      const raw = JSON.stringify([...next]);
      try {
        localStorage.setItem(stateKey, raw);
      } catch {
        // ignore storage errors
      }
      // Wstaw nową referencję do cache, żeby kolejny getSnapshot ją zwrócił, i powiadom.
      snapshots.set(stateKey, { raw, value: next });
      emit(stateKey);
    },
    [stateKey]
  );

  return { checked, toggle, checkedCount: checked.size };
}
