import { CheckCircle } from "lucide-react";

export function ActionDoneBanner() {
  return (
    <div className="flex items-start gap-3 border border-black/10 rounded-xl px-5 py-4 bg-cream-light">
      <CheckCircle size={18} className="text-charcoal shrink-0 mt-0.5" />
      <div>
        <p className="text-[14px] font-semibold text-charcoal">Akcja wykonana</p>
        <p className="text-[12px] text-warm-gray mt-0.5">
          Śledź wyniki sprzedaży, żeby sprawdzić efekty zmian.{" "}
          <span className="underline underline-offset-2 cursor-not-allowed opacity-50">
            Śledź wyniki →
          </span>
        </p>
      </div>
    </div>
  );
}
