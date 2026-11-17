"use client";

// ECharts butuh `window`, jadi semua grafik dimuat hanya di browser (ssr: false).
import dynamic from "next/dynamic";

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="flex animate-pulse items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground"
      style={{ height }}
    >
      Memuat grafik…
    </div>
  );
}

export const LampungMap = dynamic(() => import("./LampungMap"), {
  ssr: false,
  loading: () => <Skeleton height={440} />,
});
export const TrendLine = dynamic(() => import("./TrendLine"), {
  ssr: false,
  loading: () => <Skeleton height={400} />,
});
export const SimpleLine = dynamic(() => import("./SimpleLine"), {
  ssr: false,
  loading: () => <Skeleton height={240} />,
});
export const ScatterExplorer = dynamic(() => import("./ScatterExplorer"), {
  ssr: false,
  loading: () => <Skeleton height={460} />,
});
export const CorrHeatmap = dynamic(() => import("./CorrHeatmap"), {
  ssr: false,
  loading: () => <Skeleton height={470} />,
});
export const ClusterProfile = dynamic(() => import("./ClusterProfile"), {
  ssr: false,
  loading: () => <Skeleton height={250} />,
});
