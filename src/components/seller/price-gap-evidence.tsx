import { Clock, Gauge } from "lucide-react";
import type { PriceDistributionSignal, PriceStagnationSignal } from "@/types/seller-dashboard";
import { formatDistribution, formatDistributionSample, formatStagnation } from "@/lib/price-gap";

interface PriceGapEvidenceProps {
  stagnation: PriceStagnationSignal | null;
  distribution: PriceDistributionSignal | null;
}

// Slot dowodowy „Dlaczego ta cena to luka" (dorota-type) — symetryczny do
// „Dlaczego ten produkt wraca". Rozróżnia świadomy pricing od zapomnianej ceny
// dwoma sygnałami z danych: stagnacją ceny i pozycją w rozkładzie podkategorii.
// Akcent po lewej (ikona + listwa), pasek pozycji pod sygnałem rozkładu, linia
// źródła (liczność próby) zawsze widoczna — nie zgadujemy. Komponent renderuje
// tylko sygnały, które przeszły progi (patrz resolvePriceGap).
export function PriceGapEvidence({ stagnation, distribution }: PriceGapEvidenceProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-semibold text-charcoal">Dlaczego ta cena to luka</h2>
      <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
        {stagnation && (
          <div className="p-5 flex gap-3 border-l-2 border-charcoal">
            <Clock size={16} className="text-charcoal mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-charcoal">Cena stoi w miejscu</span>
              <span className="text-[13px] text-warm-gray leading-relaxed">
                {formatStagnation(stagnation)}
              </span>
            </div>
          </div>
        )}

        {stagnation && distribution && <div className="border-t border-black/10" />}

        {distribution && (
          <div className="p-5 flex gap-3 border-l-2 border-charcoal">
            <Gauge size={16} className="text-charcoal mt-0.5 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-[14px] font-semibold text-charcoal">Pozycja w podkategorii</span>
              <span className="text-[13px] text-warm-gray leading-relaxed">
                {formatDistribution(distribution)}
              </span>
              {/* Pasek pozycji: wypełnienie do percentyla — im węższe, tym taniej */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-warm-gray/70 shrink-0">najtańsze</span>
                <div className="h-1.5 flex-1 rounded-full bg-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-charcoal"
                    style={{ width: `${distribution.percentile}%` }}
                  />
                </div>
                <span className="text-[11px] text-warm-gray/70 shrink-0">najdroższe</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-black/10" />
        <p className="px-5 py-3 text-[12px] text-warm-gray/80 leading-snug">
          {distribution
            ? formatDistributionSample(distribution.sample)
            : "źródło: historia ceny tego SKU i mediana podkategorii"}
        </p>
      </div>
    </section>
  );
}
