import type {
  SellerMetric,
  TimeRangeOption,
  SellerProductRow,
  SellerRecommendation,
  ReturnsActionCard,
} from "@/types/seller-dashboard";

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
    title: "Twoja cena jest poniżej mediany podkategorii",
    insightShort: "Mediana podkategorii klapki i japonki: 215 zł. Twoja cena: 189 zł (−12%). Masz przestrzeń na podwyżkę.",
    ctaLabel: "Podnieś ceny",
    primaryProduct: {
      name: "Urban Slip-On",
      sku: "201",
      imageSrc: "/images/products/product-2.jpg",
      category: "Buty > Klapki i japonki",
      productSlug: "urban-slip-on-fashionmf",
      demandSignal: "18 sprzedanych / 30 dni",
    },
    yourResultTile: {
      label: "Twoja cena (Urban Slip-On)",
      value: "189 zł",
      sub: "Mediana ceny liczona z ostatnich 90 dni (sellerzy z RR <12%).",
    },
    benchmarkTile: {
      label: "Benchmark",
      value: "215 zł",
      sub: "Mediana podkategorii: klapki i japonki",
      sample: { sellers: 14, products: 24, granularity: "podkategorii «klapki i japonki»" },
    },
    financialEffectTile: { label: "Rekomendowana cena testowa", value: "208 zł", sub: "+10% na 2 tygodnie" },
    contextExplanation:
      "Twój produkt w podkategorii klapki i japonki może wyglądać na tańszy w porównaniu z ofertą konkurencji. To może być świadomy wybór cenowy albo niezamierzona luka — cena nie była aktualizowana od dłuższego czasu.",
    // Dowód, że to zapomniana cena, nie świadomy wybór: cena stoi 14 mies., a
    // mediana podkategorii w tym czasie wzrosła o 9%; pozycja w najtańszych 15%.
    priceGapData: {
      stagnation: { monthsSinceChange: 14, categoryMedianMovePct: 9 },
      distribution: {
        percentile: 15,
        sample: { sellers: 14, products: 24, granularity: "podkategorii «klapki i japonki»" },
      },
    },
    affectedProductRows: [
      {
        name: "Urban Slip-On",
        sku: "201",
        productSlug: "urban-slip-on-fashionmf",
        category: "Buty",
        price: "189 zł",
        yourValue: "189 zł",
        benchmarkValue: "215 zł",
        difference: "−12%",
        demandSignal: "18 sprzedanych / 30 dni",
      },
    ],
    actionStep: {
      action: "Podnieś cenę o 10% (z 189 zł do ~208 zł) na 2 tygodnie i sprawdź, czy utarg wzrośnie.",
      actionInsight: "Nawet po podwyżce zostajesz poniżej mediany podkategorii (215 zł), więc ryzyko spadku zamówień jest niewielkie.",
      testWindow: "2 tygodnie",
      successMetric: "Utarg z Urban Slip-On (cena × liczba zamówień), nie sama liczba zamówień",
      keepRule: "utarg w górę → zostaw cenę i możesz powtórzyć na kolejnym produkcie",
      revertRule: "utarg w dół → wróć do 189 zł",
    },
  },
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
