import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, RotateCcw, ArrowRight } from "lucide-react";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { MetricTile } from "@/components/seller/metric-tile";
import { AffectedProductsTable } from "@/components/seller/affected-products-table";
import { PriceGapEvidence } from "@/components/seller/price-gap-evidence";
import { resolvePriceGap } from "@/lib/price-gap";

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

  // Slot „Dlaczego ta cena to luka" — tylko cennik. Brak dowodu (świeża cena /
  // środek rozkładu) → slot nie renderuje, a rekomendacja jest stonowana.
  const priceGap =
    rec.category === "cennik" && rec.priceGapData ? resolvePriceGap(rec.priceGapData) : null;

  const primaryProductImage =
    rec.primaryProduct.imageSrc ||
    (() => {
      const p = products.find((prod) => prod.slug === rec.primaryProduct.productSlug);
      return p?.colors[0]?.image ?? p?.images?.[0];
    })();

  // Mapa obrazków dla tabeli SKU objętych rekomendacją (po productSlug).
  const productImageMap: Record<string, string | undefined> = Object.fromEntries(
    rec.affectedProductRows.map((r) => {
      const p = products.find((prod) => prod.slug === r.productSlug);
      return [r.productSlug, p?.colors[0]?.image ?? p?.images?.[0]];
    }),
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

      {/* Nagłówek + tag */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
            {rec.category}
          </span>
          <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.title}</h1>
        </div>

        {/* Nagłówek produktu */}
        <div className="flex items-center gap-3.5">
          {primaryProductImage && (
            <Image
              src={primaryProductImage}
              alt={rec.primaryProduct.name}
              width={56}
              height={56}
              className="rounded-md object-cover flex-shrink-0"
            />
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-semibold text-charcoal">{rec.primaryProduct.name}</span>
            <span className="text-[13px] text-warm-gray">
              SKU: {rec.primaryProduct.sku}
              <span className="mx-2 text-black/20">|</span>
              Kategoria: {rec.primaryProduct.category}
            </span>
          </div>
        </div>
      </div>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[17px] font-semibold text-charcoal">Co mówią liczby</h2>
          {rec.metricsTimeNote && (
            <p className="text-[13px] text-warm-gray">{rec.metricsTimeNote}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricTile metric={{ id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value, sub: rec.yourResultTile.sub }} />
          <MetricTile metric={{ id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value, sub: rec.benchmarkTile.sub, sample: rec.benchmarkTile.sample }} />
          <MetricTile metric={{ id: "effect", label: rec.financialEffectTile.label, value: rec.financialEffectTile.value, sub: rec.financialEffectTile.sub }} />
        </div>
      </section>

      {/* Dlaczego ta cena to luka (tylko cennik, gdy są sygnały dowodowe) */}
      {priceGap?.hasEvidence && (
        <PriceGapEvidence stagnation={priceGap.stagnation} distribution={priceGap.distribution} />
      )}

      {/* Co to znaczy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
        <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{rec.contextExplanation}</p>
      </section>

      {/* Co możesz zrobić */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>

        {/* Brak dowodu luki → rekomendacja stonowana, bez nacisku na podwyżkę */}
        {priceGap && !priceGap.hasEvidence && (
          <p className="text-[13px] text-warm-gray leading-relaxed">
            Nie widzimy dowodu, że to zapomniana cena — możliwe, że to świadomy wybór. Potraktuj
            podwyżkę jako opcjonalny test, nie pewną lukę.
          </p>
        )}

        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[14px] font-semibold text-charcoal flex items-center gap-2">
              <ArrowRight size={16} className="text-charcoal flex-shrink-0" />
              {rec.actionStep.action}
            </span>
            {rec.actionStep.actionInsight && (
              <span className="text-[13px] text-warm-gray leading-relaxed pl-6">
                {rec.actionStep.actionInsight}
              </span>
            )}
          </div>
        </div>

        {/* Tabela SKU objętych rekomendacją — dla cennika z kolumną popytu;
            dla pozostałych kategorii pojedynczy blok SKU bez zmian. */}
        {rec.category === "cennik" ? (
          <AffectedProductsTable
            rows={rec.affectedProductRows}
            recId={rec.id}
            productImageMap={productImageMap}
          />
        ) : (
          <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
            <div className="p-5 flex items-center gap-3.5">
              {primaryProductImage && (
                <Image
                  src={primaryProductImage}
                  alt={rec.primaryProduct.name}
                  width={48}
                  height={48}
                  className="rounded-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[14px] font-semibold text-charcoal">{rec.primaryProduct.name}</span>
                <span className="text-[12px] text-warm-gray">SKU: {rec.primaryProduct.sku}</span>
              </div>
              <Link
                href={`/seller/products/${rec.primaryProduct.productSlug}/edit`}
                className="flex items-center gap-1 text-[13px] font-medium text-charcoal border border-black/15 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors flex-shrink-0"
              >
                Przejdź do produktu
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Jak sprawdzić zmianę */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Jak sprawdzić zmianę</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5">
            <p className="text-[14px] text-charcoal leading-relaxed">
              Okno testu: <span className="font-semibold">{rec.actionStep.testWindow}</span>
            </p>
            <p className="text-[14px] text-charcoal leading-relaxed mt-1">
              Metryka sukcesu: {rec.actionStep.successMetric}
            </p>
          </div>

          <div className="border-t border-black/10" />

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
        </div>
      </section>
    </div>
  );
}
