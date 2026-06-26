"use client";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Circle } from "lucide-react";
import type { ReactNode } from "react";
import type { SellerRecommendation } from "@/types/seller-dashboard";
import type { CheckboxAction } from "@/components/seller/checkbox-actions";
import { useCheckboxState } from "@/hooks/use-checkbox-state";
import { stateKeyForSku } from "@/lib/action-state-key";

interface ActionTeaserWidgetProps {
  // Rekomendacja tygodnia (cennik / zwroty). null → empty state.
  recommendation: SellerRecommendation | null;
  // Wyrenderowany element ikony (np. <Tag size={13} />). Element, nie komponent —
  // funkcji nie można przekazać przez granicę Server → Client Component.
  icon: ReactNode;
  label: string; // „cennik" / „zwroty"
  href: string; // strona formatki, np. /seller/pricing-action
  // Lista akcji formatki — jedyne źródło liczby kroków w liczniku „Wykonano X z N".
  actions: CheckboxAction[];
  emptyMessage: string;
}

// Kafel „Akcja na ten tydzień" na dashboardzie sellera. Jeden komponent dla obu
// wariantów prototypu (Dorota / Bartek) — różni je tylko ikona, label, href i źródło
// danych podane w propsach. Licznik kroków liczy z `actions.length`, więc trzyma się
// w synchronie z checklistą na stronie formatki (współdzieloną przez @/data/seller-actions).
export function ActionTeaserWidget({
  recommendation,
  icon,
  label,
  href,
  actions,
  emptyMessage,
}: ActionTeaserWidgetProps) {
  const sku = recommendation?.primaryProduct.sku ?? "";
  const stateKey = stateKeyForSku(sku);
  const { checkedCount } = useCheckboxState(stateKey);
  const actionsTotal = actions.length;

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
      {recommendation ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href={href}
            className="flex flex-col gap-3 bg-cream-light border border-black/10 rounded p-5 hover:border-charcoal transition-colors"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-warm-gray">
              {icon}
              {label}
            </span>
            <h3 className="text-[16px] font-semibold text-charcoal leading-snug">
              {recommendation.title}
            </h3>
            <div className="flex items-center gap-2.5">
              <Image
                src={recommendation.primaryProduct.imageSrc}
                alt={recommendation.primaryProduct.name}
                width={40}
                height={40}
                className="rounded-md object-cover flex-shrink-0"
              />
              <span className="text-[11px] text-warm-gray">SKU: {recommendation.primaryProduct.sku}</span>
            </div>
            <p className="text-[12px] text-warm-gray leading-relaxed flex-1">
              {recommendation.insightShort}
            </p>
            <div className="flex items-center gap-1.5">
              {checkedCount > 0
                ? <CheckCircle2 size={14} className="text-[#16a34a] flex-shrink-0" />
                : <Circle size={14} className="text-black/20 flex-shrink-0" />
              }
              <span className="text-[11px] text-warm-gray">
                Wykonano {checkedCount} z {actionsTotal}
              </span>
            </div>
          </Link>
        </div>
      ) : (
        <p className="text-[13px] text-warm-gray">{emptyMessage}</p>
      )}
    </div>
  );
}
