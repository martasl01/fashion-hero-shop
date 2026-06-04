"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/seller", active: true },
  { label: "Produkty", href: null },
  { label: "Zamówienia", href: null },
  { label: "Zwroty", href: null },
  { label: "Ustawienia", href: null },
];

export function SellerSidebar({ sellerName }: { sellerName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 border-r border-black/10 bg-cream-light min-h-screen flex flex-col">
      <div className="px-5 py-6 border-b border-black/10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-warm-gray block mb-1">
          Panel sprzedawcy
        </span>
        <span className="text-[15px] font-semibold text-charcoal">{sellerName}</span>
      </div>
      <nav className="flex flex-col gap-0.5 py-4 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href !== null && pathname === item.href;
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-[13px] px-3 py-2 rounded transition-colors",
                  isActive
                    ? "bg-charcoal text-white font-medium"
                    : "text-charcoal hover:bg-black/5"
                )}
              >
                {item.label}
              </Link>
            );
          }
          return (
            <span
              key={item.label}
              className="text-[13px] px-3 py-2 rounded text-warm-gray cursor-default"
              aria-disabled="true"
            >
              {item.label}
            </span>
          );
        })}
      </nav>
    </aside>
  );
}
