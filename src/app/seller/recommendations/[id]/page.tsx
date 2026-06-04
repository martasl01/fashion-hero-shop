import Link from "next/link";
import { notFound } from "next/navigation";
import { sellerRecommendations } from "@/data/seller-dashboard";
import { cn } from "@/lib/utils";
import type { RecommendationCategory } from "@/types/seller-dashboard";

const categoryColors: Record<RecommendationCategory, string> = {
  cennik: "bg-blue-50 text-blue-700",
  rentowność: "bg-red-50 text-red-700",
  listing: "bg-amber-50 text-amber-700",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return sellerRecommendations.map((r) => ({ id: r.id }));
}

export default async function RecommendationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const rec = sellerRecommendations.find((r) => r.id === id);

  if (!rec) notFound();

  return (
    <div className="p-8 max-w-2xl flex flex-col gap-8">
      <nav className="text-[12px] text-warm-gray flex items-center gap-1.5">
        <Link href="/seller" className="hover:text-charcoal transition-colors">
          Dashboard
        </Link>
        <span>→</span>
        <span className="text-charcoal">Rekomendacja</span>
      </nav>

      <div className="flex flex-col gap-2">
        <span
          className={cn(
            "self-start text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded",
            categoryColors[rec.category]
          )}
        >
          {rec.category}
        </span>
        <h1 className="text-[20px] font-semibold text-charcoal leading-snug">
          {rec.insightShort}
        </h1>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          Insight
        </h2>
        <p className="text-[14px] text-charcoal leading-relaxed">{rec.insightFull}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
          Produkty których dotyczy
        </h2>
        <ul className="flex flex-col gap-1">
          {rec.affectedProducts.map((p) => (
            <li key={p} className="text-[13px] text-charcoal">
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 border border-charcoal rounded p-5 bg-charcoal/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-charcoal">
          Akcja
        </h2>
        <p className="text-[14px] font-semibold text-charcoal leading-relaxed">{rec.action}</p>
      </section>

      <Link
        href="/seller"
        className="self-start text-[12px] text-warm-gray underline underline-offset-2 hover:text-charcoal transition-colors"
      >
        ← Wróć do dashboardu
      </Link>
    </div>
  );
}
