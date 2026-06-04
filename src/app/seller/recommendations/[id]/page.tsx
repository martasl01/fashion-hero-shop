import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { MetricTile } from "@/components/seller/metric-tile";
import { cn } from "@/lib/utils";
import type { RecommendationCategory } from "@/types/seller-dashboard";

const categoryColors: Record<RecommendationCategory, string> = {
  cennik: "bg-blue-50 text-blue-700",
  rentowność: "bg-red-50 text-red-700",
  listing: "bg-amber-50 text-amber-700",
};

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

  const firstRow = rec.affectedProductRows[0];
  const product = firstRow ? products.find((p) => p.slug === firstRow.productSlug) : undefined;
  const productImage = product?.colors[0]?.image ?? product?.images?.[0];

  return (
    <div className="p-8 max-w-3xl flex flex-col gap-10">
      {/* Wróć */}
      <Link
        href="/seller"
        className="self-start text-[12px] text-warm-gray hover:text-charcoal transition-colors flex items-center gap-1"
      >
        ← Dashboard
      </Link>

      {/* Nagłówek */}
      <div className="flex flex-col gap-2">
        <span
          className={cn(
            "self-start text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded",
            categoryColors[rec.category]
          )}
        >
          {rec.category}
        </span>
        <h1 className="text-[22px] font-semibold text-charcoal leading-snug">{rec.title}</h1>
      </div>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          Co mówią liczby
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <MetricTile metric={{ id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value }} />
          <MetricTile metric={{ id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value }} />
          <MetricTile metric={{ id: "diff", label: rec.differenceTile.label, value: rec.differenceTile.value }} />
        </div>
      </section>

      {/* Co to znaczy */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          Co to znaczy
        </h2>
        <p className="text-[14px] text-charcoal leading-relaxed">{rec.contextExplanation}</p>
      </section>

      {/* Produkty których to dotyczy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          Produkty których to dotyczy
        </h2>
        <div className="border border-black/10 rounded overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02]">
                <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-2.5">
                  Produkt
                </th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-2.5">
                  Twój wynik
                </th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-2.5">
                  Benchmark
                </th>
                <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-warm-gray px-4 py-2.5">
                  Różnica
                </th>
              </tr>
            </thead>
            <tbody>
              {rec.affectedProductRows.map((row) => (
                <tr key={row.sku} className="border-b border-black/10 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${row.productSlug}`}
                      className="text-charcoal underline underline-offset-2 hover:opacity-70 transition-opacity"
                    >
                      {row.name}
                      <span className="text-warm-gray ml-1">({row.sku})</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal">{row.yourValue}</td>
                  <td className="px-4 py-3 text-warm-gray">{row.benchmarkValue}</td>
                  <td className="px-4 py-3 font-semibold text-charcoal">{row.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Co możesz zrobić */}
      <section className="flex flex-col gap-4 border border-charcoal rounded p-5 bg-charcoal/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-charcoal">
          Co możesz zrobić
        </h2>

        {/* Miniaturka produktu + CTA */}
        {firstRow && (
          <div className="flex items-center gap-3 bg-white border border-black/10 rounded p-3">
            {productImage && (
              <Image
                src={productImage}
                alt={firstRow.name}
                width={48}
                height={48}
                className="rounded object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-charcoal truncate">{firstRow.name}</p>
              <p className="text-[11px] text-warm-gray">{firstRow.sku}</p>
            </div>
            <Link
              href={`/products/${firstRow.productSlug}`}
              className="text-[12px] font-semibold text-charcoal underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              Przejdź do produktu →
            </Link>
          </div>
        )}

        <p className="text-[14px] font-semibold text-charcoal leading-relaxed">
          {rec.actionStep.action}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Okno testu
            </span>
            <span className="text-[13px] text-charcoal">{rec.actionStep.testWindow}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
              Metryka sukcesu
            </span>
            <span className="text-[13px] text-charcoal">{rec.actionStep.successMetric}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-charcoal/20 pt-3">
          <p className="text-[12px] text-charcoal">
            <span className="font-semibold text-green-700">✓ Zostaw:</span>{" "}
            {rec.actionStep.keepRule}
          </p>
          <p className="text-[12px] text-charcoal">
            <span className="font-semibold text-warm-gray">↩ Cofnij:</span>{" "}
            {rec.actionStep.revertRule}
          </p>
        </div>
      </section>
    </div>
  );
}
