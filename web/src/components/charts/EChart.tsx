"use client";

// Pembungkus tunggal ECharts (modular agar bundel kecil). Hanya dimuat di browser.
import ReactEChartsCore from "echarts-for-react/lib/core";
import { BarChart, HeatmapChart, LineChart, MapChart, ScatterChart } from "echarts/charts";
import {
  GeoComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { INK } from "@/lib/colors";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  MapChart,
  ScatterChart,
  GeoComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
  LabelLayout,
  CanvasRenderer,
]);

export { echarts };
export type { EChartsOption };

export const FONT_FAMILY =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const TEXT = { fontFamily: FONT_FAMILY, fontSize: 12, color: INK.secondary } as const;

export const TOOLTIP = {
  backgroundColor: "#ffffff",
  borderColor: INK.axis as string,
  borderWidth: 1,
  padding: [8, 10] as number[],
  textStyle: { fontFamily: FONT_FAMILY, fontSize: 13, color: INK.primary as string },
  extraCssText:
    "box-shadow: 0 4px 14px rgba(0,0,0,.10); border-radius: 8px; max-width: 280px; white-space: normal;",
  confine: true,
};

export function axisName(name: string) {
  return {
    name,
    nameTextStyle: { ...TEXT, color: INK.muted },
  };
}

export const AXIS_COMMON = {
  axisLine: { lineStyle: { color: INK.axis } },
  axisTick: { show: false },
  axisLabel: { ...TEXT },
  splitLine: { lineStyle: { color: INK.grid } },
} as const;

interface Props {
  option: EChartsOption;
  height: number;
  ariaLabel: string;
  onClick?: (params: { name?: string; data?: unknown }) => void;
  className?: string;
}

export default function EChart({ option, height, ariaLabel, onClick, className }: Props) {
  return (
    <div role="img" aria-label={ariaLabel} className={className}>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        style={{ height, width: "100%" }}
        onEvents={onClick ? { click: onClick } : undefined}
      />
    </div>
  );
}
