"use client";
import Image from "next/image";
import { HelpCircle, Pencil } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import type {
  ReasonDrivenAction as ReasonAction,
  ReturnsProductRow,
} from "@/types/seller-dashboard";

interface ReasonDrivenActionProps {
  action: ReasonAction;
  product: ReturnsProductRow;
  hideProductCard?: boolean;
}

// Akcja „Co możesz zrobić" sterowana top powodem zwrotu. Atrapa „edytuj" na karcie SKU
// rejestruje intencję (event PostHog), nie prowadzi do realnej edycji ani potwierdzenia.
// kind="no_fix" → bez karty SKU (nie ma czego naprawiać).
// kind="diagnostic" → wariant „nie wiemy jeszcze" (dashed empty-state, nie zgadujemy).
export function ReasonDrivenAction({ action, product, hideProductCard = false }: ReasonDrivenActionProps) {
  const posthog = usePostHog();

  const handleEdit = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!action.wozEvent) return;
    posthog?.capture(action.wozEvent, {
      sku: product.sku,
      source: "returns-action",
      reason_action_kind: action.kind,
    });
  };

  if (action.kind === "diagnostic") {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>
        <div className="border border-dashed border-black/20 rounded-xl bg-cream-light px-6 py-10 flex flex-col items-center text-center gap-3">
          <HelpCircle size={20} className="text-warm-gray" />
          <h3 className="text-[15px] font-semibold text-charcoal">{action.title}</h3>
          <p className="text-[13px] text-warm-gray max-w-sm leading-relaxed">{action.insight}</p>
          {action.ctaLabel && (
            <a
              href="#"
              onClick={handleEdit}
              className="inline-block bg-charcoal text-white text-[12px] font-semibold whitespace-nowrap px-3 py-2 rounded-md hover:opacity-80 transition-opacity"
            >
              {action.ctaLabel}
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[17px] font-semibold text-charcoal">Co możesz zrobić</h2>

      {/* Opis akcji z lewym akcentem */}
      <div className="border-l-2 border-charcoal pl-4 flex flex-col gap-1.5">
        <p className="text-[14px] text-charcoal leading-relaxed max-w-prose">{action.insight}</p>
        {action.quote && (
          <p className="text-[14px] italic text-warm-gray leading-relaxed max-w-prose">
            {action.quote}
          </p>
        )}
      </div>

      {/* Karta SKU z atrapą „edytuj" — pomijana dla no_fix i gdy zastępuje ją tabela */}
      {!hideProductCard && action.kind !== "no_fix" && (
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
              <span className="text-[12px] text-warm-gray">
                {product.yourValue} RR · {product.difference} vs benchmark
              </span>
            </div>
            <a
              href="#"
              onClick={handleEdit}
              className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal border border-black/15 rounded-lg px-3 py-2 hover:bg-black/5 transition-colors flex-shrink-0"
            >
              edytuj
              <Pencil size={13} />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
