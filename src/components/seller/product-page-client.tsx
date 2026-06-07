"use client";
import { useState } from "react";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useCompletedActions } from "@/hooks/use-completed-actions";
import { ActionRecommendationFrame } from "@/components/seller/action-recommendation-frame";
import { PriceEditDialog } from "@/components/seller/price-edit-dialog";
import { ActionDoneDialog } from "@/components/seller/action-done-dialog";
import { ActionDoneBanner } from "@/components/seller/action-done-banner";
import type { Product } from "@/types";
import type { AffectedProductRow, SellerRecommendation } from "@/types/seller-dashboard";

interface ProductPageClientProps {
  product: Product;
  row: AffectedProductRow | null;
  recommendation: SellerRecommendation | null;
  recId: string | null;
}

export function ProductPageClient({
  product,
  row,
  recommendation,
  recId,
}: ProductPageClientProps) {
  const posthog = usePostHog();
  const { isProductDone, getProductAction, markDone } = useCompletedActions();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDoneDialog, setShowDoneDialog] = useState(false);
  const [savedPrice, setSavedPrice] = useState<number | null>(null);

  const image = product.colors[0]?.image ?? product.images?.[0];
  const isActionDone = recId ? isProductDone(recId, product.slug) : false;
  const doneProductAction = recId ? getProductAction(recId, product.slug) : null;

  // Compute 10% suggested price from current price
  const currentPriceNum = row ? parseInt(row.price.replace(/[^\d]/g, ""), 10) : 0;
  const suggestedPrice10pct = row ? `${Math.round(currentPriceNum * 1.10)} zł` : "";
  const diffPercent = row ? row.difference.replace(/[^0-9]/g, "") : "";
  const productFrameInsight = row
    ? `Cena tego produktu jest o ${diffPercent}% niższa od mediany (${row.benchmarkValue}). Rekomendujemy podnieść cenę o 10% (do ~${Math.round(currentPriceNum * 1.10)} zł) na 2 tygodnie.`
    : "";

  const displayPrice =
    savedPrice !== null
      ? `${savedPrice} zł`
      : doneProductAction?.newPrice
      ? `${doneProductAction.newPrice} zł`
      : row?.price ?? `${product.price} zł`;

  const handleSave = (newPrice: number) => {
    if (!recId) return;
    markDone(recId, newPrice, product.slug);
    setSavedPrice(newPrice);
    setShowEditForm(false);
    setShowDoneDialog(true);
  };

  const backHref = recId ? `/seller/recommendations/${recId}` : "/seller";
  const backLabel = recId ? "Wróć do rekomendacji" : "Wróć do dashboardu";

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-10">
      <Link
        href={backHref}
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        {backLabel}
      </Link>

      <div className="flex flex-col gap-2">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
          Podgląd produktu
        </span>
        <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{product.name}</h1>
      </div>

      {recId && recommendation && row && (
        isActionDone ? (
          <ActionDoneBanner />
        ) : (
          <ActionRecommendationFrame
            title="Cena tego produktu jest poniżej mediany kategorii"
            insightShort={productFrameInsight}
            ctaLabel={recommendation.ctaLabel}
            currentPrice={row.price}
            suggestedPrice={suggestedPrice10pct}
            onExecute={() => {
              posthog.capture("recommendation_action_started", {
                type: "price_change",
                sku: row.sku,
                rec_id: recId,
              });
              setShowEditForm(true);
            }}
          />
        )
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {image ? (
          <div className="relative aspect-square w-full border border-black/10 rounded-lg overflow-hidden bg-cream-light">
            <Image src={image} alt={product.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-square w-full border border-black/10 rounded-lg bg-black/5" />
        )}

        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light self-start">
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">SKU</span>
            <p className="text-[14px] font-semibold text-charcoal">{row?.sku ?? product.id}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Kategoria</span>
            <p className="text-[14px] text-charcoal">{row?.category ?? product.productCategory}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Cena</span>
            <p className="text-[14px] font-semibold text-charcoal">{displayPrice}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Opis</span>
            <p className="text-[14px] text-charcoal leading-relaxed">{product.description}</p>
          </div>
        </div>
      </section>

      {showEditForm && row && recommendation && (
        <PriceEditDialog
          sku={row.sku}
          category={row.category}
          currentPrice={row.price}
          suggestedPrice={suggestedPrice10pct}
          productName={product.name}
          onSave={handleSave}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showDoneDialog && savedPrice !== null && recommendation && row && (
        <ActionDoneDialog
          ctaLabel={recommendation.ctaLabel}
          productName={product.name}
          oldPrice={row.price}
          newPrice={savedPrice}
        />
      )}
    </div>
  );
}
