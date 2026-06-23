import { Info } from "lucide-react";
import type { ReturnReason, ReturnReasonSample } from "@/types/seller-dashboard";
import { formatReasonSample } from "@/lib/return-reasons";

interface ReturnReasonsBlockProps {
  reasons: ReturnReason[]; // top 1–2, posortowane malejąco po udziale
  sample: ReturnReasonSample;
}

// Blok „Dlaczego ten produkt wraca" — top 1–2 powody (paski + udział %) oraz wyliczona
// reszta „Inne". Linia źródła + wielkość próbki ZAWSZE widoczne (nie zgadujemy).
export function ReturnReasonsBlock({ reasons, sample }: ReturnReasonsBlockProps) {
  const otherPct = Math.max(0, 100 - reasons.reduce((sum, r) => sum + r.sharePct, 0));

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-semibold text-charcoal">Dlaczego ten produkt wraca</h2>

      <div className="flex flex-col gap-4">
        {reasons.map((reason) => (
          <ReasonRow
            key={reason.code}
            label={reason.label}
            pct={reason.sharePct}
            note={`${reason.returnsCount} z ${sample.returnsWithReason}`}
            barClass="bg-charcoal"
          />
        ))}
        {otherPct > 0 && (
          <ReasonRow label="Inne" pct={otherPct} barClass="bg-black/20" />
        )}
      </div>

      <p className="flex items-start gap-1.5 text-[12px] text-warm-gray/80 leading-snug">
        <Info size={13} className="flex-shrink-0 mt-0.5" />
        {formatReasonSample(sample)}
      </p>
    </section>
  );
}

interface ReasonRowProps {
  label: string;
  pct: number;
  note?: string;
  barClass: string;
}

function ReasonRow({ label, pct, note, barClass }: ReasonRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] text-charcoal">{label}</span>
        <span className="text-[14px] font-semibold text-charcoal tabular-nums whitespace-nowrap">
          {pct}%{note && <span className="ml-1.5 text-[12px] font-normal text-warm-gray">({note})</span>}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
