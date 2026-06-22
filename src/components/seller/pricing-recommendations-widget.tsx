"use client";

import { useEffect, useMemo } from "react";
import { usePostHog } from "posthog-js/react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Product } from "@/types";
import type { PricingSkuInput } from "@/types/seller-dashboard";
import { resolvePricingRecommendation } from "@/lib/pricing-recommendation";

interface PricingRecommendationsWidgetProps {
  products: Product[];
  inputs: PricingSkuInput[];
}

export function PricingRecommendationsWidget({
  products,
  inputs,
}: PricingRecommendationsWidgetProps) {
  const posthog = usePostHog();

  // Klasyfikujemy wszystkie SKU raz; do widoku bierzemy tylko te z rekomendacją
  // (status "recommended"). "silent"/"excluded" celowo nie zaśmiecają listy.
  const resolved = useMemo(
    () =>
      inputs.map((input) => ({
        input,
        product: products.find((p) => p.id === input.productId),
        rec: resolvePricingRecommendation(input),
      })),
    [inputs, products]
  );

  const recommended = resolved.filter(
    (r) => r.rec.status === "recommended" && r.product
  );

  // Metryka pokrycia (open issue #2): ile SKU silnik przemilczał z braku dowodu.
  const noEvidenceCount = resolved.filter(
    (r) => r.rec.reasonCode === "no_evidence"
  ).length;

  useEffect(() => {
    posthog?.capture("pricing_recommendation_generated", {
      count: recommended.length,
      reason_codes: recommended.map((r) => r.rec.reasonCode),
      no_evidence_count: noEvidenceCount,
    });
    // raz na zamontowanie widgetu — lista jest deterministyczna z danych mock
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest bg-charcoal text-white px-2 py-0.5 rounded">
            Nowość
          </span>
          <h2 className="text-[17px] font-semibold text-charcoal">
            Rekomendacje cenowe
          </h2>
        </div>
        <p className="text-[13px] text-warm-gray max-w-[65ch]">
          Sprawdzamy, które ceny odstają od rynku, i podpowiadamy kierunek. Ty
          decydujesz, czy i o ile zmienić cenę.
        </p>
      </div>

      {recommended.length === 0 ? (
        <div className="border border-black/10 rounded p-8 text-center text-warm-gray text-[14px] bg-cream-light">
          Brak rekomendacji cenowych w tym tygodniu — Twoje ceny nie odstają od
          rynku na tyle, by je ruszać.
        </div>
      ) : (
        <div className="border border-black/10 rounded overflow-hidden bg-cream-light divide-y divide-black/10">
          {recommended.map(({ input, product, rec }) => {
            const raise = rec.direction === "raise";
            const Icon = raise ? TrendingUp : TrendingDown;
            const ctaLabel = raise ? "Podnieś cenę" : "Obniż cenę";
            return (
              <div
                key={input.productId}
                className="flex items-start gap-3 p-5"
              >
                <Icon
                  size={18}
                  className="text-charcoal shrink-0 mt-0.5"
                  aria-hidden
                />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-charcoal">
                    {product!.name}
                  </span>
                  <span className="text-[13px] text-warm-gray">{rec.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    posthog?.capture("woz_pricing_action_click", {
                      sku: input.productId,
                      direction: rec.direction,
                      reason_code: rec.reasonCode,
                    })
                  }
                  className="self-start bg-charcoal text-white text-[12px] font-semibold px-4 py-2 rounded-md hover:opacity-80 transition-opacity shrink-0"
                >
                  {ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
