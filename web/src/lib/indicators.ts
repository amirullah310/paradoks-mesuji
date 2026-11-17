// Label, satuan, dan format tampilan tiap variabel. Bukan data: hanya teks antarmuka.
import { fmt, fmtInt, fmtRpJuta } from "./format";
import type { PanelIndicator } from "./types";

export interface IndicatorInfo {
  key: string;
  label: string; // label lengkap untuk judul & pilihan
  short: string; // label pendek untuk sel tabel / heatmap
  unit: string; // satuan untuk label sumbu
  digits: number;
  log?: boolean; // sumbu log pada scatter
}

export const INDICATORS: Record<string, IndicatorInfo> = {
  rls: { key: "rls", label: "Rata-rata Lama Sekolah (RLS)", short: "RLS", unit: "tahun", digits: 2 },
  hls: { key: "hls", label: "Harapan Lama Sekolah (HLS)", short: "HLS", unit: "tahun", digits: 2 },
  ipm: { key: "ipm", label: "Indeks Pembangunan Manusia (IPM)", short: "IPM", unit: "indeks", digits: 2 },
  pctMiskin: {
    key: "pctMiskin",
    label: "Persentase penduduk miskin",
    short: "% miskin",
    unit: "%",
    digits: 2,
  },
  pengeluaran: {
    key: "pengeluaran",
    label: "Pengeluaran riil per kapita",
    short: "Pengeluaran",
    unit: "ribu Rp/orang/tahun",
    digits: 0,
  },
  pctPdrbPrimer: {
    key: "pctPdrbPrimer",
    label: "Porsi PDRB sektor primer",
    short: "% PDRB primer",
    unit: "%",
    digits: 2,
  },
  sekolahPer100rb: {
    key: "sekolahPer100rb",
    label: "SMA+SMK per 100 ribu penduduk",
    short: "Sekolah/100 rb",
    unit: "sekolah per 100 ribu penduduk",
    digits: 2,
  },
  sekolahPer100km2: {
    key: "sekolahPer100km2",
    label: "SMA+SMK per 100 km²",
    short: "Sekolah/100 km²",
    unit: "sekolah per 100 km², skala log",
    digits: 2,
    log: true,
  },
  smpPer100rb: {
    key: "smpPer100rb",
    label: "SMP per 100 ribu penduduk",
    short: "SMP/100 rb",
    unit: "sekolah per 100 ribu penduduk",
    digits: 2,
  },
  kepadatan: {
    key: "kepadatan",
    label: "Kepadatan penduduk",
    short: "Kepadatan",
    unit: "jiwa/km², skala log",
    digits: 0,
    log: true,
  },
};

export const PANEL_INDICATORS: PanelIndicator[] = ["rls", "hls", "ipm", "pctMiskin", "pengeluaran"];

export const MAP_INDICATORS = ["rls", "hls", "ipm", "pctMiskin"] as const;
export type MapIndicator = (typeof MAP_INDICATORS)[number];

export const SCATTER_X = [
  "pctMiskin",
  "pengeluaran",
  "pctPdrbPrimer",
  "sekolahPer100rb",
  "sekolahPer100km2",
  "kepadatan",
] as const;
export type ScatterX = (typeof SCATTER_X)[number];

export const SCATTER_Y = ["hls", "rls"] as const;
export type ScatterY = (typeof SCATTER_Y)[number];

export const RANK_ROWS = [
  "pctMiskin",
  "rls",
  "hls",
  "ipm",
  "pengeluaran",
  "sekolahPer100rb",
  "smpPer100rb",
  "sekolahPer100km2",
  "kepadatan",
] as const;

/** Nilai + satuan untuk teks, mis. "7,30 tahun", "5,92%", "Rp9,84 juta". */
export function fmtIndicator(key: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return fmt(null);
  const info = INDICATORS[key];
  if (key === "pengeluaran") return fmtRpJuta(value);
  if (key === "kepadatan") return `${fmtInt(value)} jiwa/km²`;
  if (info?.unit === "%") return `${fmt(value, info.digits)}%`;
  if (info?.unit === "tahun") return `${fmt(value, info.digits)} tahun`;
  return fmt(value, info?.digits ?? 2);
}

/** Nilai tanpa satuan (untuk sumbu & sel). */
export function fmtPlain(key: string, value: number | null | undefined): string {
  return fmt(value, INDICATORS[key]?.digits ?? 2);
}
