"use client";

import { useMemo } from "react";
import { INK } from "@/lib/colors";
import { fmt } from "@/lib/format";
import { INDICATORS } from "@/lib/indicators";
import EChart, { AXIS_COMMON, TEXT, TOOLTIP, type EChartsOption } from "./EChart";

interface Props {
  profil: Record<string, number>;
  vars: string[];
  color: string;
  /** Batas sumbu bersama agar semua panel bisa dibandingkan. */
  limit: number;
  ariaLabel: string;
  height?: number;
}

export default function ClusterProfile({ profil, vars, color, limit, ariaLabel, height = 250 }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const ordered = [...vars].reverse(); // variabel pertama di atas
    return {
      textStyle: TEXT,
      animation: false,
      grid: { left: 8, right: 16, top: 4, bottom: 4, containLabel: true },
      tooltip: {
        ...TOOLTIP,
        trigger: "item",
        formatter: (p: unknown) => {
          const d = p as { name: string; value: number };
          return `${d.name}<br/><strong>z = ${fmt(d.value)}</strong> (0 = rata-rata 15 kab/kota)`;
        },
      },
      xAxis: {
        type: "value",
        min: -limit,
        max: limit,
        ...AXIS_COMMON,
        axisLine: { show: false },
        axisLabel: { ...TEXT, formatter: (v: number) => fmt(v, 0) },
      },
      yAxis: {
        type: "category",
        data: ordered.map((v) => INDICATORS[v]?.short ?? v),
        axisLine: { show: true, lineStyle: { color: INK.axis } },
        axisTick: { show: false },
        axisLabel: { ...TEXT },
      },
      series: [
        {
          type: "bar",
          barWidth: 14,
          data: ordered.map((v) => {
            const z = profil[v];
            return {
              value: z,
              itemStyle: { color, borderRadius: z >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4] },
              label: {
                show: true,
                position: z >= 0 ? ("right" as const) : ("left" as const),
                formatter: fmt(z, 1),
                color: INK.secondary,
                fontSize: 12,
                fontFamily: TEXT.fontFamily,
              },
            };
          }),
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: { color: INK.muted, width: 1, type: "solid" },
            data: [{ xAxis: 0 }],
          },
        },
      ],
    };
  }, [profil, vars, color, limit]);

  return <EChart option={option} height={height} ariaLabel={ariaLabel} />;
}
