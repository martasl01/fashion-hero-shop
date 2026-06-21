import Link from "next/link";
import Image from "next/image";
import { TrendingDown } from "lucide-react";
import { returnsAction } from "@/data/seller-dashboard";

const product = returnsAction.products[0];

// Chip „Akcja na ten tydzień” dla bartek-type (wariant zwrotów). Mirror designu
// widgetu/karty z dorota-type, ale cała karta jest klikalnym linkiem do podstrony
// karty akcji. Osobny komponent, by nie ruszać flow dorota-type.
export function BartekActionWidget() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest bg-charcoal text-white px-2 py-0.5 rounded">
            Nowość
          </span>
          <h2 className="text-[17px] font-semibold text-charcoal">Akcja na ten tydzień</h2>
        </div>
        <p className="text-[13px] text-warm-gray max-w-[65ch]">
          Ty decydujesz, co zmienić – my tylko liczymy. Co tydzień pokażemy Ci jedną akcję
          opartą na danych z Twojego sklepu, żeby z tej samej sprzedaży zostawało Ci więcej.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/seller/returns-action"
          className="flex flex-col gap-3 bg-cream-light border border-black/10 rounded p-5 hover:border-charcoal transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
            <TrendingDown size={13} />
            zwroty
          </span>
          <h3 className="text-[16px] font-semibold text-charcoal leading-snug">
            {returnsAction.chipTitle}
          </h3>
          <div className="flex items-center gap-2.5">
            <Image
              src={product.imageSrc}
              alt={product.name}
              width={40}
              height={40}
              className="rounded-md object-cover flex-shrink-0"
            />
            <span className="text-[11px] text-warm-gray">SKU: {product.sku}</span>
          </div>
          <p className="text-[12px] text-warm-gray leading-relaxed flex-1">
            {returnsAction.chipInsight}
          </p>
          <span className="self-start text-[12px] font-semibold text-charcoal underline underline-offset-2">
            {returnsAction.chipCta} →
          </span>
        </Link>
      </div>
    </div>
  );
}
