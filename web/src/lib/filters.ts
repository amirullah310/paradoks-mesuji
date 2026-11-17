"use client";

// State filter global disimpan di URL (nuqs) agar tampilan bisa dibagikan.
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { DEFAULT_REGION, DEFAULT_YEAR, YEAR_MAX, YEAR_MIN } from "./constants";
import { MAP_INDICATORS, SCATTER_X, SCATTER_Y } from "./indicators";

export function useYear() {
  const [raw, setYear] = useQueryState("tahun", parseAsInteger.withDefault(DEFAULT_YEAR));
  const year = Math.min(YEAR_MAX, Math.max(YEAR_MIN, raw));
  return [year, setYear] as const;
}

/** Kab/kota terpilih; kode yang tidak dikenal kembali ke Mesuji. */
export function useRegion(validKodes: string[]) {
  const [raw, setRegion] = useQueryState("wilayah", parseAsString.withDefault(DEFAULT_REGION));
  const region = validKodes.includes(raw) ? raw : DEFAULT_REGION;
  return [region, setRegion] as const;
}

export function useMapIndicator() {
  return useQueryState("indikator", parseAsStringLiteral(MAP_INDICATORS).withDefault("rls"));
}

export function useScatterX() {
  return useQueryState("x", parseAsStringLiteral(SCATTER_X).withDefault("pctMiskin"));
}

export function useScatterY() {
  return useQueryState("y", parseAsStringLiteral(SCATTER_Y).withDefault("hls"));
}
