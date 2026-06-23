import type { ReturnsSkuInput } from "@/types/seller-dashboard";

// ───────────────────────────────────────────────────────────────────────────
// MOCK SPRZEDAŻY/ZWROTÓW SKU — źródło danych do prototypu Bartka (FashionHero)
//
// Źródło prawdy (spec designu):
//   ~/Documents/super-brain-main/3-Projects/fashion-hero/data/
//     mock-sprzedaz-sku-dorota-bartek.xlsx (arkusz „Bartek_zwroty")
//
// Dane fikcyjne, ale realistyczne i spójne z prototypem. Każdy wiersz = 1 SKU.
// Kolumny odpowiadają DOKŁADNIE polom konsumowanym przez silnik zwrotów.
// Projekt nie ładuje plików w runtime (dane = pliki TS), więc Excel jest tu
// przepisany ręcznie — przy zmianie speca zaktualizuj OBA miejsca.
//
// Bartek (MF-307/312/355) nie ma wpisów w products.ts — dane są samowystarczalne
// (nazwa SKU trzymana w danych, brak mapowania do katalogu).
//
// ── Słownik pól (arkusz „Slownik_pol") ─────────────────────────────────────
//   sprzedaz30d     Sztuk / 30 dni — ŹRÓDŁO sygnału popytu przy SKU.
//   rr              Return rate SKU (udział zwrotów, 0–1).
//   rrMediana       Mediana RR w podkategorii (0–1).
//   n               Liczba zamówień SKU (wiarygodność RR).
//   nPodkat         Liczba ofert w benchmarku (wiarygodność mediany).
//   kosztZwrotow    Szacowany koszt zwrotów SKU (zł) — strata Bartka, nie platformy.
//   powod           Dominujący powód zwrotu: rozmiar / wyglad / jakosc / null.
//   udzialPowodu    Udział głównego powodu (0–1); musi ≥ 0,40 by zostać uznany.
// ───────────────────────────────────────────────────────────────────────────

// ── BARTEK — sprzedaż i zwroty per SKU (wejście do silnika zwrotów) ──────────
// Progi silnika: odchylenie RR ≥ +8pp od mediany; n ≥ 20 zamówień; nPodkat ≥ 8;
// udzialPowodu ≥ 0,40. RR w normie → KEEP (karta się nie renderuje).
export const bartekReturnsSkus: ReturnsSkuInput[] = [
  // MF-307 Botki Chelsea → REKO Rozmiar (RR 61% vs mediana 27%, +34pp; rozmiar dominuje).
  { productId: "307", skuName: "Botki Chelsea", sprzedaz30d: 54, rr: 0.61, rrMediana: 0.27, n: 88, nPodkat: 18, kosztZwrotow: 5338, powod: "rozmiar", udzialPowodu: 0.58 },
  // MF-312 Sneakersy Court → KEEP (RR 22% w normie podkategorii, odchylenie < 8pp).
  { productId: "312", skuName: "Sneakersy Court", sprzedaz30d: 41, rr: 0.22, rrMediana: 0.24, n: 63, nPodkat: 14, kosztZwrotow: 710, powod: "jakosc", udzialPowodu: 0.30 },
  // MF-355 Mokasyny Soft → REKO Wygląd (RR 49% vs 20%, +29pp; powód=wygląd; n≥20 ok).
  { productId: "355", skuName: "Mokasyny Soft", sprzedaz30d: 22, rr: 0.49, rrMediana: 0.20, n: 77, nPodkat: 11, kosztZwrotow: 2907, powod: "wyglad", udzialPowodu: 0.47 },
];
