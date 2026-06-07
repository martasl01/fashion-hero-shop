import { products } from "@/data/products";
import {
  DASHBOARD_SELLER_ID,
  sellerMetrics,
  timeRangeOptions,
  sellerProductRows,
  sellerRecommendations,
} from "@/data/seller-dashboard";
import { MetricTiles } from "@/components/seller/metric-tiles";
import { ProductsTable } from "@/components/seller/products-table";
import { RecommendationsWidget } from "@/components/seller/recommendations-widget";

export default function OneActionPage() {
  const sellerProducts = products.filter((p) => p.sellerId === DASHBOARD_SELLER_ID);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">Dashboard</h1>
        <p className="text-[13px] text-warm-gray mt-0.5">Twoje dane sprzedażowe</p>
      </div>

      <RecommendationsWidget
        recommendations={[sellerRecommendations[0]]}
        headline="Akcja na ten tydzień"
        subheadline="Ty decydujesz, co zmienić – my tylko liczymy. Co tydzień pokażemy Ci jedną akcję opartą na danych z Twojego sklepu, żeby z tej samej sprzedaży zostawało Ci więcej."
      />

      <MetricTiles metrics={sellerMetrics} timeRangeOptions={timeRangeOptions} />

      <ProductsTable products={sellerProducts} rows={sellerProductRows} />
    </div>
  );
}
