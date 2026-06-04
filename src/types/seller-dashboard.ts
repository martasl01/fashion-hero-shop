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

export interface SellerRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  insightShort: string;
  ctaLabel: string;
  insightFull: string;
  affectedProducts: string[];
  action: string;
}

export interface SellerProductRow {
  productId: string;
  stock: number;
  status: ProductStockStatus;
  sales30d: number;
}
