import Image from "next/image";
import type { Product } from "@/types";
import type { SellerProductRow, ProductStockStatus } from "@/types/seller-dashboard";
import { cn } from "@/lib/utils";

interface ProductsTableProps {
  products: Product[];
  rows: SellerProductRow[];
}

const statusLabel: Record<ProductStockStatus, string> = {
  active: "Aktywny",
  "low-stock": "Niski stan",
  "out-of-stock": "Brak",
  draft: "Szkic",
};

const statusClass: Record<ProductStockStatus, string> = {
  active: "text-green-700",
  "low-stock": "text-amber-600",
  "out-of-stock": "text-red-600",
  draft: "text-warm-gray",
};

export function ProductsTable({ products, rows }: ProductsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-charcoal">Twoje produkty</h2>
        <div className="border border-black/10 rounded p-8 text-center text-warm-gray text-[14px]">
          Brak produktów do wyświetlenia.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[17px] font-semibold text-charcoal">Twoje produkty</h2>
      <div className="border border-black/10 rounded overflow-hidden bg-cream-light">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-black/10 bg-cream-light">
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px] w-12"></th>
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Produkt</th>
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Cena</th>
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Stan magazynowy</th>
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Status</th>
            <th className="text-left px-4 py-3 font-medium text-warm-gray uppercase tracking-wide text-[11px]">Sprzedaż (30 dni)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const product = products.find((p) => p.id === row.productId);
            if (!product) return null;
            const image = product.images[0] ?? product.colors[0]?.image ?? "";
            return (
              <tr key={row.productId} className="border-b border-black/10 last:border-b-0 hover:bg-cream-light/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 relative rounded overflow-hidden bg-cream flex-shrink-0">
                    {image && (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-charcoal">{product.name}</td>
                <td className="px-4 py-3 text-price">{product.price} zł</td>
                <td className="px-4 py-3 text-charcoal">{row.stock} szt.</td>
                <td className={cn("px-4 py-3 font-medium", statusClass[row.status])}>
                  {statusLabel[row.status]}
                </td>
                <td className="px-4 py-3 text-charcoal">{row.sales30d}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
