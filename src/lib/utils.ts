import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BenchmarkSample } from "@/types/seller-dashboard"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mikrokopia liczności próby pod wartością benchmarku zewnętrznego.
// np. "mediana z 14 sprzedawców (24 podobne produkty) w podkategorii «klapki i japonki», 90 dni"
export function formatBenchmarkSample(sample: BenchmarkSample): string {
  const { sellers, products, granularity, windowDays = 90, escalated } = sample
  const sellersLabel = sellers === 1 ? "sprzedawcy" : "sprzedawców"
  const base = `mediana z ${sellers} ${sellersLabel} (${products} ${pluralizeProducts(
    products
  )}) w ${granularity}, ${windowDays} dni`
  return escalated ? `${base} — policzono o poziom wyżej` : base
}

// Odmiana "produkt" po liczbie (PL): 1 → podobny produkt, 2-4 → podobne produkty,
// 5+ i końcówki 12-14 → podobnych produktów.
function pluralizeProducts(n: number): string {
  if (n === 1) return "podobny produkt"
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "podobne produkty"
  return "podobnych produktów"
}
