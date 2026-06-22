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

// --- Dowód, że cena to luka („Dlaczego ta cena to luka") — dorota-type ---
// Dwa sygnały liczone z danych, rozróżniające świadomy pricing od zapomnianej
// ceny (analogicznie do „Dlaczego ten produkt wraca" przy zwrotach):
// (1) stagnacja ceny — czas od ostatniej zmiany + ruch mediany podkategorii w tym
//     czasie; (2) pozycja w rozkładzie podkategorii zamiast samego „−X% vs mediana".

export interface PriceStagnationSignal {
  monthsSinceChange: number; // ile miesięcy od ostatniej zmiany ceny tego SKU
  categoryMedianMovePct: number; // ruch mediany podkategorii w tym czasie (np. 9 → +9%)
}

export interface PriceDistributionSignal {
  percentile: number; // pozycja ceny w rozkładzie podkategorii (0–100; 15 → najtańsze 15%)
  sample: BenchmarkSample; // ta sama reguła liczności/fallbacku co benchmark zewnętrzny
}

// Oba pola opcjonalne — slot renderuje się tylko, gdy któryś sygnał przejdzie progi.
export interface PriceGapData {
  stagnation?: PriceStagnationSignal;
  distribution?: PriceDistributionSignal;
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
  priceGapData?: PriceGapData; // slot „Dlaczego ta cena to luka" (tylko cennik; brak → nie renderujemy)
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

// --- Powód zwrotu („Dlaczego ten produkt wraca") ---
// Top 1–2 powody zwrotu SKU znormalizowane do zamkniętej taksonomii. Z udziałem %,
// próbką i widoczną linią źródła. Akcja na karcie wynika z top powodu (patrz
// resolveReturnReasons w lib/return-reasons.ts).

export type ReturnReasonCode =
  | "rozmiar"
  | "jakosc"
  | "kolor"
  | "niezgodnosc_z_opisem"
  | "zmiana_decyzji"
  | "logistyka"
  | "inne";

// Próbka WŁASNYCH zwrotów sellera (nie mediana zewnętrzna — inny tekst niż BenchmarkSample).
export interface ReturnReasonSample {
  returnsWithReason: number; // ile zwrotów miało przypisany powód — mianownik udziału
  totalReturns: number; // wszystkie zwroty SKU w oknie
  windowDays?: number; // domyślnie 90
  sourceLabel: string; // linia źródła, np. „ankiety pozwrotowe i powody przy zwrocie"
}

export interface ReturnReason {
  code: ReturnReasonCode;
  label: string; // gotowa etykieta PL do UI, np. „Niedopasowanie rozmiaru"
  sharePct: number; // udział % wśród zwrotów z przyczyną (0–100)
  returnsCount: number; // liczba zwrotów z tym powodem
}

export interface SizeReturnRate {
  size: string; // „S" | „M" | „L" | „XL" ...
  returns: number; // licznik
  sold: number; // mianownik
  ratePct: number; // RR per rozmiar (returns/sold*100)
  high: boolean; // czerwone — RR powyżej progu (ustawiane w resolverze)
}

export interface SizeBreakdown {
  rows: SizeReturnRate[]; // sortowane malejąco po ratePct (NIE po liczbie zwrotów)
  gridDirection: "up" | "down" | "mixed"; // kierunek korekty siatki
  diagnosis: string; // np. „Siatka rozmiarów wychodzi za duża"
  sample: ReturnReasonSample; // źródło + próbka (zawsze widoczne)
}

// Typ akcji steruje renderem karty i nazwą eventu PostHog.
export type ReasonActionKind =
  | "fix_size_table" // rozmiar → popraw tabelę rozmiarów (+ drill-down)
  | "qc_batch" // jakość → zgłoś do QC / rozważ wycofanie; NIGDY edycja karty
  | "fix_listing" // niezgodnosc_z_opisem / kolor → popraw opis i zdjęcia
  | "no_fix" // zmiana_decyzji → brak akcji naprawczej
  | "diagnostic"; // poniżej progu → ankieta, akcja diagnostyczna

export interface ReasonDrivenAction {
  kind: ReasonActionKind;
  title: string;
  insight: string;
  quote?: string; // sugerowany dopisek do opisu produktu (render italic)
  ctaLabel?: string; // brak dla no_fix
  wozEvent?: string; // nazwa eventu PostHog dla atrapy
}

export interface ReturnReasonsData {
  reasons: ReturnReason[]; // znormalizowane, malejąco po sharePct
  sample: ReturnReasonSample; // próbka całości rozbicia + źródło
  sizeBreakdown?: SizeBreakdown; // obecne tylko gdy zebrane (render tylko gdy powód = rozmiar)
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
  reasonsData?: ReturnReasonsData; // blok „Dlaczego ten produkt wraca" (opcjonalny — brak → render jak dawniej)
  verification: {
    testWindow: string;
    keepRule: string;
    revertRule: string;
  };
}
