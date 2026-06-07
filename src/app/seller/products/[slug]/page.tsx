import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const actionableRows = sellerRecommendations.flatMap((rec) => rec.affectedProductRows);

export function generateStaticParams() {
  const slugs = [...new Set(actionableRows.map((row) => row.productSlug))];
  return slugs.map((slug) => ({ slug }));
}

export default async function SellerProductPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  // Dane wiersza rekomendacji (SKU, kategoria marketplace, cena sprzedawcy) — spójne z tabelą akcji
  const row = actionableRows.find((r) => r.productSlug === slug);
  const image = product.colors[0]?.image ?? product.images?.[0];

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

      {/* Kategoria + h1 */}
      <div className="flex flex-col gap-2">
        <span className="self-start text-[10px] font-semibold uppercase tracking-widest text-warm-gray border border-black/10 rounded px-2 py-1 bg-cream-light">
          Podgląd produktu
        </span>
        <h1 className="text-[28px] font-semibold text-charcoal leading-snug">{product.name}</h1>
      </div>

      {/* Podgląd */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {image ? (
          <div className="relative aspect-square w-full border border-black/10 rounded-lg overflow-hidden bg-cream-light">
            <Image src={image} alt={product.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-square w-full border border-black/10 rounded-lg bg-black/5" />
        )}

        <div className="border border-black/10 rounded-xl overflow-hidden bg-cream-light self-start">
          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">SKU</span>
            <p className="text-[14px] font-semibold text-charcoal">{row?.sku ?? product.id}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Kategoria</span>
            <p className="text-[14px] text-charcoal">{row?.category ?? product.productCategory}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Cena</span>
            <p className="text-[14px] font-semibold text-charcoal">{row?.price ?? `${product.price} zł`}</p>
          </div>

          <div className="border-t border-black/10" />

          <div className="p-5 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">Opis</span>
            <p className="text-[14px] text-charcoal leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t border-black/10" />

          {/* Edycja — atrapa, podstrona SKU nie jest w pełni klikalna w tym prototypie */}
          <div className="p-5">
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-charcoal text-white text-[12px] font-semibold px-4 py-2.5 rounded-md hover:opacity-80 transition-opacity"
            >
              <Pencil size={12} />
              Edytuj produkt
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
