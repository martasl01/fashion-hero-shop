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
  demandSignal?: string; // opisowy sygnał popytu, np. „18 sprzedanych / 30 dni" (tylko cennik)
  lowDemand?: boolean; // SKU poniżej mediany bez popytu — nie rekomendujemy podwyżki (US-3)
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
  demandSignal?: string; // opisowy sygnał popytu na kaflu, np. „18 sprzedanych / 30 dni" (tylko cennik)
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
