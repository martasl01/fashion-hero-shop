"use client";
import Image from "next/image";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";
import type { PricingProductRow } from "@/types/seller-dashboard";
import { PopytCell } from "@/components/seller/popyt-cell";

interface PricingProductsTableProps {
  rows: PricingProductRow[];
  // Wariant osadzony w karcie „Co możesz zrobić" (mirror ReturnsProductsTable):
  // margines od krawędzi karty, jasne tło tabeli, bez nagłówka liczności,
  // z kolumną akcji „Przejdź do produktu". Domyślnie false → wygląd jak na
  // współdzielonym drill-downie (bez zmian).
  embedded?: boolean;
}

function formatDniOdZmiany(dni: number): string {
  const mies = Math.round(dni / 30);
  if (mies < 1) return `zmieniona ${dni} dni temu`;
  return `zmieniona ${mies} mies. temu`;
}

export function PricingProductsTable({ rows, embedded = false }: PricingProductsTableProps) {
  const posthog = usePostHog();

  const handleAction = (sku: string) => {
    posthog?.capture("woz_pricing_action_click", { sku, source: "pricing-action" });
  };

  return (
    <div className={embedded ? "px-6 pb-6 pt-4" : "flex flex-col gap-2"}>
      {!embedded && (
        <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          {rows.length} SKU – ostatnie 90 dni
        </span>
      )}
      <div
        className={`border border-black/10 rounded-lg overflow-x-auto ${
          embedded ? "bg-white" : "bg-cream-light"
        }`}
      >
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Produkt
              </th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Cena
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Benchmark
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Różnica
              </th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                Popyt
              </th>
              {embedded && (
                <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                  Akcja
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const roznicaPositive = row.roznicaPct > 0;
              return (
                <tr key={row.sku} className="border-b border-black/10 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {row.imageSrc && (
                        <Image
                          src={row.imageSrc}
                          alt={row.name}
                          width={36}
                          height={36}
                          className="rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span className="text-xs font-medium text-charcoal uppercase tracking-wide">
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold whitespace-nowrap">{row.cena} zł</span>
                      <span className="text-[11px] text-warm-gray whitespace-nowrap">
                        {formatDniOdZmiany(row.dniOdZmiany)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-warm-gray">
                    <div className="flex flex-col gap-0.5 items-end">
                      <span className="whitespace-nowrap">{row.mediana} zł</span>
                      {row.benchmarkSub && (
                        <span className="text-[11px] text-warm-gray/70">{row.benchmarkSub}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    <span className={roznicaPositive ? "text-red-600" : "text-emerald-600"}>
                      {roznicaPositive ? "+" : ""}{row.roznicaPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-warm-gray">
                    <PopytCell popyt={row.popyt} trend={row.popytTrend} />
                  </td>
                  {embedded && (
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/seller/products/${row.sku}`}
                        onClick={() => handleAction(row.sku)}
                        className="inline-block bg-charcoal text-white text-[12px] font-semibold whitespace-nowrap px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
                      >
                        Przejdź do produktu
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
