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
import { BartekActionWidget } from "@/components/seller/bartek-action-widget";
import { PrototypeSwitch } from "@/components/seller/prototype-switch";

export default function SellerDashboardPage() {
  const sellerProducts = products.filter((p) => p.sellerId === DASHBOARD_SELLER_ID);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl">
      <PrototypeSwitch
        dorotaView={
          <>
            <RecommendationsWidget
              recommendations={[sellerRecommendations[0]]}
              headline="Akcja na ten tydzień"
              subheadline="Ty decydujesz, co zmienić – my tylko liczymy. Co tydzień pokażemy Ci jedną akcję opartą na danych z Twojego sklepu, żeby z tej samej sprzedaży zostawało Ci więcej."
            />

            <MetricTiles metrics={sellerMetrics} timeRangeOptions={timeRangeOptions} />

            <ProductsTable products={sellerProducts} rows={sellerProductRows} />
          </>
        }
        bartekView={
          <>
            <BartekActionWidget />

            <MetricTiles metrics={sellerMetrics} timeRangeOptions={timeRangeOptions} />

            <ProductsTable products={sellerProducts} rows={sellerProductRows} />
          </>
        }
      />
    </div>
  );
}
