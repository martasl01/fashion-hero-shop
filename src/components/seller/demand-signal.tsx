import { TrendingUp, MinusCircle } from "lucide-react";

interface DemandSignalProps {
  text: string;
  lowDemand?: boolean;
}

// Opisowy mini-wskaźnik popytu przy SKU (sprzedaż w oknie 30 dni).
// Stan, nie prognoza — nie obiecuje efektu podwyżki.
export function DemandSignal({ text, lowDemand = false }: DemandSignalProps) {
  if (lowDemand) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warm-gray">
        <MinusCircle size={13} className="flex-shrink-0" />
        {text}
        <span className="text-warm-gray/80">· niski popyt</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-charcoal">
      <TrendingUp size={13} className="flex-shrink-0" />
      {text}
    </span>
  );
}
