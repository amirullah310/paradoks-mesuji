"use client";

// Grafik garis kecil satu sumbu: dipakai untuk ketimpangan per tahun dan panel tren kecil.
import { useMemo } from "react";
import { INK } from "@/lib/colors";
import { fmt } from "@/lib/format";
import EChart, { AXIS_COMMON, axisName, TEXT, TOOLTIP, type EChartsOption } from "./EChart";

export interface LineSeries {
  name: string;
  color: string;
  dashed?: boolean;
  points: { tahun: number; value: number | null }[];
}

interface Props {
  series: LineSeries[];
  unit: string;
  digits?: number;
  markYear?: number;
  ariaLabel: string;
  height?: number;
}

export default function SimpleLine({ series, unit, digits = 2, markYear, ariaLabel, height = 240 }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const years = [
      ...new Set(series.flatMap((s) => s.points.filter((p) => p.value !== null).map((p) => p.tahun))),
    ].sort((a, b) => a - b);
    const multi = series.length > 1;
    return {
      textStyle: TEXT,
      animation: false,
      grid: { left: 8, right: multi ? 84 : 20, top: 36, bottom: 8, containLabel: true },
      tooltip: {
        ...TOOLTIP,
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: INK.muted, width: 1 } },
        valueFormatter: (v: unknown) => (typeof v === "number" ? fmt(v, digits) : fmt(null)),
      },
      xAxis: {
        type: "category",
        data: years.map(String),
        boundaryGap: false,
        ...AXIS_COMMON,
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: true,
        ...axisName(unit),
        ...AXIS_COMMON,
        axisLine: { show: false },
        axisLabel: { ...TEXT, formatter: (v: number) => fmt(v, digits).replace(/,0+$/, "") },
      },
      series: series.map((s, idx) => ({
        type: "line" as const,
        name: s.name,
        data: years.map((t) => s.points.find((p) => p.tahun === t)?.value ?? null),
        symbol: "circle",
        symbolSize: 6,
        showSymbol: !s.dashed,
        lineStyle: { color: s.color, width: 2, type: s.dashed ? ("dashed" as const) : ("solid" as const) },
        itemStyle: { color: s.color, borderColor: "#ffffff", borderWidth: 1 },
        endLabel: multi
          ? { show: true, formatter: s.name, color: INK.secondary, fontSize: 12, distance: 6 }
          : undefined,
        markLine:
          idx === 0 && markYear !== undefined && years.includes(markYear)
            ? {
                silent: true,
                symbol: "none",
                label: { show: false },
                lineStyle: { color: INK.axis, type: "solid" as const, width: 1 },
                data: [{ xAxis: String(markYear) }],
              }
            : undefined,
      })),
    };
  }, [series, unit, digits, markYear]);

  return <EChart option={option} height={height} ariaLabel={ariaLabel} />;
}
