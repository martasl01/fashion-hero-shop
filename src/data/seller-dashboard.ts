import type { SellerMetric, TimeRangeOption, SellerProductRow, SellerRecommendation } from "@/types/seller-dashboard";

export const DASHBOARD_SELLER_ID = "s13";

export const sellerMetrics: SellerMetric[] = [
  { id: "revenue", label: "Przychód", value: "28 200 zł" },
  { id: "orders", label: "Liczba zamówień", value: "130" },
  { id: "returns", label: "Zwroty", value: "27", sub: "RR 20,8%" },
];

export const timeRangeOptions: TimeRangeOption[] = [
  { value: "week", label: "Ostatni tydzień" },
  { value: "month", label: "Ostatni miesiąc" },
  { value: "quarter", label: "Ostatni kwartał" },
  { value: "year", label: "Ostatni rok" },
  { value: "all", label: "Wszystkie dane" },
];

export const sellerProductRows: SellerProductRow[] = [
  { productId: "201", stock: 24, status: "active", sales30d: 18 },
  { productId: "202", stock: 4, status: "low-stock", sales30d: 7 },
  { productId: "203", stock: 0, status: "out-of-stock", sales30d: 12 },
];

export const sellerRecommendations: SellerRecommendation[] = [
  {
    id: "1",
    category: "cennik",
    title: "Twoje ceny są poniżej mediany kategorii",
    insightShort: "Mediana kategorii Buty: 215 zł. Twoja średnia: 189 zł (−12%). Masz przestrzeń na podwyżkę.",
    ctaLabel: "Podnieś ceny",
    insightFull: "Mediana ceny w kategorii Buty to 215 zł. Twój Urban Slip-On kosztuje 189 zł — to o 12% poniżej mediany. Produkty w tej cenie sprzedają się 18 razy w miesiącu, więc podwyżka nie powinna zatrzymać popytu.",
    affectedProducts: ["Urban Slip-On (SKU-201)"],
    action: "Podnieś cenę Urban Slip-On o 5% — z 189 zł do 198 zł.",
  },
  {
    id: "2",
    category: "rentowność",
    title: "Zwroty zjadają marżę na Kopertowej Midi",
    insightShort: "Kopertowa Midi: zwroty 41%, mediana kategorii 14%. Każda sprzedaż generuje stratę −12 zł.",
    ctaLabel: "Wycofaj produkt",
    insightFull: "W kategorii Sukienki mediana zwrotów to 14%. Kopertowa Midi ma 41% zwrotów. Przy koszcie zwrotu 15 zł i prowizji 44 zł — każda sprzedaż tego modelu dokłada do interesu −12 zł netto.",
    affectedProducts: ["Kopertowa Midi (SKU-202)"],
    action: "Wycofaj Kopertową Midi ze sprzedaży lub zmień główne zdjęcie produktu na dokładnie oddające fason.",
  },
  {
    id: "3",
    category: "listing",
    title: "MF Classic Runner wypadł z wyszukiwarki",
    insightShort: "MF Classic Runner: 0 szt. w magazynie, 12 sprzedaży w ostatnim miesiącu. Tracisz przychód.",
    ctaLabel: "Uzupełnij stan",
    insightFull: "MF Classic Runner sprzedał się 12 razy w ostatnim miesiącu, ale magazyn jest pusty. Przy braku towaru produkt znika z wyników wyszukiwania, co obniża widoczność całego Twojego sklepu.",
    affectedProducts: ["MF Classic Runner (SKU-203)"],
    action: "Uzupełnij stan magazynowy MF Classic Runner — minimum 10 sztuk, żeby odblokować widoczność w wyszukiwarce.",
  },
];
