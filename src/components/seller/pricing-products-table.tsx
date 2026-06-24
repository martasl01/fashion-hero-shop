import Image from "next/image";
import type { PricingProductRow } from "@/types/seller-dashboard";

interface PricingProductsTableProps {
  rows: PricingProductRow[];
}

function formatDniOdZmiany(dni: number): string {
  const mies = Math.round(dni / 30);
  if (mies < 1) return `zmieniona ${dni} dni temu`;
  return `zmieniona ${mies} mies. temu`;
}

export function PricingProductsTable({ rows }: PricingProductsTableProps) {
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
                  <td className="px-4 py-3 text-right text-warm-gray whitespace-nowrap">
                    {row.mediana} zł
                  </td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                    <span className={roznicaPositive ? "text-red-600" : "text-emerald-600"}>
                      {roznicaPositive ? "+" : ""}{row.roznicaPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-warm-gray whitespace-nowrap">
                    {row.popyt} szt./30 dni
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
