import type { ReturnsSkuInput, ReturnReasonsData } from "@/types/seller-dashboard";

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
  { productId: "307", skuName: "Buty Skate", sprzedaz30d: 54, rr: 0.61, rrMediana: 0.27, n: 88, nPodkat: 18, kosztZwrotow: 5338, powod: "rozmiar", udzialPowodu: 0.58 },
  // MF-312 Sneakersy Court → KEEP (RR 22% w normie podkategorii, odchylenie < 8pp).
  { productId: "312", skuName: "Sneakersy Court", sprzedaz30d: 41, rr: 0.22, rrMediana: 0.24, n: 63, nPodkat: 14, kosztZwrotow: 710, powod: "jakosc", udzialPowodu: 0.30 },
  // MF-355 Mokasyny Soft → REKO Wygląd (RR 49% vs 20%, +29pp; powód=wygląd; n≥20 ok).
  { productId: "355", skuName: "Mokasyny Soft", sprzedaz30d: 22, rr: 0.49, rrMediana: 0.20, n: 77, nPodkat: 11, kosztZwrotow: 2907, powod: "wyglad", udzialPowodu: 0.47 },
];

// Obrazki per SKU Bartka (poza products.ts).
export const bartekImageSrcByProductId: Record<string, string> = {
  "307": "/images/products/product-8.jpg",
  "312": "/images/products/product-9.jpg",
  "355": "/images/products/product-10.jpg",
};

// Powody zwrotu per SKU — źródło drill-downu na stronie returns-action.
// Tylko REKO (307, 355); KEEP (312) nie potrzebuje tych danych.
export const bartekReasonsByProductId: Record<string, ReturnReasonsData> = {
  // MF-307 Botki Chelsea — rozmiar dominuje (58%), siatka za duża → "za_male"
  "307": {
    reasons: [
      { code: "rozmiar", label: "Niedopasowanie rozmiaru", sharePct: 74, returnsCount: 51 },
    ],
    sample: {
      returnsWithReason: 69,
      totalReturns: 88,
      windowDays: 90,
      sourceLabel: "komentarzy kupujących na FashionHero (klasyfikacja automatyczna)",
    },
    sizeBreakdown: {
      rows: [
        { size: "36", returns: 3, sold: 24, ratePct: 13, high: false },
        { size: "37", returns: 16, sold: 20, ratePct: 80, high: false },
        { size: "38", returns: 20, sold: 26, ratePct: 77, high: false },
        { size: "39", returns: 12, sold: 18, ratePct: 67, high: false },
      ],
      gridDirection: "up",
      diagnosis: "Siatka leci za duża — kupujące biorą swój rozmiar i dostają za mały.",
      sample: {
        returnsWithReason: 51,
        totalReturns: 88,
        windowDays: 90,
        sourceLabel: "sprzedaży per rozmiar i 51 zwrotów z powodem 'rozmiar'",
      },
    },
  },
  // MF-355 Mokasyny Soft — wygląd dominuje (47%), niezgodnosc_z_opisem → "2c"
  "355": {
    reasons: [
      { code: "niezgodnosc_z_opisem", label: "Wygląd niezgodny z opisem", sharePct: 47, returnsCount: 36 },
      { code: "kolor", label: "Kolor inny niż na zdjęciu", sharePct: 22, returnsCount: 17 },
    ],
    sample: {
      returnsWithReason: 53,
      totalReturns: 77,
      windowDays: 90,
      sourceLabel: "komentarzy kupujących na FashionHero (klasyfikacja automatyczna)",
    },
  },
};
