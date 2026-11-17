// Format angka gaya Indonesia (7,30; 5,92%; Rp1,12 juta).

export const TIDAK_TERSEDIA = "data tidak tersedia";

export function fmt(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return TIDAK_TERSEDIA;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
    .format(value)
    .replace(/^-/, "−");
}

/** Pengeluaran dalam ribu rupiah -> "Rp9,84 juta". */
export function fmtRpJuta(ribuRp: number | null | undefined): string {
  if (ribuRp === null || ribuRp === undefined) return TIDAK_TERSEDIA;
  return `Rp${fmt(ribuRp / 1000, 2)} juta`;
}

export function fmtInt(value: number | null | undefined): string {
  return fmt(value, 0);
}

/** p-value: "p = 0,04" atau "p < 0,001". */
export function fmtP(p: number): string {
  if (p < 0.001) return "p < 0,001";
  return `p = ${fmt(p, p < 0.1 ? 3 : 2)}`;
}

export function fmtTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}
