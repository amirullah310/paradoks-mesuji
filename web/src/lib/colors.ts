// Palet tunggal situs. Semua warna grafik diambil dari sini.
// Palet cluster divalidasi aman buta warna (semua pasangan; deutan, protan, tritan).

export const INK = {
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#6f6e68",
  grid: "#e8e7e2",
  axis: "#c9c8c2",
  surface: "#ffffff",
} as const;

/** Satu warna aksen untuk kab/kota terpilih. */
export const ACCENT = "#d9480f";
/** Abu-abu konteks untuk wilayah lain. */
export const CONTEXT = "#c4c3bd";
export const CONTEXT_DARK = "#8f8e88";
/** Garis putus-putus rata-rata provinsi. */
export const PROVINCE = "#3d3c39";

/** Ramp sekuensial satu hue (terang = rendah, gelap = tinggi) untuk choropleth. */
export const SEQUENTIAL = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"];

/** Diverging untuk korelasi: negatif (merah), netral (abu), positif (biru). */
export const DIVERGING = {
  negative: "#e34948",
  neutral: "#f0efec",
  positive: "#2a78d6",
} as const;

/** Warna kategori hanya untuk cluster; mengikuti id cluster, bukan urutan tampil. */
export const CLUSTER_COLORS: Record<number, string> = {
  1: "#2a78d6",
  2: "#008300",
  3: "#eda100",
  4: "#e87ba4",
};

export function clusterColor(id: number): string {
  return CLUSTER_COLORS[id] ?? CONTEXT_DARK;
}
