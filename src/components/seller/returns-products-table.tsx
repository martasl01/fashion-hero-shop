"use client";
import Link from "next/link";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";
import type { ReturnsProductRow } from "@/types/seller-dashboard";
import { PopytCell } from "@/components/seller/popyt-cell";

interface ReturnsProductsTableProps {
  rows: ReturnsProductRow[];
}

// Tabela produktów dotkniętych problemem zwrotów. Link „edytuj" to atrapa WoZ:
// rejestruje intencję (zdarzenie PostHog), ale nie prowadzi do realnej edycji
// i nie pokazuje potwierdzenia akcji.
export function ReturnsProductsTable({
  rows,
}: ReturnsProductsTableProps) {
  const posthog = usePostHog();

  const handleEdit = (sku: string) => {
    posthog?.capture("woz_edit_click", { sku, source: "returns-action" });
  };

  return (
    <div className="px-6 pb-6 pt-4">
      <div className="border border-black/10 rounded-lg overflow-x-auto bg-white">
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
                Benchmark zwroty
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
                  <Link
                    href={`/seller/products/${row.sku}`}
                    onClick={() => handleEdit(row.sku)}
                    className="inline-block bg-charcoal text-white text-[12px] font-semibold whitespace-nowrap px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
                  >
                    Przejdź do produktu
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

