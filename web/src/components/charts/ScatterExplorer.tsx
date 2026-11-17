"use client";

import { useMemo } from "react";
import { ACCENT, CONTEXT_DARK, INK } from "@/lib/colors";
import { fmtIndicator, fmtPlain, INDICATORS } from "@/lib/indicators";
import { linearFit } from "@/lib/stats";
import EChart, { AXIS_COMMON, TEXT, TOOLTIP, type EChartsOption } from "./EChart";

export interface ScatterPoint {
  kode: string;
  nama: string;
  x: number;
  y: number;
}

interface Props {
  points: ScatterPoint[];
  xKey: string;
  yKey: string;
  selected: string;
  onSelect: (kode: string) => void;
  ariaLabel: string;
  height?: number;
}

export default function ScatterExplorer({
  points,
  xKey,
  yKey,
  selected,
  onSelect,
  ariaLabel,
  height = 460,
}: Props) {
  const option = useMemo<EChartsOption>(() => {
    const xInfo = INDICATORS[xKey];
    const yInfo = INDICATORS[yKey];
    const isLog = Boolean(xInfo.log);
    const tx = (x: number) => (isLog ? Math.log10(x) : x);

    // Garis tren (alat bantu visual); pada sumbu log dihitung terhadap log10(x).
    const fit = linearFit(points.map((p) => [tx(p.x), p.y]));
    const xs = points.map((p) => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const trend = fit
      ? [
          [xMin, fit.a + fit.b * tx(xMin)],
          [xMax, fit.a + fit.b * tx(xMax)],
        ]
      : [];

    return {
      textStyle: TEXT,
      animation: false,
      grid: { left: 12, right: 28, top: 20, bottom: 36, containLabel: true },
      tooltip: {
        ...TOOLTIP,
        trigger: "item",
        formatter: (p: unknown) => {
          const d = (p as { data: { name?: string; value?: [number, number] } }).data;
          if (!d?.name || !d.value) return "";
          return `<strong>${d.name}</strong><br/>${xInfo.short}: ${fmtIndicator(xKey, d.value[0])}<br/>${yInfo.short}: ${fmtIndicator(yKey, d.value[1])}`;
        },
      },
      xAxis: {
        type: isLog ? "log" : "value",
        scale: true,
        name: `${xInfo.label} (${xInfo.unit})`,
        nameLocation: "middle",
        nameGap: 30,
        nameTextStyle: { ...TEXT, color: INK.muted },
        ...AXIS_COMMON,
        axisLabel: { ...TEXT, formatter: (v: number) => fmtPlain(xKey, v).replace(/,00$/, "") },
      },
      yAxis: {
        type: "value",
        scale: true,
        name: `${yInfo.short} (${yInfo.unit})`,
        nameTextStyle: { ...TEXT, color: INK.muted, align: "left" },
        ...AXIS_COMMON,
        axisLine: { show: false },
        axisLabel: { ...TEXT, formatter: (v: number) => fmtPlain(yKey, v).replace(/,00$/, "") },
      },
      series: [
        {
          type: "line",
          data: trend,
          silent: true,
          showSymbol: false,
          lineStyle: { color: INK.muted, width: 1.5, type: "dashed" },
          tooltip: { show: false },
          z: 1,
        },
        {
          type: "scatter",
          z: 5,
          data: points.map((p) => {
            const isSel = p.kode === selected;
            // Titik di sisi kanan diberi label di kiri agar tidak terpotong tepi grafik.
            const nearRight = (tx(p.x) - tx(xMin)) / (tx(xMax) - tx(xMin) || 1) > 0.8;
            return {
              name: p.nama,
              kode: p.kode,
              value: [p.x, p.y],
              symbolSize: isSel ? 16 : 11,
              itemStyle: {
                color: isSel ? ACCENT : CONTEXT_DARK,
                borderColor: "#ffffff",
                borderWidth: 2,
                opacity: 1,
              },
              label: {
                show: true,
                formatter: p.nama.replace("Kota ", ""),
                position: nearRight ? ("left" as const) : ("right" as const),
                distance: 6,
                fontSize: 12,
                fontFamily: TEXT.fontFamily,
                textBorderColor: "#ffffff",
                textBorderWidth: 3,
                color: isSel ? INK.primary : INK.secondary,
                fontWeight: isSel ? (700 as const) : (400 as const),
              },
              z: isSel ? 10 : 5,
            };
          }),
          labelLayout: { hideOverlap: true, moveOverlap: "shiftY" },
          emphasis: { scale: 1.2 },
        },
      ],
    };
  }, [points, xKey, yKey, selected]);

  return (
    <EChart
      option={option}
      height={height}
      ariaLabel={ariaLabel}
      onClick={(p) => {
        const kode = (p.data as { kode?: string } | undefined)?.kode;
        if (kode) onSelect(kode);
      }}
    />
  );
}
