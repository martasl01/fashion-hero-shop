"use client";
import Link from "next/link";
import Image from "next/image";
import { Tag, TrendingDown, Package, CheckCircle } from "lucide-react";
import type { SellerRecommendation } from "@/types/seller-dashboard";
import { useCompletedActions } from "@/hooks/use-completed-actions";
import { DemandSignal } from "./demand-signal";

const categoryIcons: Record<SellerRecommendation["category"], React.ReactNode> = {
  cennik: <Tag size={13} />,
  rentowność: <TrendingDown size={13} />,
  listing: <Package size={13} />,
};

interface RecommendationCardProps {
  recommendation: SellerRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { id, category, title, insightShort, ctaLabel, primaryProduct } = recommendation;
  const { isDone } = useCompletedActions();
  const done = isDone(id);

  if (done) {
    return (
      <div className="flex flex-col gap-3 bg-cream-light border border-black/10 rounded p-5 opacity-60">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          {categoryIcons[category]}
          {category}
        </span>
        <h3 className="text-[16px] font-semibold text-charcoal leading-snug">{title}</h3>
        <div className="flex items-center gap-2.5">
          <Image
            src={primaryProduct.imageSrc}
            alt={primaryProduct.name}
            width={40}
            height={40}
            className="rounded-md object-cover flex-shrink-0"
          />
          <span className="text-[11px] text-warm-gray">SKU: {primaryProduct.sku}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-warm-gray mt-auto">
          <CheckCircle size={13} />
          Akcja wykonana — śledź wyniki sprzedaży
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 bg-cream-light border border-black/10 rounded p-5 hover:border-charcoal transition-colors">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
        {categoryIcons[category]}
        {category}
      </span>
      <h3 className="text-[16px] font-semibold text-charcoal leading-snug">{title}</h3>
      <div className="flex items-center gap-2.5">
        <Image
          src={primaryProduct.imageSrc}
          alt={primaryProduct.name}
          width={40}
          height={40}
          className="rounded-md object-cover flex-shrink-0"
        />
        <span className="text-[11px] text-warm-gray">SKU: {primaryProduct.sku}</span>
      </div>
      {category === "cennik" && primaryProduct.demandSignal && (
        <DemandSignal text={primaryProduct.demandSignal} />
      )}
      <p className="text-[12px] text-warm-gray leading-relaxed flex-1">{insightShort}</p>
      <Link
        href={`/seller/recommendations/${id}`}
        className="self-start text-[12px] font-semibold text-charcoal underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}
