"use client";

import { useCallback, useSyncExternalStore } from "react";

export type PrototypeType = "bartek" | "dorota";

export const PROTOTYPE_TYPE_STORAGE_KEY = "stepforward-prototype-type";

const DEFAULT_TYPE: PrototypeType = "bartek";

const CHANGE_EVENT = "prototype-type-change";

const OPTIONS: { value: PrototypeType; label: string }[] = [
  { value: "bartek", label: "Bartek-type" },
  { value: "dorota", label: "Dorota-type" },
];

function readType(): PrototypeType {
  try {
    const stored = localStorage.getItem(PROTOTYPE_TYPE_STORAGE_KEY);
    return stored === "bartek" || stored === "dorota" ? stored : DEFAULT_TYPE;
  } catch {
    return DEFAULT_TYPE;
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Czyta wybór z localStorage przez useSyncExternalStore: getServerSnapshot zwraca
// DEFAULT, więc render serwerowy i pierwszy render klienta są zgodne (brak błędu
// hydratacji), a po hydratacji React przełącza się na realną wartość z localStorage.
function usePrototypeType(): [PrototypeType, (value: PrototypeType) => void] {
  const type = useSyncExternalStore(subscribe, readType, () => DEFAULT_TYPE);

  const setType = useCallback((value: PrototypeType) => {
    try {
      localStorage.setItem(PROTOTYPE_TYPE_STORAGE_KEY, value);
    } catch {
      // localStorage unavailable
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [type, setType];
}

function UnderConstruction() {
  return (
    <div className="border border-dashed border-black/20 rounded-lg bg-cream-light px-6 py-16 flex flex-col items-center text-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
        Bartek-type
      </span>
      <h2 className="text-[17px] font-semibold text-charcoal">Widok w budowie</h2>
      <p className="text-[13px] text-warm-gray max-w-sm">
        Ten wariant dashboardu powstanie w następnym kroku. Przełącz na „Dorota-type”, aby
        zobaczyć aktualny widok.
      </p>
    </div>
  );
}

export function PrototypeSwitch({
  dorotaView,
  bartekView,
}: {
  dorotaView: React.ReactNode;
  bartekView?: React.ReactNode;
}) {
  const [type, setType] = usePrototypeType();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setType(event.target.value as PrototypeType);
  };

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">Dashboard</h1>
          <p className="text-[13px] text-warm-gray mt-0.5">Twoje dane sprzedażowe</p>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="prototype-type"
            className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray"
          >
            Typ prototypu
          </label>
          <select
            id="prototype-type"
            value={type}
            onChange={handleChange}
            className="border border-black/20 rounded-md px-3 py-2 text-[13px] font-semibold text-charcoal bg-cream-light hover:border-charcoal transition-colors"
          >
            {OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "dorota" ? dorotaView : (bartekView ?? <UnderConstruction />)}
    </>
  );
}
