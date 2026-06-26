"use client";
import { useState, useCallback } from "react";

export function useCheckboxState(stateKey: string) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const stored = localStorage.getItem(stateKey);
      return stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        try {
          localStorage.setItem(stateKey, JSON.stringify([...next]));
        } catch {
          // ignore storage errors
        }
        return next;
      });
    },
    [stateKey]
  );

  return { checked, toggle, checkedCount: checked.size };
}
