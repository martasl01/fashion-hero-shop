"use client";
import { useState, useEffect } from "react";

interface ProductAction {
  productSlug: string;
  newPrice: number;
}

interface CompletedAction {
  recId: string;
  products: ProductAction[];
}

const STORAGE_KEY = "fh_completed_actions";

function loadActions(): CompletedAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown[];
    // Guard against old single-product format (productSlug string instead of products array)
    return raw.filter(
      (a): a is CompletedAction =>
        typeof a === "object" && a !== null && "recId" in a && "products" in a
    );
  } catch {
    return [];
  }
}

export function useCompletedActions() {
  const [actions, setActions] = useState<CompletedAction[]>([]);
  useEffect(() => {
    setActions(loadActions());
  }, []);

  const isDone = (recId: string) =>
    actions.some((a) => a.recId === recId && a.products.length > 0);

  const isProductDone = (recId: string, productSlug: string) =>
    actions.some(
      (a) => a.recId === recId && a.products.some((p) => p.productSlug === productSlug)
    );

  const getProductAction = (recId: string, productSlug: string): ProductAction | null =>
    actions.find((a) => a.recId === recId)?.products.find((p) => p.productSlug === productSlug) ??
    null;

  const markDone = (recId: string, newPrice: number, productSlug: string) => {
    const existing = actions.find((a) => a.recId === recId);
    const updatedProducts: ProductAction[] = existing
      ? [
          ...existing.products.filter((p) => p.productSlug !== productSlug),
          { productSlug, newPrice },
        ]
      : [{ productSlug, newPrice }];

    const updated = [
      ...actions.filter((a) => a.recId !== recId),
      { recId, products: updatedProducts },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActions(updated);
  };

  return { isDone, isProductDone, getProductAction, markDone };
}
