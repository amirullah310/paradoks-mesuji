"use client";

import { useMemo } from "react";
import { DIVERGING, INK } from "@/lib/colors";
import { fmt, fmtP } from "@/lib/format";
import { INDICATORS } from "@/lib/indicators";
import type { Correlations } from "@/lib/types";
import EChart, { TEXT, TOOLTIP, type EChartsOption } from "./EChart";

interface Props {
  correlations: Correlations;
  ariaLabel: string;
  height?: number;
}

export default function CorrHeatmap({ correlations, ariaLabel, height = 470 }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const { vars, rho, p } = correlations;
    const labels = vars.map((v) => INDICATORS[v]?.short ?? v);
    const n = vars.length;
    const data = [];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const r = rho[i][j];
        const diag = i === j;
        const ns = !diag && p[i][j] >= 0.05;
        data.push({
          // baris pertama di atas: sumbu y dibalik lewat indeks
          value: [j, n - 1 - i, r],
          i,
          j,
          label: {
            color: diag ? INK.muted : Math.abs(r) >= 0.6 ? "#ffffff" : INK.primary,
            formatter: diag ? "–" : ns ? `{v|${fmt(r)}}\n{ns|ts}` : fmt(r),
            rich: {
              v: { fontSize: 12, color: INK.secondary, fontFamily: TEXT.fontFamily },
              ns: { fontSize: 11, color: INK.muted, fontFamily: TEXT.fontFamily, lineHeight: 14 },
            },
          },
          itemStyle: diag ? { color: "#f7f6f3" } : undefined,
        });
      }
    }

    return {
      textStyle: TEXT,
      animation: false,
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        ...TOOLTIP,
        trigger: "item",
        formatter: (param: unknown) => {
          const d = (param as { data: { i: number; j: number } }).data;
          if (d.i === d.j) return INDICATORS[vars[d.i]]?.label ?? vars[d.i];
          const pv = p[d.i][d.j];
          return `<strong>${labels[d.i]} × ${labels[d.j]}</strong><br/>ρ = ${fmt(rho[d.i][d.j])} · ${fmtP(pv)}<br/>${
            pv < 0.05 ? "Signifikan pada taraf 5%" : "Tidak signifikan pada taraf 5%"
          }`;
        },
      },
      xAxis: {
        type: "category",
        data: labels,
        position: "bottom",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...TEXT, rotate: 40, interval: 0 },
        splitArea: { show: false },
      },
      yAxis: {
        type: "category",
        data: [...labels].reverse(),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...TEXT, interval: 0 },
      },
      visualMap: {
        show: false,
        type: "continuous",
        min: -1,
        max: 1,
        dimension: 2,
        inRange: { color: [DIVERGING.negative, DIVERGING.neutral, DIVERGING.positive] },
      },
      series: [
        {
          type: "heatmap",
          data,
          label: { show: true, fontSize: 12, fontFamily: TEXT.fontFamily },
          itemStyle: { borderColor: "#ffffff", borderWidth: 2 },
          emphasis: { itemStyle: { borderColor: INK.primary, borderWidth: 1.5 } },
        },
      ],
    };
  }, [correlations]);

  return <EChart option={option} height={height} ariaLabel={ariaLabel} />;
}
