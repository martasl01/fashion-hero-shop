"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface PriceEditDialogProps {
  sku: string;
  category: string;
  currentPrice: string;
  suggestedPrice: string;
  productName: string;
  onSave: (newPrice: number) => void;
  onCancel: () => void;
}

export function PriceEditDialog({
  sku,
  category,
  currentPrice,
  suggestedPrice,
  productName,
  onSave,
  onCancel,
}: PriceEditDialogProps) {
  const suggested = parseInt(suggestedPrice.replace(/[^\d]/g, ""), 10) || 0;
  const [value, setValue] = useState(String(suggested));

  const handleSave = () => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) onSave(num);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <div>
            <h3 className="text-[16px] font-semibold text-charcoal">Zmień cenę</h3>
            <p className="text-[12px] text-warm-gray mt-0.5">{productName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-warm-gray hover:text-charcoal transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-0 border-b border-black/10">
          <ReadonlyField label="SKU" value={sku} />
          <ReadonlyField label="Kategoria" value={category} />
          <ReadonlyField label="Aktualna cena" value={currentPrice} />
        </div>

        <div className="p-5 flex flex-col gap-2 border-b border-black/10">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray">
            Nowa cena
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-black/20 rounded-md px-3 py-2.5 text-[14px] font-semibold text-charcoal w-32 focus:outline-none focus:border-charcoal"
            />
            <span className="text-[14px] text-warm-gray">zł</span>
          </div>
        </div>

        <div className="p-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[13px] font-semibold text-warm-gray hover:text-charcoal transition-colors px-4 py-2.5"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-charcoal text-white text-[13px] font-semibold px-5 py-2.5 rounded-md hover:opacity-80 transition-opacity"
          >
            Zapisz zmianę
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
      <span className="text-[12px] text-warm-gray">{label}</span>
      <span className="text-[13px] font-semibold text-charcoal">{value}</span>
    </div>
  );
}
