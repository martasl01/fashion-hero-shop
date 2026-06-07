import { notFound } from "next/navigation";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { products } from "@/data/products";
import { ProductPageClient } from "@/components/seller/product-page-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ recId?: string; sku?: string }>;
}

const actionableRows = sellerRecommendations.flatMap((rec) => rec.affectedProductRows);

export function generateStaticParams() {
  const slugs = [...new Set(actionableRows.map((row) => row.productSlug))];
  return slugs.map((slug) => ({ slug }));
}

export default async function SellerProductPreviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { recId, sku } = await searchParams;

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const recommendation = recId
    ? (sellerRecommendations.find((r) => r.id === recId) ?? null)
    : null;

  const row = sku
    ? (actionableRows.find((r) => r.sku === sku && r.productSlug === slug) ?? null)
    : (actionableRows.find((r) => r.productSlug === slug) ?? null);

  return (
    <ProductPageClient
      product={product}
      row={row}
      recommendation={recommendation}
      recId={recId ?? null}
    />
  );
}
