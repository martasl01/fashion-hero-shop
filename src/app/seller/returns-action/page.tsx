import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check, RotateCcw } from "lucide-react";
import { returnsRecommendation, bartekProductRow } from "@/data/seller-dashboard";
import { bartekReasonsByProductId, bartekReturnsSkus } from "@/data/mock-sku-sales";
import { MetricTile } from "@/components/seller/metric-tile";
import { ReturnReasonsBlock } from "@/components/seller/return-reasons-block";
import { SizeBreakdownTable } from "@/components/seller/size-breakdown-table";
import { ReasonDrivenAction } from "@/components/seller/reason-driven-action";
import { ReturnsProductsTable } from "@/components/seller/returns-products-table";
import { resolveReturnReasons } from "@/lib/return-reasons";

export default function ReturnsActionPage() {
  const rec = returnsRecommendation;

  if (!rec) {
    return (
      <div className="p-8 max-w-5xl flex flex-col gap-6">
        <Link
          href="/seller"
          className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          <ChevronLeft size={14} />
          Wróć do dashboardu
        </Link>
        <p className="text-[14px] text-warm-gray">
          Wszystkie Twoje produkty mają zwroty w normie podkategorii — brak rekomendacji na ten tydzień.
        </p>
      </div>
    );
  }

  const product = rec.primaryProduct;
  const reasonsData = bartekReasonsByProductId[product.sku];
  const resolution = reasonsData ? resolveReturnReasons(reasonsData) : null;
  const skuData = bartekReturnsSkus.find((s) => s.productId === product.sku);
  const subcategory = skuData?.subcategory ?? product.category;
  // ReasonDrivenAction wymaga ReturnsProductRow — używamy bartekProductRow gdy dostępny.
  const productRow = bartekProductRow ?? {
    name: product.name,
    sku: product.sku,
    imageSrc: product.imageSrc,
    yourValue: rec.yourResultTile.value,
    benchmarkValue: rec.benchmarkTile.value,
    difference: rec.affectedProductRows[0]?.difference ?? "",
    returnsCount: 0,
    cena: 0,
    popyt: 0,
  };

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

      {/* Kategoria + h1 + tożsamość produktu */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
            zwroty
          </span>
          <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.title}</h1>
        </div>

        {/* Tożsamość produktu */}
        <div className="flex items-center gap-3.5">
          <Image
            src={product.imageSrc}
            alt={product.name}
            width={56}
            height={56}
            className="rounded-md object-cover flex-shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-semibold text-charcoal">{product.name}</span>
            <span className="text-[13px] text-warm-gray">SKU: {product.sku}</span>
          </div>
        </div>
      </div>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co mówią liczby</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricTile metric={{ id: "result", label: rec.yourResultTile.label, value: rec.yourResultTile.value, sub: rec.yourResultTile.sub }} />
          <MetricTile metric={{ id: "benchmark", label: rec.benchmarkTile.label, value: rec.benchmarkTile.value, sub: rec.benchmarkTile.sub, sample: rec.benchmarkTile.sample }} />
          <MetricTile metric={{ id: "cost", label: rec.financialEffectTile.label, value: rec.financialEffectTile.value, sub: rec.financialEffectTile.sub }} />
        </div>
      </section>

      {/* Dlaczego wraca → rozmiary → co to znaczy → akcja (sterowane top powodem) */}
      {resolution ? (
        <>
          {resolution.mode === "actionable" && (
            <ReturnReasonsBlock reasons={resolution.reasons} sample={resolution.sample} />
          )}
          {resolution.showSizeBreakdown && resolution.sizeBreakdown && (
            <SizeBreakdownTable
              breakdown={resolution.sizeBreakdown}
              comparison={resolution.sizeComparison}
            />
          )}
          {resolution.meaning && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
              <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
                {resolution.meaning}
              </p>
            </section>
          )}
          <ReasonDrivenAction action={resolution.action} product={productRow} />
        </>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
          <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">
            {rec.contextExplanation}
          </p>
        </section>
      )}

      <ReturnsProductsTable rows={[productRow]} subcategory={subcategory} />

      {/* Jak sprawdzić zmianę */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Jak sprawdzić zmianę</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5">
            <p className="text-[14px] text-charcoal leading-relaxed">{rec.actionStep.testWindow}</p>
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
