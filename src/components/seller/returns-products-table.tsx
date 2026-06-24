"use client";
import Image from "next/image";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import type { ReturnsProductRow, PopytTrend } from "@/types/seller-dashboard";

function PopytCell({ popyt, trend }: { popyt: number; trend: PopytTrend }) {
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

interface ReturnsProductsTableProps {
  rows: ReturnsProductRow[];
  subcategory: string;
}

// Tabela produktów dotkniętych problemem zwrotów. Link „edytuj" to atrapa WoZ:
// rejestruje intencję (zdarzenie PostHog), ale nie prowadzi do realnej edycji
// i nie pokazuje potwierdzenia akcji.
export function ReturnsProductsTable({
  rows,
  subcategory,
}: ReturnsProductsTableProps) {
  const posthog = usePostHog();

  const handleEdit = (event: React.MouseEvent<HTMLAnchorElement>, sku: string) => {
    event.preventDefault();
    posthog?.capture("woz_edit_click", { sku, source: "returns-action" });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
        {rows.length} SKU – ostatnie 90 dni
      </span>
      <div className="border border-black/10 rounded-lg overflow-x-auto bg-cream-light">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Produkt
              </th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Zwroty % (liczba)
              </th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Benchmark „{subcategory}"
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Różnica
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Cena SKU
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Popyt
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Akcja
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className="border-b border-black/10 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={row.imageSrc}
                      alt={row.name}
                      width={36}
                      height={36}
                      className="rounded object-cover flex-shrink-0"
                    />
                    <span className="text-xs font-medium text-charcoal uppercase tracking-wide">
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal whitespace-nowrap">
                  {row.yourValue} ({row.returnsCount} zwr.)
                </td>
                <td className="px-4 py-3 text-warm-gray">
                  <div className="flex flex-col gap-0.5">
                    <span>{row.benchmarkValue}</span>
                    {row.benchmarkSub && (
                      <span className="text-[11px] text-warm-gray/70">{row.benchmarkSub}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-charcoal">
                  {row.difference}
                </td>
                <td className="px-4 py-3 text-right text-charcoal whitespace-nowrap">
                  {row.cena} zł
                </td>
                <td className="px-4 py-3 text-right text-warm-gray">
                  <PopytCell popyt={row.popyt} trend={row.popytTrend} />
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href="#"
                    onClick={(event) => handleEdit(event, row.sku)}
                    className="inline-block bg-charcoal text-white text-[12px] font-semibold whitespace-nowrap px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
                  >
                    Edytuj
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
