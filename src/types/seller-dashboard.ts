export type SellerTimeRange = "week" | "month" | "quarter" | "year" | "all";

export interface TimeRangeOption {
  value: SellerTimeRange;
  label: string;
}

export interface SellerMetric {
  id: string;
  label: string;
  value: string;
  sub?: string;
  sample?: BenchmarkSample;
}

export type ProductStockStatus = "active" | "low-stock" | "out-of-stock" | "draft";

export type RecommendationCategory = "rentowność" | "cennik" | "listing";

// Liczność próby, na której policzono benchmark ZEWNĘTRZNY (mediana z innych
// sprzedawców). Uwiarygodnia benchmark liczbą sprzedawców w próbce.
// Liczone na unikalnych sprzedawcach (nie ofertach), oferty samego sellera wykluczone.
export interface BenchmarkSample {
  sellers: number; // unikalni sprzedawcy — liczba główna
  products: number; // podobne produkty — uzupełnienie
  granularity: string; // poziom granulacji, np. "podkategorii «klapki i japonki»"
  windowDays?: number; // okno czasowe; domyślnie 90
  escalated?: boolean; // true gdy policzono o poziom wyżej (podkategoria poniżej progu)
}

export interface MetricTileData {
  label: string;
  value: string;
  sub?: string;
  sample?: BenchmarkSample; // tylko dla benchmarku zewnętrznego — renderuje linijkę liczności
}

export interface AffectedProductRow {
  name: string;
  sku: string;
  productSlug: string;
  category: string;
  price: string;
  yourValue: string;
  benchmarkValue: string;
  difference: string;
}

export interface ActionStep {
  action: string;
  actionInsight?: string;
  testWindow: string;
  successMetric: string;
  keepRule: string;
  revertRule: string;
}

export interface PrimaryProduct {
  name: string;
  sku: string;
  imageSrc: string;
  category: string;
  productSlug: string;
}

export interface SellerRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  insightShort: string;
  ctaLabel: string;
  metricsTimeNote?: string;
  primaryProduct: PrimaryProduct;
  yourResultTile: MetricTileData;
  benchmarkTile: MetricTileData;
  financialEffectTile: MetricTileData;
  contextExplanation: string;
  affectedProductRows: AffectedProductRow[];
  actionStep: ActionStep;
}

export interface SellerProductRow {
  productId: string;
  stock: number;
  status: ProductStockStatus;
  sales30d: number;
}

// --- Silnik rekomendacji cenowej (wariant A) — dorota-type ---
// Deterministyczny klasyfikator regułowy: jedna rekomendacja na SKU. Typuje
// PRZYCZYNĘ i KIERUNEK, nie liczy o ile zmienić cenę (granica MVP). Logika i
// progi w lib/pricing-recommendation.ts (czysta logika WoZ, nie baza danych).

// Wejście na SKU — 8 pól ze speca. Brak kompletu → SKU nie trafia do datasetu
// (nie zgadujemy). Wartości natywne ze speca: pozycja 0–1, ruch mediany w %.
export interface PricingSkuInput {
  productId: string; // łączy z products.ts po id (jak SellerProductRow)
  cena: number; // aktualna cena SKU
  mediana: number; // mediana podkategorii
  n: number; // liczba porównywalnych ofert
  pozycja: number; // pozycja w rozkładzie 0–1 (0 = najtańsze, 1 = najdroższe)
  dniOdZmiany: number; // ile dni temu zmieniono cenę
  ruchMedianyPct: number; // ruch mediany od tej zmiany w % (9 → +9%)
  popytWysoki: boolean; // sprzedaje się szybko / niski stan
  zalega: boolean; // brak sprzedaży / wysoki stan
}

export type PricingDirection = "raise" | "lower" | "hold";

// forgotten_price/demand/too_expensive → rekomendacja; deliberate/no_evidence →
// cisza (nic nie sugerujemy); out_of_test → poza testem (walidacja/warunek wejścia).
export type PricingReasonCode =
  | "forgotten_price"
  | "demand"
  | "too_expensive"
  | "deliberate"
  | "no_evidence"
  | "out_of_test";

export interface PricingRecommendation {
  status: "recommended" | "silent" | "excluded";
  reasonCode: PricingReasonCode;
  direction: PricingDirection;
  text: string | null; // treść karty; null gdy silent/excluded (slot się nie renderuje)
}

// --- Karta akcji „Akcja na ten tydzień" — wariant zwrotów (bartek-type) ---
// Osobny, samodzielny model: template zwrotów różni się od SellerRecommendation
// (kafel KOSZT zamiast różnicy, opcje wzbogacenia karty, „edytuj" jako atrapa WoZ).

export interface ReturnsProductRow {
  name: string;
  sku: string;
  imageSrc: string;
  yourValue: string;
  benchmarkValue: string;
  difference: string;
}

export interface ReturnsActionOption {
  title: string;
  insight: string;
}

export interface ReturnsActionCard {
  // Chip na dashboardzie
  chipTitle: string;
  chipInsight: string;
  chipCta: string;
  // Podstrona
  subcategory: string; // poziom podkategorii, na którym liczony jest benchmark
  categoryPath: string; // ścieżka kategorii w nagłówku produktu (np. „Odzież > Sukienki letnie")
  h1: string;
  metricsTimeNote?: string; // kontekst czasowy liczenia return rate
  yourResultTile: MetricTileData;
  benchmarkTile: MetricTileData;
  costTile: MetricTileData;
  meaning: string;
  products: ReturnsProductRow[];
  options: ReturnsActionOption[];
  verification: {
    testWindow: string;
    keepRule: string;
    revertRule: string;
  };
}
