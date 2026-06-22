import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check, RotateCcw, ArrowRight } from "lucide-react";
import { returnsAction } from "@/data/seller-dashboard";
import { MetricTile } from "@/components/seller/metric-tile";

export default function ReturnsActionPage() {
  const rec = returnsAction;
  const product = rec.products[0];

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
          <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{rec.h1}</h1>
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
            <span className="text-[13px] text-warm-gray">
              SKU: {product.sku}
              <span className="mx-2 text-black/20">|</span>
              Kategoria: {rec.categoryPath}
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
          <MetricTile metric={{ id: "cost", label: rec.costTile.label, value: rec.costTile.value, sub: rec.costTile.sub }} />
        </div>
      </section>

      {/* Co to znaczy */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold text-charcoal">Co to znaczy</h2>
        <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{rec.meaning}</p>
      </section>

      {/* Co możesz zrobić */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          {rec.options.map((option, index) => (
            <div key={option.title}>
              {index > 0 && <div className="border-t border-black/10" />}
              <div className="p-5 flex flex-col gap-1.5">
                <span className="text-[14px] font-semibold text-charcoal flex items-center gap-2">
                  <ArrowRight size={16} className="text-charcoal flex-shrink-0" />
                  {option.title}
                </span>
                <span className="text-[13px] text-warm-gray leading-relaxed pl-6">
                  {option.insight}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Blok SKU */}
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5 flex items-center gap-3.5">
            <Image
              src={product.imageSrc}
              alt={product.name}
              width={48}
              height={48}
              className="rounded-md object-cover flex-shrink-0"
            />
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[14px] font-semibold text-charcoal">{product.name}</span>
              <span className="text-[12px] text-warm-gray">SKU: {product.sku}</span>
            </div>
            <Link
              href={`/seller/products/${product.sku}/edit?from=returns`}
              className="flex items-center gap-1 text-[13px] font-medium text-charcoal border border-black/15 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors flex-shrink-0"
            >
              Przejdź do produktu
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Jak sprawdzić zmianę */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Jak sprawdzić zmianę</h2>
        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light">
          <div className="p-5">
            <p className="text-[14px] text-charcoal leading-relaxed">{rec.verification.testWindow}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <Check size={10} />
                Zostaw
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.verification.keepRule}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray flex items-center gap-1">
                <RotateCcw size={10} />
                Wycofaj
              </span>
              <p className="text-[14px] text-charcoal leading-relaxed">{rec.verification.revertRule}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
