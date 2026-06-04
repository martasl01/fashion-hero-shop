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
}

export type ProductStockStatus = "active" | "low-stock" | "out-of-stock" | "draft";

export type RecommendationCategory = "rentowność" | "cennik" | "listing";

export interface MetricTileData {
  label: string;
  value: string;
}

export interface AffectedProductRow {
  name: string;
  sku: string;
  productSlug: string;
  yourValue: string;
  benchmarkValue: string;
  difference: string;
}

export interface ActionStep {
  action: string;
  testWindow: string;
  successMetric: string;
  keepRule: string;
  revertRule: string;
}

export interface SellerRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  insightShort: string;
  ctaLabel: string;
  benchmarkTile: MetricTileData;
  yourResultTile: MetricTileData;
  differenceTile: MetricTileData;
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
