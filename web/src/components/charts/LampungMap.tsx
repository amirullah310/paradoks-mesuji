"use client";

import { useMemo } from "react";
import { ACCENT, INK, SEQUENTIAL } from "@/lib/colors";
import type { GeoFeatureCollection } from "@/lib/types";
import EChart, { echarts, TEXT, TOOLTIP, type EChartsOption } from "./EChart";

export interface MapItem {
  kode: string;
  nama: string;
  /** Nilai untuk skala warna (mode sekuensial); null = data tidak tersedia. */
  value: number | null;
  /** Warna tetap (mode kategori, mis. cluster). */
  color?: string;
  /** Baris teks tooltip. */
  tooltip: string[];
}

interface Props {
  geo: GeoFeatureCollection;
  items: MapItem[];
  mode: "sequential" | "categorical";
  selected: string;
  onSelect: (kode: string) => void;
  formatValue?: (v: number) => string;
  ariaLabel: string;
  height?: number;
}

/** Nama pendek agar label muat di peta. */
function shortName(nama: string): string {
  return nama
    .replace("Kota ", "")
    .replace("Lampung ", "Lam. ")
    .replace("Tulang Bawang", "Tuba")
    .replace("Bandar Lam. ", "Bandar Lampung");
}

export default function LampungMap({
  geo,
  items,
  mode,
  selected,
  onSelect,
  formatValue,
  ariaLabel,
  height = 440,
}: Props) {
  if (!echarts.getMap("lampung")) {
    // Daftarkan peta sekali. Tipe GeoJSON ECharts lebih sempit daripada tipe kontrak kita;
    // bentuknya sudah divalidasi zod saat build.
    echarts.registerMap("lampung", geo as unknown as Parameters<typeof echarts.registerMap>[1]);
  }

  const option = useMemo<EChartsOption>(() => {
    const byKode = new Map(items.map((i) => [i.kode, i]));
    const values = items.map((i) => i.value).filter((v): v is number => v !== null);
    const hasValues = values.length > 0;
    const min = hasValues ? Math.min(...values) : 0;
    const max = hasValues ? Math.max(...values) : 1;

    return {
      textStyle: TEXT,
      tooltip: {
        ...TOOLTIP,
        trigger: "item",
        formatter: (p: unknown) => {
          const item = byKode.get((p as { name: string }).name);
          if (!item) return "";
          return `<strong>${item.nama}</strong><br/>${item.tooltip.join("<br/>")}`;
        },
      },
      visualMap:
        mode === "sequential" && hasValues
          ? {
              type: "continuous",
              min,
              max,
              calculable: false,
              orient: "horizontal",
              left: "center",
              bottom: 0,
              itemWidth: 12,
              itemHeight: 160,
              inRange: { color: SEQUENTIAL },
              text: [
                formatValue ? formatValue(max) : String(max),
                formatValue ? formatValue(min) : String(min),
              ],
              textStyle: TEXT,
              hoverLink: false,
            }
          : undefined,
      series: [
        {
          type: "map",
          map: "lampung",
          nameProperty: "kode_wilayah",
          aspectScale: 1,
          roam: false,
          selectedMode: false,
          top: 8,
          bottom: mode === "sequential" ? 44 : 8,
          left: 8,
          right: 8,
          label: {
            show: true,
            fontFamily: TEXT.fontFamily,
            fontSize: 12,
            color: INK.primary,
            textBorderColor: "#ffffff",
            textBorderWidth: 2.5,
            formatter: (p: { name: string }) => shortName(byKode.get(p.name)?.nama ?? p.name),
          },
          labelLayout: { hideOverlap: true },
          itemStyle: { areaColor: "#ecebe6", borderColor: "#ffffff", borderWidth: 1 },
          emphasis: {
            label: { color: INK.primary },
            itemStyle: { areaColor: undefined, borderColor: INK.primary, borderWidth: 1.5 },
          },
          data: items.map((i) => {
            const isSelected = i.kode === selected;
            return {
              name: i.kode,
              value: i.value ?? Number.NaN,
              label: isSelected ? { fontWeight: 700 } : undefined,
              itemStyle: {
                ...(mode === "categorical" && i.color ? { areaColor: i.color } : {}),
                ...(isSelected ? { borderColor: ACCENT, borderWidth: 3 } : {}),
              },
              emphasis: mode === "categorical" && i.color ? { itemStyle: { areaColor: i.color } } : undefined,
            };
          }),
        },
      ],
    };
  }, [items, mode, selected, formatValue]);

  return (
    <EChart
      option={option}
      height={height}
      ariaLabel={ariaLabel}
      onClick={(p) => {
        if (p.name && items.some((i) => i.kode === p.name)) onSelect(p.name);
      }}
    />
  );
}
