import { Tag, TrendingDown } from "lucide-react";
import { products } from "@/data/products";
import {
  DASHBOARD_SELLER_ID,
  sellerMetrics,
  timeRangeOptions,
  sellerProductRows,
  cennikRecommendation,
  returnsRecommendation,
} from "@/data/seller-dashboard";
import {
  DOROTA_CENNIK_ACTIONS,
  BARTEK_ROZMIAR_ACTIONS,
} from "@/data/seller-actions";
import { MetricTiles } from "@/components/seller/metric-tiles";
import { ProductsTable } from "@/components/seller/products-table";
import { ActionTeaserWidget } from "@/components/seller/action-teaser-widget";
import { PrototypeSwitch } from "@/components/seller/prototype-switch";

export default function SellerDashboardPage() {
  const sellerProducts = products.filter((p) => p.sellerId === DASHBOARD_SELLER_ID);

  return (
    <div className="p-8 flex flex-col gap-8 max-w-5xl">
      <PrototypeSwitch
        dorotaView={
          <>
            <ActionTeaserWidget
              recommendation={cennikRecommendation}
              icon={<Tag size={13} />}
              label="cennik"
              href="/seller/pricing-action"
              actions={DOROTA_CENNIK_ACTIONS}
              emptyMessage="Wszystkie Twoje ceny są w normie podkategorii. Wróć tu za tydzień."
            />

            <MetricTiles metrics={sellerMetrics} timeRangeOptions={timeRangeOptions} />

            <ProductsTable products={sellerProducts} rows={sellerProductRows} />
          </>
        }
        bartekView={
          <>
            <ActionTeaserWidget
              recommendation={returnsRecommendation}
              icon={<TrendingDown size={13} />}
              label="zwroty"
              href="/seller/returns-action"
              actions={BARTEK_ROZMIAR_ACTIONS}
              emptyMessage="Wszystkie Twoje produkty mają zwroty w normie podkategorii. Wróć tu za tydzień."
            />

            <MetricTiles metrics={sellerMetrics} timeRangeOptions={timeRangeOptions} />

            <ProductsTable products={sellerProducts} rows={sellerProductRows} />
          </>
        }
      />
    </div>
  );
}
