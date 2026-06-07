"use client";
import { useState } from "react";

interface ProductAction {
  productSlug: string;
  newPrice: number;
}

interface CompletedAction {
  recId: string;
  products: ProductAction[];
}

export function useCompletedActions() {
  const [actions, setActions] = useState<CompletedAction[]>([]);

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

    setActions([
      ...actions.filter((a) => a.recId !== recId),
      { recId, products: updatedProducts },
    ]);
  };

  return { isDone, isProductDone, getProductAction, markDone };
}
