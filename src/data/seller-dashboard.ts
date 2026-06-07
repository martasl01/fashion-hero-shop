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
  { productId: "201", stock: 24, status: "active",        sales30d: 18 },
  { productId: "202", stock: 4,  status: "low-stock",     sales30d: 7  },
  { productId: "203", stock: 0,  status: "out-of-stock",  sales30d: 12 },
  { productId: "204", stock: 8,  status: "active",        sales30d: 5  },
  { productId: "205", stock: 14, status: "active",        sales30d: 9  },
  { productId: "206", stock: 11, status: "active",        sales30d: 6  },
  { productId: "207", stock: 3,  status: "low-stock",     sales30d: 4  },
  { productId: "208", stock: 16, status: "active",        sales30d: 11 },
  { productId: "209", stock: 0,  status: "out-of-stock",  sales30d: 8  },
  { productId: "210", stock: 22, status: "active",        sales30d: 14 },
];

export const sellerRecommendations: SellerRecommendation[] = [
  {
    id: "1",
    category: "cennik",
    title: "Twoje ceny są poniżej mediany kategorii",
    insightShort: "Mediana kategorii Buty: 215 zł. Twoja średnia: 189 zł (−12%). Masz przestrzeń na podwyżkę.",
    ctaLabel: "Podnieś ceny",
    benchmarkTile: { label: "Mediana kategorii Buty", value: "215 zł" },
    yourResultTile: { label: "Twoja średnia cena", value: "189 zł" },
    differenceTile: { label: "Różnica", value: "−12% (−26 zł)" },
    contextExplanation:
      "Twoje produkty w kategorii Buty mogą wyglądać na tańsze w porównaniu z ofertą konkurencji. To może być świadomy wybór cenowy albo niezamierzona luka — ceny nie były aktualizowane od dłuższego czasu.",
    affectedProductRows: [
      {
        name: "Urban Slip-On",
        sku: "SKU-201",
        productSlug: "urban-slip-on-fashionmf",
        category: "Buty",
        price: "189 zł",
        yourValue: "189 zł",
        benchmarkValue: "215 zł",
        difference: "−12%",
      },
      {
        name: "Wsuwane Mokasyny MF",
        sku: "SKU-205",
        productSlug: "wsuwane-mokasyny-fashionmf",
        category: "Buty",
        price: "169 zł",
        yourValue: "169 zł",
        benchmarkValue: "215 zł",
        difference: "−21%",
      },
      {
        name: "FashionMF Derby Camel",
        sku: "SKU-206",
        productSlug: "fashionmf-derby-camel",
        category: "Buty",
        price: "199 zł",
        yourValue: "199 zł",
        benchmarkValue: "215 zł",
        difference: "−7%",
      },
    ],
    actionStep: {
      action:
        "Wybierz jeden produkt, który sprzedaje się teraz najczęściej — np. Urban Slip-On (189 zł) — i podnieś cenę o 10% (do ~208 zł) na 2 tygodnie.",
      testWindow: "2 tygodnie",
      successMetric: "Utarg z tego produktu (cena × liczba zamówień), nie sama liczba zamówień",
      keepRule: "utarg w górę → zostaw cenę i powtórz na kolejnym produkcie",
      revertRule: "utarg w dół → wróć do 189 zł",
    },
  },
  {
    id: "2",
    category: "rentowność",
    title: "Zwroty zjadają marżę na Kopertowej Midi",
    insightShort: "Kopertowa Midi: zwroty 41%, mediana kategorii 14%. Każda sprzedaż generuje stratę −12 zł.",
    ctaLabel: "Wycofaj produkt",
    benchmarkTile: { label: "Mediana zwrotów w Sukienkach", value: "14%" },
    yourResultTile: { label: "Zwroty Kopertowej Midi", value: "41%" },
    differenceTile: { label: "Różnica", value: "+27 pp (−12 zł/szt.)" },
    contextExplanation:
      "Wysoki wskaźnik zwrotów może wynikać z opisu rozmiaru niezgodnego z rzeczywistością lub ze zdjęcia nieodpowiadającego fasoniowi. To może być jednorazowy spike albo systemowy problem z tym modelem.",
    affectedProductRows: [
      {
        name: "Kopertowa Midi",
        sku: "SKU-202",
        productSlug: "kopertowa-midi-fashionmf",
        category: "Sukienki",
        price: "249 zł",
        yourValue: "41%",
        benchmarkValue: "14%",
        difference: "+27 pp",
      },
    ],
    actionStep: {
      action: "Zmień główne zdjęcie produktu na dokładnie oddające fason lub wycofaj Kopertową Midi ze sprzedaży.",
      testWindow: "30 dni po zmianie zdjęcia",
      successMetric: "Wskaźnik zwrotów dla SKU-202",
      keepRule: "RR ≤ 20% → zostaw produkt",
      revertRule: "RR > 30% po 30 dniach → wycofaj",
    },
  },
  {
    id: "3",
    category: "listing",
    title: "Twoje listingi w Torebkach mają za mało zdjęć",
    insightShort: "Torebka Mini: 3 zdjęcia, mediana kategorii 6. Algorytm FH preferuje listingi z ≥6 zdjęciami.",
    ctaLabel: "Uzupełnij zdjęcia",
    benchmarkTile: { label: "Mediana zdjęć w Torebkach", value: "6 zdjęć" },
    yourResultTile: { label: "Zdjęcia na Torebce Mini", value: "3 zdjęcia" },
    differenceTile: { label: "Różnica", value: "−3 zdjęcia (−50%)" },
    contextExplanation:
      "Algorytm FashionHero preferuje listingi z co najmniej 6 zdjęciami w wynikach wyszukiwania. Produkty z mniejszą liczbą zdjęć są niżej w rankingu, co przekłada się bezpośrednio na liczbę kliknięć. To może być świadomy wybór albo przeoczenie przy dodawaniu produktu.",
    affectedProductRows: [
      {
        name: "Torebka Mini Skórzana",
        sku: "SKU-204",
        productSlug: "torebka-mini-skorzana-fashionmf",
        category: "Torebki",
        price: "189 zł",
        yourValue: "3 zdjęcia",
        benchmarkValue: "6 zdjęć",
        difference: "−3 zdjęcia",
      },
    ],
    actionStep: {
      action: "Dodaj 3 zdjęcia do Torebki Mini — zdjęcie z boku, ze środka, na ramieniu.",
      testWindow: "2 tygodnie od aktualizacji",
      successMetric: "Wyświetlenia listingu w wyszukiwarce",
      keepRule: "wyświetlenia wzrosły ≥10% → powtórz na kolejnych listingach",
      revertRule: "brak zmiany po 2 tygodniach → sprawdź ranking kategorii osobno",
    },
  },
];
