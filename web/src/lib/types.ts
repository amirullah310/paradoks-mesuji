// Kontrak data: cermin dari keluaran analysis/03_export_web.py.
// Jika diubah, ubah juga schema.ts dan 03_export_web.py dalam satu perubahan.

export interface PanelRow {
  kode: string; // kode BPS, mis. "1811"; "1800" = provinsi
  nama: string;
  tahun: number; // 2015-2026
  rls: number | null; // tahun, penduduk 25+
  hls: number | null; // tahun, anak usia 7
  ipm: number | null; // seri UHH LF SP2020, ada 2020-2026
  pctMiskin: number | null; // persen, ada 2015-2025
  pengeluaran: number | null; // ribu Rp/orang/tahun
}

export interface Region {
  kode: string;
  nama: string;
  tipe: "kabupaten" | "kota";
  penduduk: number;
  kepadatan: number; // jiwa/km2
  luasKm2: number; // dari GeoJSON (proyeksi equal-area)
  sekolah: { smp: number; sma: number; smk: number };
  sekolahPer100rb: number; // (SMA+SMK) per 100 ribu penduduk
  sekolahPer100km2: number; // (SMA+SMK) per 100 km2
  smpPer100rb: number; // SMP per 100 ribu penduduk
  pctPdrbPrimer: number; // persen, 2025
  clusterId: number;
  peringkat: Record<string, number>; // 1 = nilai terendah di 15 kab/kota
}

export interface Correlations {
  vars: string[];
  rho: number[][];
  p: number[][];
  tahun: number;
}

export interface Recommendation {
  intervensi: string;
  sasaran: string;
  insightId: string;
}

export interface Cluster {
  id: number;
  nama: string;
  ringkasan: string;
  anggota: string[]; // kode wilayah
  profil: Record<string, number>; // z-score rata-rata per variabel
  rekomendasi: Recommendation[];
}

export interface Disparity {
  indikator: "rls" | "hls" | "ipm" | "pctMiskin";
  tahun: number;
  selisih: number; // tertinggi - terendah
  cv: number; // koefisien variasi, persen
}

export interface Insight {
  id: string;
  halaman: 1 | 2 | 3;
  judul: string;
  angka: string;
  teks: string;
}

export interface Hipotesis {
  id: string;
  pernyataan: string;
  hasil: "didukung" | "sebagian" | "tidak didukung";
  bukti: string;
}

export interface Meta {
  diaksesPada: string; // ISO date
  dataset: {
    periode: string;
    jumlahWilayah: number;
    jumlahBarisPanel: number;
    jumlahNilaiTerisi: number;
    tahunPenampang: number;
    variabel: string[];
  };
  sumber: { nama: string; url: string; variabel: string[]; periode: string; berkas: string }[];
  definisi: Record<string, string>;
  metode: {
    korelasi: string;
    disparitas: string;
    clustering: string;
    variabelCluster: string[];
    kTerpilih: number;
    evaluasiK: { k: number; silhouette: number; ariWard: number; inertia: number }[];
    peringkat: string;
  };
  hipotesis: Hipotesis[];
  korelasiKabupaten: Correlations & { n: number };
  keterbatasan: string[];
  /** Format Lampiran 2 guidebook: Tools AI, tujuan penggunaan, bagian karya yang terkait. */
  aiDisclosure: { alat: string; tujuan: string; bagian: string }[];
  verifikasiAi: string[];
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: { kode_wilayah: string; kab_kota: string };
    geometry: { type: string; coordinates: unknown };
  }[];
}

export type PanelIndicator = "rls" | "hls" | "ipm" | "pctMiskin" | "pengeluaran";
