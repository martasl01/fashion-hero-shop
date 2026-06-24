import type {
  SellerMetric,
  TimeRangeOption,
  SellerProductRow,
  SellerRecommendation,
  ReturnsActionCard,
  PricingSkuInput,
} from "@/types/seller-dashboard";
import { products } from "@/data/products";
import {
  pickTopPricingSku,
  buildCennikRecommendation,
} from "@/lib/pricing-recommendation-card";

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

// Wejście silnika rekomendacji cenowej (wariant A) — te same SKU co
// sellerProductRows. Dane zamockowane (prototyp WoZ). Dobrane tak, by pokazać
// pełny rozkład wyników silnika: 3 rekomendacje (⬆ zapomniana, ⬆ popyt, ⬇ za
// drogo), reszta to cisza (świadomy wybór / brak dowodu) lub poza testem.
export const pricingSkuInputs: PricingSkuInput[] = [
  // 201 → Zapomniana cena ⬆ (spójne z ręczną rekomendacją #1: 189 vs 215, stoi długo, rynek +9%)
  { productId: "201", cena: 189, mediana: 215, n: 14, pozycja: 0.10, dniOdZmiany: 420, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
  // 202 → Świadomy wybór (świeża cena: zmieniona 12 dni temu)
  { productId: "202", cena: 230, mediana: 260, n: 11, pozycja: 0.50, dniOdZmiany: 12,  ruchMedianyPct: 2, popytWysoki: false, zalega: false },
  // 203 → Brak dowodu (taniej i stara cena, ale rynek się nie ruszył: +2%)
  { productId: "203", cena: 150, mediana: 175, n: 14, pozycja: 0.15, dniOdZmiany: 200, ruchMedianyPct: 2, popytWysoki: false, zalega: false },
  // 204 → Poza testem (odchylenie 4,6% < 8%)
  { productId: "204", cena: 205, mediana: 215, n: 14, pozycja: 0.40, dniOdZmiany: 400, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
  // 205 → Poza testem (n = 3 < 5)
  { productId: "205", cena: 150, mediana: 215, n: 3,  pozycja: 0.10, dniOdZmiany: 400, ruchMedianyPct: 9, popytWysoki: false, zalega: false },
  // 206 → Za drogo ⬇ (drożej + zalega)
  { productId: "206", cena: 168, mediana: 140, n: 12, pozycja: 0.92, dniOdZmiany: 200, ruchMedianyPct: 1, popytWysoki: false, zalega: true  },
  // 207 → Poza testem (walidacja: popyt i zaleganie naraz — stan niezdefiniowany)
  { productId: "207", cena: 120, mediana: 150, n: 10, pozycja: 0.20, dniOdZmiany: 90,  ruchMedianyPct: 4, popytWysoki: true,  zalega: true  },
  // 208 → Popyt / wyprzedaż ⬆ (taniej + popyt wysoki, nisko w rozkładzie)
  { productId: "208", cena: 95,  mediana: 110, n: 9,  pozycja: 0.18, dniOdZmiany: 60,  ruchMedianyPct: 1, popytWysoki: true,  zalega: false },
  // 209 → Świadomy wybór (środek rozkładu: pozycja 0,55)
  { productId: "209", cena: 180, mediana: 210, n: 12, pozycja: 0.55, dniOdZmiany: 300, ruchMedianyPct: 6, popytWysoki: false, zalega: false },
  // 210 → Brak dowodu (drożej, ale nie zalega — nic nie pasuje)
  { productId: "210", cena: 240, mediana: 215, n: 14, pozycja: 0.85, dniOdZmiany: 300, ruchMedianyPct: 0, popytWysoki: false, zalega: false },
];

// Nagłówkowa rekomendacja cennikowa („Akcja na ten tydzień") WYNIKA z silnika:
// top pick wg priorytetu przyczyny, a kartę składa warstwa prezentacji z werdyktu
// + danych SKU (zamiast ręcznej narracji). Reszta rekomendowanych SKU idzie do
// sekcji „Rekomendacje cenowe" (pricingWidgetInputs, bez duplikatu top picku).
// Sygnał popytu (sztuk / 30 dni) bierzemy z sellerProductRows — jedno źródło prawdy,
// łączone po productId. Zasila guardrail top picku i kafel popytu na karcie.
const salesByProductId = new Map(sellerProductRows.map((r) => [r.productId, r.sales30d]));
const topPricingSku = pickTopPricingSku(pricingSkuInputs, salesByProductId);
const topPricingProduct = topPricingSku
  ? products.find((p) => p.id === topPricingSku.input.productId)
  : undefined;
const cennikRecommendation =
  topPricingSku && topPricingProduct
    ? buildCennikRecommendation(
        topPricingSku.input,
        topPricingProduct,
        topPricingSku.verdict,
        salesByProductId.get(topPricingSku.input.productId) ?? 0
      )
    : null;

// Wejście dla sekcji „Rekomendacje cenowe" — pozostałe SKU (top pick jest już
// nagłówkową kartą). Widget i tak filtruje wewnętrznie do „recommended".
export const pricingWidgetInputs: PricingSkuInput[] = pricingSkuInputs.filter(
  (i) => i.productId !== topPricingSku?.input.productId
);

export const sellerRecommendations: SellerRecommendation[] = [
  ...(cennikRecommendation ? [cennikRecommendation] : []),
  {
    id: "2",
    category: "rentowność",
    title: "Zwroty zjadają marżę na Kopertowej Midi",
    insightShort: "Kopertowa Midi: zwroty 41%, mediana kategorii 14%. Każda sprzedaż generuje stratę −12 zł.",
    ctaLabel: "Wycofaj produkt",
    primaryProduct: {
      name: "Kopertowa Midi",
      sku: "202",
      imageSrc: "/images/products/product-3.jpg",
      category: "Sukienki",
      productSlug: "kopertowa-midi-fashionmf",
    },
    yourResultTile: {
      label: "Zwroty Kopertowej Midi",
      value: "41%",
      sub: "Return rate liczymy na zamówieniach sprzed co najmniej 30 dni, patrząc wstecz do ~90 dni.",
    },
    benchmarkTile: {
      label: "Mediana zwrotów w Sukienkach",
      value: "14%",
      sample: { sellers: 11, products: 19, granularity: "kategorii «Sukienki»" },
    },
    financialEffectTile: { label: "Strata na tym SKU", value: "−12 zł / szt.", sub: "Każda sprzedaż generuje stratę po zwrocie" },
    contextExplanation:
      "Wysoki wskaźnik zwrotów może wynikać z opisu rozmiaru niezgodnego z rzeczywistością lub ze zdjęcia nieodpowiadającego fasoniowi. To może być jednorazowy spike albo systemowy problem z tym modelem.",
    affectedProductRows: [
      {
        name: "Kopertowa Midi",
        sku: "202",
        productSlug: "kopertowa-midi-fashionmf",
        category: "Sukienki",
        price: "249 zł",
        yourValue: "41%",
        benchmarkValue: "14%",
        difference: "+27 pp",
      },
    ],
    actionStep: {
      action: "Masz RR 41% na tym SKU. Możesz zmienić główne zdjęcie na dokładnie oddające fason — albo wycofać Kopertową Midi ze sprzedaży. Możesz też nic nie robić.",
      testWindow: "30 dni po zmianie zdjęcia",
      successMetric: "Wskaźnik zwrotów dla SKU 202",
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
    metricsTimeNote: "Dane listingowe aktualizowane co 7 dni.",
    primaryProduct: {
      name: "Torebka Mini Skórzana",
      sku: "204",
      imageSrc: "/images/products/product-4.jpg",
      category: "Torebki",
      productSlug: "torebka-mini-skorzana-fashionmf",
    },
    yourResultTile: { label: "Zdjęcia na Torebce Mini", value: "3 zdjęcia" },
    benchmarkTile: {
      label: "Mediana zdjęć w Torebkach",
      value: "6 zdjęć",
      // Przypadek eskalacji: podkategoria „torebki na ramię" miała za mało sprzedawców
      // (poniżej progu) → benchmark policzony o poziom wyżej, na kategorii „Torebki".
      sample: { sellers: 12, products: 31, granularity: "kategorii «Torebki»", escalated: true },
    },
    financialEffectTile: { label: "Różnica", value: "−3 zdjęcia (−50%)" },
    contextExplanation:
      "Algorytm FashionHero preferuje listingi z co najmniej 6 zdjęciami w wynikach wyszukiwania. Produkty z mniejszą liczbą zdjęć są niżej w rankingu, co przekłada się bezpośrednio na liczbę kliknięć. To może być świadomy wybór albo przeoczenie przy dodawaniu produktu.",
    affectedProductRows: [
      {
        name: "Torebka Mini Skórzana",
        sku: "204",
        productSlug: "torebka-mini-skorzana-fashionmf",
        category: "Torebki",
        price: "189 zł",
        yourValue: "3 zdjęcia",
        benchmarkValue: "6 zdjęć",
        difference: "−3 zdjęcia",
      },
    ],
    actionStep: {
      action: "Masz 3 zdjęcia na Torebce Mini — możesz dodać 3 brakujące (zdjęcie z boku, ze środka, na ramieniu). Możesz też nic nie zmieniać.",
      testWindow: "2 tygodnie od aktualizacji",
      successMetric: "Wyświetlenia listingu w wyszukiwarce",
      keepRule: "wyświetlenia wzrosły ≥10% → możesz powtórzyć na kolejnych listingach",
      revertRule: "brak zmiany po 2 tygodniach → sprawdź ranking kategorii osobno",
    },
  },
];

// Karta akcji bartek-type — wariant zwrotów. Dane zamockowane na sztywno
// (prototyp WoZ, bez silnika i źródła danych).
export const returnsAction: ReturnsActionCard = {
  chipTitle: "Jeden produkt odpowiada za większość Twoich zwrotów",
  chipInsight:
    "Sukienka letnia midi wraca w 34% — przy 18% w podkategorii. Te zwroty kosztują Cię ~425 zł na obniżonej odsprzedaży i zamrożonym towarze.",
  chipCta: "Ogranicz zwroty",
  subcategory: "sukienki letnie",
  categoryPath: "Odzież > Sukienki letnie",
  h1: "Sukienka letnia midi wraca częściej niż reszta Twojego asortymentu",
  yourResultTile: {
    label: "Twoje zwroty na tym SKU",
    value: "34%",
    sub: "Return rate liczymy na zamówieniach sprzed co najmniej 30 dni, patrząc wstecz do ~90 dni.",
  },
  benchmarkTile: {
    label: "Benchmark",
    value: "18%",
    sub: "Mediana podkategorii: sukienki letnie",
    sample: { sellers: 13, products: 22, granularity: "podkategorii «sukienki letnie»" },
  },
  costTile: {
    label: "Ile kosztują Cię zwroty",
    value: "~425 zł",
    sub: "Te 50 zwrotów. Średnio na każdym tracisz ~8,50 zł — między obniżoną odsprzedażą a towarem zamrożonym do następnego sezonu.",
  },
  meaning:
    "Co trzecia sztuka tego produktu wraca. To może być świadomy wybór (np. trudny do dopasowania krój) albo niezamierzona luka (brakująca tabela rozmiarów, słabe zdjęcia). Najczęstszy powód zwrotów w tej podkategorii to niedopasowanie rozmiaru.",
  products: [
    {
      name: "Sukienka letnia midi",
      sku: "203",
      imageSrc: "/images/products/sukienka-letnia-midi.jpg",
      yourValue: "34%",
      benchmarkValue: "18%",
      difference: "+16 pp",
    },
  ],
  options: [
    {
      title: "Dodaj tabelę rozmiarów",
      insight: "Produkty z tabelą rozmiarów mają 2× niższy return rate.",
    },
    {
      title: "Dodaj 2 zdjęcia na modelce",
      insight: "Kupujący częściej dodają takie produkty do koszyka.",
    },
  ],
  // Powód zwrotu — scenariusz A (powód = rozmiar). Dane zamockowane (prototyp WoZ).
  reasonsData: {
    reasons: [
      {
        code: "rozmiar",
        label: "Rozmiar / dopasowanie",
        sharePct: 58,
        returnsCount: 29,
      },
      {
        code: "jakosc",
        label: "Jakość / wykonanie",
        sharePct: 18,
        returnsCount: 9,
      },
    ],
    sample: {
      returnsWithReason: 50,
      totalReturns: 50,
      windowDays: 90,
      sourceLabel: "komentarzy kupujących na FashionHero (klasyfikacja automatyczna)",
    },
    sizeBreakdown: {
      rows: [
        { size: "S", returns: 18, sold: 40, ratePct: 45, high: false },
        { size: "M", returns: 27, sold: 70, ratePct: 39, high: false },
        { size: "L", returns: 3, sold: 22, ratePct: 14, high: false },
        { size: "XL", returns: 2, sold: 15, ratePct: 13, high: false },
      ],
      gridDirection: "up",
      diagnosis: "siatka leci za duża, krój mały.",
      sample: {
        returnsWithReason: 29,
        totalReturns: 50,
        windowDays: 90,
        sourceLabel: "sprzedaży per rozmiar i 29 z 50 zwrotów z powodem „rozmiar”",
      },
    },
  },
  verification: {
    testWindow:
      "Po 2 tygodniach sprawdź return rate na S i M osobno (na zamówieniach sprzed min. 30 dni).",
    keepRule: "RR w dół → zostaw zmianę i powtórz na kolejnym produkcie.",
    revertRule: "Bez zmian → problem nie w siatce. Sprawdź zdjęcia kroju.",
  },
};
