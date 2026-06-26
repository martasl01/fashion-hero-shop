import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import type { PrimaryProduct, SellerMetric } from "@/types/seller-dashboard";
import { MetricTile } from "@/components/seller/metric-tile";
import { PrototypeSurveyBox } from "@/components/seller/prototype-survey-box";

interface ActionPageShellProps {
  categoryLabel: string; // badge nad tytułem: „cennik" / „zwroty"
  title: string;
  product: PrimaryProduct;
  metrics: SellerMetric[]; // 3 kafle sekcji „Co mówią liczby"
  surveyVariant: "dorota" | "bartek";
  // Unikalny środek formatki (opis problemu / wyjaśnienie, karta „Co możesz zrobić",
  // sekcja „Jak sprawdzić zmianę") — wstrzykiwany między grid metryk a ankietę.
  children: ReactNode;
}

// Wspólny szkielet formatek sellera (pricing-action / returns-action). Renderuje
// stabilną oprawę: powrót, nagłówek z tożsamością produktu, sekcję metryk i ankietę
// na końcu. Wszystko, co różni warianty, trafia jako `children` — dzięki temu zmiana
// oprawy dzieje się w jednym miejscu, a strony nie rozjeżdżają się przez kopiowanie.
export function ActionPageShell({
  categoryLabel,
  title,
  product,
  metrics,
  surveyVariant,
  children,
}: ActionPageShellProps) {
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
            {categoryLabel}
          </span>
          <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{title}</h1>
        </div>
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
            <div className="flex items-center gap-2 text-[13px] text-warm-gray">
              <span>SKU: {product.sku}</span>
              {product.category && (
                <>
                  <span className="text-black/20">·</span>
                  <span>{product.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Co mówią liczby */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co mówią liczby</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <MetricTile key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {children}

      <PrototypeSurveyBox wariant={surveyVariant} />
    </div>
  );
}
