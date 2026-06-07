"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionDoneDialogProps {
  ctaLabel: string;
  productName: string;
  oldPrice: string;
  newPrice: number;
}

export function ActionDoneDialog({
  ctaLabel,
  productName,
  oldPrice,
  newPrice,
}: ActionDoneDialogProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl text-center p-8 flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center">
          <Check size={22} className="text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[18px] font-semibold text-charcoal">Akcja wykonana</h3>
          <p className="text-[13px] text-warm-gray leading-relaxed">
            <span className="font-semibold text-charcoal">&bdquo;{ctaLabel}&rdquo;</span> zostało zastosowane
            dla produktu{" "}
            <span className="font-semibold text-charcoal">{productName}</span>.
          </p>
          <p className="text-[15px] font-semibold text-charcoal mt-1">
            {oldPrice} → {newPrice} zł
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/seller")}
          className="w-full bg-charcoal text-white text-[13px] font-semibold px-5 py-3 rounded-md hover:opacity-80 transition-opacity"
        >
          Przejdź do dashboardu
        </button>
      </div>
    </div>
  );
}
