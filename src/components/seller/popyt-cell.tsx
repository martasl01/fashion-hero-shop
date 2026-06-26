import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PopytTrend } from "@/types/seller-dashboard";

interface PopytCellProps {
  popyt: number;
  trend: PopytTrend;
}

// Komórka „Popyt" w tabelach SKU: liczba sztuk/30 dni + kierunek trendu.
// Współdzielona przez tabelę cennikową (Dorota) i zwrotową (Bartek).
export function PopytCell({ popyt, trend }: PopytCellProps) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const color = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-warm-gray";
  return (
    <div className="flex flex-col gap-0.5 items-end">
      <span className="whitespace-nowrap">{popyt} szt./30 dni</span>
      <span className={`flex items-center gap-0.5 text-[11px] ${color}`}>
        <Icon size={11} />
        {trend === "up" ? "rośnie" : trend === "down" ? "spada" : "stabilny"}
      </span>
    </div>
  );
}
