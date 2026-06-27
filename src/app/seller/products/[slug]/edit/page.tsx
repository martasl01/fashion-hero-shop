import { sellerRecommendations, returnsAction, resolveBartekProductCard } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { ProductCardMock } from "@/components/seller/product-card-mock";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ recId?: string; from?: string }>;
}

export function generateStaticParams() {
  // Slug realny (Dorota) + SKU=id produktu (Bartek linkuje product.sku). Pozostałe
  // i tak renderują się on-demand (dynamicParams domyślnie true).
  const slugs = new Set<string>(products.map((p) => p.slug));
  returnsAction.products.forEach((p) => slugs.add(p.sku));
  return [...slugs].map((slug) => ({ slug }));
}

export default async function SellerProductEditMockPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { recId, from } = await searchParams;

  // slug może być realnym slugiem albo SKU = id produktu
  const product =
    products.find((p) => p.slug === slug) ?? products.find((p) => p.id === slug) ?? null;

  // SKU zwrotowe Bartka (307/312/355) nie istnieją w products.ts — dane karty bierzemy
  // z mocków zwrotów, żeby strona edycji nie pokazywała pustej karty.
  const fallback = product ? null : resolveBartekProductCard(slug);

  const recommendation = recId
    ? (sellerRecommendations.find((r) => r.id === recId) ?? null)
    : null;

  return (
    <ProductCardMock
      product={product}
      fallback={fallback}
      recommendation={recommendation}
      from={from ?? null}
      slug={slug}
    />
  );
}
