import type { SizeBreakdown } from "@/types/seller-dashboard";
import type { SizeComparison } from "@/lib/return-reasons";
import { formatSizeRate, formatSizeSampleNote, joinPl } from "@/lib/return-reasons";

interface SizeBreakdownTableProps {
  breakdown: SizeBreakdown; // wiersze już posortowane po RR i oznaczone (resolver)
  comparison?: SizeComparison; // wyliczone high vs low (resolver)
}

// Rozbicie zwrotów per rozmiar — renderowane TYLKO gdy top powód = rozmiar.
// Paski: czerwony = wysoki RR (za duży rozmiar), zielony = w normie.
export function SizeBreakdownTable({ breakdown, comparison }: SizeBreakdownTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[15px] font-semibold text-charcoal">Które rozmiary wracają</h3>
        <span className="text-[12px] text-warm-gray">· return rate per rozmiar</span>
      </div>

      <div className="border border-black/10 rounded-xl bg-cream-light p-5 flex flex-col gap-3.5">
        {breakdown.rows.map((row) => (
          <div key={row.size} className="flex items-center gap-3">
            <span className="w-8 flex-shrink-0 text-[13px] font-semibold text-charcoal">
              {row.size}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-black/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${row.high ? "bg-red-500" : "bg-charcoal"}`}
                style={{ width: `${row.ratePct}%` }}
              />
            </div>
            <span
              className={`w-24 flex-shrink-0 text-right text-[13px] tabular-nums ${
                row.high ? "text-red-600 font-semibold" : "text-charcoal"
              }`}
            >
              {formatSizeRate(row)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
        {comparison
          ? `${joinPl(comparison.highSizes)} wracają ${comparison.multiple}× częściej niż ${joinPl(
              comparison.lowSizes
            )} → ${breakdown.diagnosis}`
          : breakdown.diagnosis}
      </p>
      <p className="text-[12px] text-warm-gray/80 leading-snug">
        {formatSizeSampleNote(breakdown.sample)}
      </p>
    </section>
  );
}
