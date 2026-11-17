// Util tampilan kecil. Analisis utama dikerjakan di Python; ini hanya alat bantu grafik.

/** Garis tren kuadrat terkecil y = a + b x (alat bantu visual pada scatter). */
export function linearFit(points: [number, number][]): { a: number; b: number } | null {
  const n = points.length;
  if (n < 2) return null;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
  }
  if (sxx === 0) return null;
  const b = sxy / sxx;
  return { a: my - b * mx, b };
}

/** Peringkat 1 = nilai terendah; nilai sama mendapat peringkat terkecil. */
export function rankAscending(values: number[], target: number): number {
  return values.filter((v) => v < target).length + 1;
}
