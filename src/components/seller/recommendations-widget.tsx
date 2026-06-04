import type { SellerRecommendation } from "@/types/seller-dashboard";
import { RecommendationCard } from "./recommendation-card";

interface RecommendationsWidgetProps {
  recommendations: SellerRecommendation[];
}

export function RecommendationsWidget({ recommendations }: RecommendationsWidgetProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest bg-charcoal text-white px-2 py-0.5 rounded">
          Nowość
        </span>
        <span className="text-[13px] font-semibold text-charcoal uppercase tracking-wide">
          Trzy akcje na ten tydzień
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
