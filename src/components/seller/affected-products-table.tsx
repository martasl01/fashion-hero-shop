"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCompletedActions } from "@/hooks/use-completed-actions";
import type { AffectedProductRow } from "@/types/seller-dashboard";

interface AffectedProductsTableProps {
  rows: AffectedProductRow[];
  recId: string;
  productImageMap: Record<string, string | undefined>;
}

export function AffectedProductsTable({
  rows,
  recId,
  productImageMap,
}: AffectedProductsTableProps) {
  const { isProductDone } = useCompletedActions();

  return (
    <div className="border border-black/10 rounded-lg overflow-x-auto bg-cream-light">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-black/10">
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Produkt
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Kategoria
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Cena
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Twój wynik
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Benchmark
            </th>
            <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Różnica
            </th>
            <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
              Akcja
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const done = isProductDone(recId, row.productSlug);
            return (
              <tr
                key={row.sku}
                className={`border-b border-black/10 last:border-0 ${done ? "opacity-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {productImageMap[row.productSlug] && (
                      <Image
                        src={productImageMap[row.productSlug]!}
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
                <td className="px-4 py-3 text-warm-gray">{row.category}</td>
                <td className="px-4 py-3 text-charcoal">{row.price}</td>
                <td className="px-4 py-3 text-charcoal">{row.yourValue}</td>
                <td className="px-4 py-3 text-warm-gray">{row.benchmarkValue}</td>
                <td className="px-4 py-3 text-right font-semibold text-charcoal">
                  {row.difference}
                </td>
                <td className="px-4 py-3 text-right">
                  {done ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-warm-gray">
                      <CheckCircle size={13} />
                      Zmieniono
                    </span>
                  ) : (
                    <Link
                      href={`/seller/products/${row.productSlug}?recId=${recId}&sku=${row.sku}`}
                      className="inline-block bg-charcoal text-white text-[12px] font-semibold whitespace-nowrap px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
                    >
                      Przejdź do produktu
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
