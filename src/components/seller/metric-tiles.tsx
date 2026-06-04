"use client";

import { useState } from "react";
import type { SellerMetric, TimeRangeOption, SellerTimeRange } from "@/types/seller-dashboard";
import { MetricTile } from "./metric-tile";
import { cn } from "@/lib/utils";

interface MetricTilesProps {
  metrics: SellerMetric[];
  timeRangeOptions: TimeRangeOption[];
}

export function MetricTiles({ metrics, timeRangeOptions }: MetricTilesProps) {
  const [selected, setSelected] = useState<SellerTimeRange>("month");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {timeRangeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className={cn(
              "text-[12px] px-3 py-1.5 rounded border transition-colors",
              selected === opt.value
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-charcoal border-black/20 hover:border-charcoal"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
