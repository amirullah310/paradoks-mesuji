"use client";

import { useMemo } from "react";
import { ACCENT, CONTEXT, INK, PROVINCE } from "@/lib/colors";
import { fmtPlain, INDICATORS } from "@/lib/indicators";
import type { PanelIndicator, PanelRow } from "@/lib/types";
import EChart, { AXIS_COMMON, axisName, TEXT, TOOLTIP, type EChartsOption } from "./EChart";

interface Props {
  panel: PanelRow[];
  indicator: PanelIndicator;
  selected: string;
  provinceKode: string;
  year: number;
  ariaLabel: string;
  height?: number;
}

export default function TrendLine({
  panel,
  indicator,
  selected,
  provinceKode,
  year,
  ariaLabel,
  height = 400,
}: Props) {
  const option = useMemo<EChartsOption>(() => {
    const years = [...new Set(panel.filter((r) => r[indicator] !== null).map((r) => r.tahun))].sort(
      (a, b) => a - b,
    );
    const byKode = new Map<string, PanelRow[]>();
    for (const r of panel) {
      if (!byKode.has(r.kode)) byKode.set(r.kode, []);
      byKode.get(r.kode)!.push(r);
    }
    const seriesData = (kode: string) =>
      years.map((t) => byKode.get(kode)?.find((r) => r.tahun === t)?.[indicator] ?? null);

    const kodes = [...byKode.keys()].filter((k) => k !== provinceKode);
    const selectedName = byKode.get(selected)?.[0]?.nama ?? "";
    const context = kodes
      .filter((k) => k !== selected)
      .map((k) => ({
        type: "line" as const,
        name: byKode.get(k)![0].nama,
        data: seriesData(k),
        showSymbol: false,
        silent: true,
        lineStyle: { color: CONTEXT, width: 1.25 },
        itemStyle: { color: CONTEXT },
        z: 1,
      }));

    const markYear = years.includes(year)
      ? {
          silent: true,
          symbol: "none",
          label: { show: false },
          lineStyle: { color: INK.axis, type: "solid" as const, width: 1 },
          data: [{ xAxis: String(year) }],
        }
      : undefined;

    return {
      textStyle: TEXT,
      animation: false,
      grid: { left: 8, right: 96, top: 36, bottom: 8, containLabel: true },
      tooltip: {
        ...TOOLTIP,
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: INK.muted, width: 1 } },
        formatter: (params: unknown) => {
          const list = params as { axisValue: string }[];
          const t = Number(list[0]?.axisValue);
          const rows = kodes
            .map((k) => ({
              nama: byKode.get(k)![0].nama,
              v: byKode.get(k)!.find((r) => r.tahun === t)?.[indicator] ?? null,
            }))
            .filter((r): r is { nama: string; v: number } => r.v !== null)
            .sort((a, b) => a.v - b.v);
          const sel = byKode.get(selected)?.find((r) => r.tahun === t)?.[indicator] ?? null;
          const prov = byKode.get(provinceKode)?.find((r) => r.tahun === t)?.[indicator] ?? null;
          const line = (label: string, v: number | null, color?: string) =>
            `<div style="display:flex;justify-content:space-between;gap:16px"><span>${
              color
                ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px"></span>`
                : ""
            }${label}</span><strong>${fmtPlain(indicator, v)}</strong></div>`;
          const lo = rows[0];
          const hi = rows[rows.length - 1];
          return [
            `<div style="margin-bottom:4px;color:${INK.muted}">${t} · ${INDICATORS[indicator].short} (${INDICATORS[indicator].unit})</div>`,
            line(selectedName, sel, ACCENT),
            line("Provinsi Lampung", prov, PROVINCE),
            hi ? line(`Tertinggi: ${hi.nama}`, hi.v) : "",
            lo ? line(`Terendah: ${lo.nama}`, lo.v) : "",
          ].join("");
        },
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
        ...axisName(INDICATORS[indicator].unit),
        ...AXIS_COMMON,
        axisLine: { show: false },
        axisLabel: { ...TEXT, formatter: (v: number) => fmtPlain(indicator, v).replace(/,00$/, "") },
      },
      series: [
        ...context,
        {
          type: "line",
          name: "Provinsi Lampung",
          data: seriesData(provinceKode),
          showSymbol: false,
          lineStyle: { color: PROVINCE, width: 2, type: "dashed" },
          itemStyle: { color: PROVINCE },
          endLabel: { show: true, formatter: "Provinsi", color: INK.secondary, fontSize: 12, distance: 6 },
          z: 5,
        },
        {
          type: "line",
          name: selectedName,
          data: seriesData(selected),
          symbol: "circle",
          symbolSize: 7,
          showSymbol: true,
          lineStyle: { color: ACCENT, width: 2.5 },
          itemStyle: { color: ACCENT, borderColor: "#ffffff", borderWidth: 1.5 },
          endLabel: {
            show: true,
            formatter: selectedName.replace("Kota ", ""),
            color: INK.primary,
            fontWeight: 700,
            fontSize: 12,
            distance: 6,
          },
          markLine: markYear,
          z: 10,
        },
      ],
    };
  }, [panel, indicator, selected, provinceKode, year]);

  return <EChart option={option} height={height} ariaLabel={ariaLabel} />;
}
