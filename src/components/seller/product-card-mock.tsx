"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePostHog } from "posthog-js/react";
import { ChevronLeft, Pencil, Info } from "lucide-react";
import type { Product } from "@/types";
import type { SellerRecommendation } from "@/types/seller-dashboard";

interface ProductCardMockProps {
  product: Product | null;
  recommendation: SellerRecommendation | null;
  from: string | null;
  slug: string;
}

// Mock „podgląd i edycja karty produktu" — celowo POZA prototypem AIPH2: to zwykły
// panel zarządzania produktem, nie część testowanego prototypu. Podgląd read-only +
// atrapa „Edytuj" (event WoZ, bez działającego formularza). Naprawia też wcześniejsze
// 404 pod /seller/products/{slug}/edit, do którego linkują oba prototypy.
export function ProductCardMock({ product, recommendation, from, slug }: ProductCardMockProps) {
  const posthog = usePostHog();
  const [editHintShown, setEditHintShown] = useState(false);

  const image = product?.images?.[0] ?? product?.colors?.[0]?.image ?? "";
  const sku = product?.id ?? slug;

  const recNote = recommendation
    ? `Przyszedłeś tu z rekomendacji dla tego produktu: „${recommendation.insightShort}”`
    : from === "returns"
    ? "Przyszedłeś tu z rekomendacji ograniczenia zwrotów dla tego produktu."
    : null;

  const handleEdit = () => {
    posthog?.capture("woz_edit_click", { sku, source: "product-card-mock" });
    setEditHintShown(true);
  };

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-8">
      {/* Wróć do dashboardu */}
      <Link
        href="/seller"
        className="self-start text-[13px] text-charcoal hover:opacity-70 transition-opacity flex items-center gap-1"
      >
        <ChevronLeft size={14} />
        Wróć do dashboardu
      </Link>

      {/* Baner: poza prototypem AIPH2 */}
      <div className="border border-dashed border-black/25 rounded-lg bg-cream-light px-6 py-5 flex flex-col gap-2">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/15 rounded px-2 py-1 bg-cream">
          Poza prototypem AIPH2
        </span>
        <p className="text-[13px] text-warm-gray max-w-[68ch] leading-relaxed">
          To Twój zwykły panel zarządzania produktem — poza zakresem testowanego
          prototypu. Tu normalnie edytujesz kartę produktu (nazwę, cenę, zdjęcia,
          opis).
        </p>
      </div>

      {/* Dyskretny odnośnik do rekomendacji, z której przyszedł sprzedawca */}
      {recNote && (
        <p className="text-[13px] text-warm-gray flex items-start gap-2 -mt-3">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          <span>{recNote}</span>
        </p>
      )}

      {/* Nagłówek */}
      <div className="flex flex-col gap-2">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
          Karta produktu
        </span>
        <h1 className="text-[28px] font-semibold text-charcoal leading-snug">
          {product?.name ?? "Produkt"}
        </h1>
      </div>

      {/* Podgląd karty produktu (read-only) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {image ? (
          <div className="relative aspect-square w-full border border-black/10 rounded-lg overflow-hidden bg-cream-light">
            <Image src={image} alt={product?.name ?? "Produkt"} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-square w-full border border-black/10 rounded-lg bg-black/5" />
        )}

        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light self-start divide-y divide-black/10">
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">SKU</span>
            <p className="text-[14px] font-semibold text-charcoal">{sku}</p>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Kategoria</span>
            <p className="text-[14px] text-charcoal">{product?.productCategory ?? "—"}</p>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Cena</span>
            <p className="text-[14px] font-semibold text-charcoal">
              {product ? `${product.price} zł` : "—"}
            </p>
          </div>
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Opis</span>
            <p className="text-[14px] text-charcoal leading-relaxed">
              {product?.description ?? "Brak opisu produktu."}
            </p>
          </div>
        </div>
      </section>

      {/* Atrapa edycji */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleEdit}
          className="self-start bg-charcoal text-white text-[12px] font-semibold px-4 py-2.5 rounded-md hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <Pencil size={14} />
          Edytuj kartę produktu
        </button>
        {editHintShown && (
          <p className="text-[12px] text-warm-gray italic">
            To wersja demonstracyjna — pełna edycja karty jest poza zakresem
            prototypu AIPH2.
          </p>
        )}
      </div>
    </div>
  );
}
