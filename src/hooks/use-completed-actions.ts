"use client";
import { useState } from "react";

interface CompletedAction {
  recId: string;
  newPrice: number;
  productSlug: string;
}

const STORAGE_KEY = "fh_completed_actions";

function loadActions(): CompletedAction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CompletedAction[];
  } catch {
    return [];
  }
}

export function useCompletedActions() {
  const [actions, setActions] = useState<CompletedAction[]>(() => loadActions());

  const isDone = (recId: string) => actions.some((a) => a.recId === recId);

  const getAction = (recId: string): CompletedAction | null =>
    actions.find((a) => a.recId === recId) ?? null;

  const markDone = (recId: string, newPrice: number, productSlug: string) => {
    const updated = [
      ...actions.filter((a) => a.recId !== recId),
      { recId, newPrice, productSlug },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActions(updated);
  };

  return { isDone, getAction, markDone };
}
