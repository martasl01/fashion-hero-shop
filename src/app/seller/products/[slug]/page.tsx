import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Kanoniczny ekran produktu to mock „poza prototypem AIPH2" pod /edit. Stary
// preskryptywny flow „208 zł" został wycofany — tu tylko przekierowujemy, zachowując
// ewentualne parametry (recId/from), żeby odnośnik do rekomendacji zadziałał.
export default async function SellerProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(sp).flatMap(([key, value]) =>
      value === undefined
        ? []
        : Array.isArray(value)
        ? value.map((v) => [key, v] as [string, string])
        : [[key, value] as [string, string]]
    )
  ).toString();
  redirect(`/seller/products/${slug}/edit${qs ? `?${qs}` : ""}`);
}
