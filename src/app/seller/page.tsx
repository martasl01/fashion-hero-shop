import { products } from "@/data/products";
import {
  DASHBOARD_SELLER_ID,
  sellerMetrics,
  timeRangeOptions,
  sellerProductRows,
} from "@/data/seller-dashboard";
import { MetricTiles } from "@/components/seller/metric-tiles";
import { ProductsTable } from "@/components/seller/products-table";
import { DorotaActionWidget } from "@/components/seller/dorota-action-widget";
import { BartekActionWidget } from "@/components/seller/bartek-action-widget";
import { PrototypeSwitch } from "@/components/seller/prototype-switch";

export default function SellerDashboardPage() {
  const sellerProducts = products.filter((p) => p.sellerId === DASHBOARD_SELLER_ID);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl">
      <PrototypeSwitch
        dorotaView={
          <>
            <DorotaActionWidget />

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
