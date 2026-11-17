// Skema zod: cermin types.ts. Build gagal jika JSON pipeline tidak cocok.
import { z } from "zod";

const num = z.number().finite();
const nullable = num.nullable();
const kode = z.string().regex(/^18\d{2}$/);

export const panelSchema = z.array(
  z.strictObject({
    kode,
    nama: z.string().min(1),
    tahun: z.number().int().min(2015).max(2026),
    rls: nullable,
    hls: nullable,
    ipm: nullable,
    pctMiskin: nullable,
    pengeluaran: nullable,
  }),
);

export const regionsSchema = z
  .array(
    z.strictObject({
      kode,
      nama: z.string().min(1),
      tipe: z.enum(["kabupaten", "kota"]),
      penduduk: num.positive(),
      kepadatan: num.positive(),
      luasKm2: num.positive(),
      sekolah: z.strictObject({ smp: num, sma: num, smk: num }),
      sekolahPer100rb: num,
      sekolahPer100km2: num,
      smpPer100rb: num,
      pctPdrbPrimer: num,
      clusterId: z.number().int().positive(),
      peringkat: z.record(z.string(), z.number().int().min(1).max(15)),
    }),
  )
  .length(15);

const matrix = z.array(z.array(num));
export const correlationsSchema = z.strictObject({
  vars: z.array(z.string()),
  rho: matrix,
  p: matrix,
  tahun: z.number().int(),
});

export const clustersSchema = z.array(
  z.strictObject({
    id: z.number().int().positive(),
    nama: z.string().min(1),
    ringkasan: z.string().min(1),
    anggota: z.array(kode).min(1),
    profil: z.record(z.string(), num),
    rekomendasi: z
      .array(
        z.strictObject({
          intervensi: z.string().min(1),
          sasaran: z.string().min(1),
          insightId: z.string(),
        }),
      )
      .min(1),
  }),
);

export const disparitySchema = z.array(
  z.strictObject({
    indikator: z.enum(["rls", "hls", "ipm", "pctMiskin"]),
    tahun: z.number().int(),
    selisih: num,
    cv: num,
  }),
);

export const insightsSchema = z.array(
  z.strictObject({
    id: z.string().regex(/^I\d+$/),
    halaman: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    judul: z.string().min(1),
    angka: z.string().min(1),
    teks: z.string().min(1),
  }),
);

export const metaSchema = z.strictObject({
  diaksesPada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataset: z.strictObject({
    periode: z.string(),
    jumlahWilayah: z.number().int(),
    jumlahBarisPanel: z.number().int(),
    jumlahNilaiTerisi: z.number().int(),
    tahunPenampang: z.number().int(),
    variabel: z.array(z.string()),
  }),
  sumber: z.array(
    z.strictObject({
      nama: z.string(),
      url: z.url(),
      variabel: z.array(z.string()),
      periode: z.string(),
      berkas: z.string(),
    }),
  ),
  definisi: z.record(z.string(), z.string()),
  metode: z.strictObject({
    korelasi: z.string(),
    disparitas: z.string(),
    clustering: z.string(),
    variabelCluster: z.array(z.string()),
    kTerpilih: z.number().int(),
    evaluasiK: z.array(z.strictObject({ k: z.number().int(), silhouette: num, ariWard: num, inertia: num })),
    peringkat: z.string(),
  }),
  hipotesis: z.array(
    z.strictObject({
      id: z.string(),
      pernyataan: z.string(),
      hasil: z.enum(["didukung", "sebagian", "tidak didukung"]),
      bukti: z.string(),
    }),
  ),
  korelasiKabupaten: correlationsSchema.extend({ n: z.number().int() }),
  keterbatasan: z.array(z.string()).min(1),
  aiDisclosure: z.array(z.strictObject({ alat: z.string(), tujuan: z.string(), bagian: z.string() })).min(1),
  verifikasiAi: z.array(z.string()),
});

export const geoSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z
    .array(
      z.object({
        type: z.literal("Feature"),
        properties: z.object({ kode_wilayah: kode, kab_kota: z.string() }),
        geometry: z.object({ type: z.string(), coordinates: z.unknown() }),
      }),
    )
    .length(15),
});
