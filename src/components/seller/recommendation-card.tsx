import Link from "next/link";
import { Tag, TrendingDown, Package } from "lucide-react";
import type { SellerRecommendation } from "@/types/seller-dashboard";

const categoryIcons: Record<SellerRecommendation["category"], React.ReactNode> = {
  cennik: <Tag size={13} />,
  rentowność: <TrendingDown size={13} />,
  listing: <Package size={13} />,
};

interface RecommendationCardProps {
  recommendation: SellerRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { id, category, title, insightShort, ctaLabel } = recommendation;

  return (
    <div className="flex flex-col gap-3 bg-white border border-black/10 rounded p-5 hover:border-charcoal transition-colors">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
        {categoryIcons[category]}
        {category}
      </span>
      <h3 className="text-[16px] font-semibold text-charcoal leading-snug">{title}</h3>
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
