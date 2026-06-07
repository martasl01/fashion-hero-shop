"use client";
import { Lightbulb } from "lucide-react";

interface ActionRecommendationFrameProps {
  title: string;
  insightShort: string;
  ctaLabel: string;
  currentPrice: string;
  suggestedPrice: string;
  onExecute: () => void;
}

export function ActionRecommendationFrame({
  title,
  insightShort,
  ctaLabel,
  currentPrice,
  suggestedPrice,
  onExecute,
}: ActionRecommendationFrameProps) {
  return (
    <div className="border-2 border-charcoal rounded-xl p-5 bg-cream-light flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Lightbulb size={16} className="text-charcoal mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
            Rekomendowana akcja
          </span>
          <h2 className="text-[16px] font-semibold text-charcoal leading-snug">{title}</h2>
          <p className="text-[13px] text-warm-gray leading-relaxed">{insightShort}</p>
          <p className="text-[13px] font-semibold text-charcoal mt-1">
            Sugerowana zmiana: {currentPrice} → {suggestedPrice}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExecute}
        className="self-start bg-charcoal text-white text-[12px] font-semibold px-4 py-2.5 rounded-md hover:opacity-80 transition-opacity"
      >
        {ctaLabel} — Wykonaj akcję
      </button>
    </div>
  );
}
