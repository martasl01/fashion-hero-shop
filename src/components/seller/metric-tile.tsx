import type { SellerMetric } from "@/types/seller-dashboard";
import { cn, formatBenchmarkSample } from "@/lib/utils";

interface MetricTileProps {
  metric: SellerMetric;
  className?: string;
}

export function MetricTile({ metric, className }: MetricTileProps) {
  return (
    <div className={cn("bg-cream-light border border-black/10 rounded p-5 flex flex-col gap-1", className)}>
      <span className="text-label text-warm-gray uppercase tracking-widest text-[11px]">
        {metric.label}
      </span>
      <span className="text-[28px] font-semibold text-charcoal leading-tight">
        {metric.value}
      </span>
      {metric.sub && (
        <span className="text-[13px] text-warm-gray">{metric.sub}</span>
      )}
      {metric.sample && (
        <span className="text-[12px] text-warm-gray/80 leading-snug mt-0.5">
          {formatBenchmarkSample(metric.sample)}
        </span>
      )}
    </div>
  );
}
