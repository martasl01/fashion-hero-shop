import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, RotateCcw } from "lucide-react";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { MetricTile } from "@/components/seller/metric-tile";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return sellerRecommendations.map((r) => ({ id: r.id }));
}

export default async function RecommendationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const rec = sellerRecommendations.find((r) => r.id === id);

  if (!rec) notFound();

  const productImageMap = Object.fromEntries(
    rec.affectedProductRows.map((row) => {
      const p = products.find((prod) => prod.slug === row.productSlug);
      return [row.productSlug, p?.colors[0]?.image ?? p?.images?.[0]];
    })
  );

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-10">
      {/* Wróć */}
      <Link
        href="/seller"
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      {/* h1 */}
      <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.title}</h1>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co mówią liczby</h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricTile metric={{ id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value }} />
          <MetricTile metric={{ id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value }} />
          <MetricTile metric={{ id: "diff", label: rec.differenceTile.label, value: rec.differenceTile.value }} />
        </div>
      </section>

      {/* Co to znaczy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
        <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{rec.contextExplanation}</p>
      </section>

      {/* Produkty których to dotyczy */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Produkty, których to dotyczy</h2>
        <div className="border border-black/10 rounded-lg overflow-hidden bg-cream-light">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-black/10">
                <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-3">
                  Produkt
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
              </tr>
            </thead>
            <tbody>
              {rec.affectedProductRows.map((row) => (
                <tr key={row.sku} className="border-b border-black/10 last:border-0">
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
                      <Link
                        href={`/products/${row.productSlug}`}
                        className="hover:underline underline-offset-2 hover:opacity-70 transition-opacity"
                      >
                        <span className="text-xs font-medium text-charcoal uppercase tracking-wide">{row.name}</span>
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{row.yourValue}</td>
                  <td className="px-4 py-3 text-warm-gray">{row.benchmarkValue}</td>
                  <td className="px-4 py-3 text-right font-semibold text-charcoal">{row.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Co możesz zrobić */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>

        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          {/* AKCJA */}
          <div className="p-5 flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Akcja
            </span>
            <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.action}</p>
          </div>

          <div className="border-t border-black/10" />

          {/* OKNO TESTU */}
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Okno testu
            </span>
            <p className="text-[14px] font-semibold text-charcoal">{rec.actionStep.testWindow}</p>
          </div>

          <div className="border-t border-black/10" />

          {/* METRYKA SUKCESU */}
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Metryka sukcesu
            </span>
            <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.successMetric}</p>
          </div>

          <div className="border-t border-black/10" />

          {/* ZOSTAW / WYCOFAJ */}
          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <Check size={10} />
                Zostaw
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.keepRule}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <RotateCcw size={10} />
                Wycofaj
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.revertRule}</p>
            </div>
          </div>

          <div className="border-t border-black/10" />

          {/* PRODUKTY DO DZIAŁANIA */}
          <div className="p-5 flex flex-col gap-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Produkty do działania
            </span>
            <div className="grid grid-cols-3 gap-3">
              {rec.affectedProductRows.map((row) => (
                <div
                  key={row.sku}
                  className="flex flex-col bg-cream-light border border-black/10 rounded-lg overflow-hidden"
                >
                  {productImageMap[row.productSlug] ? (
                    <div className="relative aspect-square w-full">
                      <Image
                        src={productImageMap[row.productSlug]!}
                        alt={row.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-black/5" />
                  )}
                  <div className="p-3 flex flex-col gap-2.5 flex-1">
                    <h3 className="text-xs font-medium text-charcoal uppercase tracking-wide truncate">{row.name}</h3>
                    <Link
                      href={`/products/${row.productSlug}`}
                      className="block w-full bg-charcoal text-white text-[12px] font-semibold text-center py-2 rounded-md hover:opacity-80 transition-opacity"
                    >
                      Przejdź do tego produktu
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
