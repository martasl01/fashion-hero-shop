import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, RotateCcw } from "lucide-react";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { MetricTile } from "@/components/seller/metric-tile";
import { AffectedProductsTable } from "@/components/seller/affected-products-table";

const backRoutes: Record<string, string> = {
  "one-action": "/seller/one-action",
  "three-actions": "/seller/three-actions",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export function generateStaticParams() {
  return sellerRecommendations.map((r) => ({ id: r.id }));
}

export default async function RecommendationDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = (from && backRoutes[from]) ?? "/seller";
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
        href={backHref}
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      {/* Kategoria + h1 */}
      <div className="flex flex-col gap-2">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
          {rec.category}
        </span>
        <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.title}</h1>
      </div>

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
            <AffectedProductsTable
              rows={rec.affectedProductRows}
              recId={id}
              productImageMap={productImageMap}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
