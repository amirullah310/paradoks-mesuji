# PRD — Dashboard Paradoks Mesuji

Nov 16, 2026 · @Amir

**Versi 2 (siap develop):** stack diganti ke Next.js 16 statis di Vercel, data BPS sudah terkumpul di `data/raw/`, fitur disesuaikan dengan data yang benar-benar tersedia.

## Ringkasan produk

Situs web statis (Next.js 16 + React 19) yang memperlihatkan ketimpangan pendidikan 15 kab/kota Lampung, menguji paradoks Mesuji, dan mengelompokkan daerah ke tipologi dengan rekomendasi masing-masing. Semua olah data dan clustering dikerjakan di Python; situs hanya membaca file JSON hasil olahan. Link publik harus siap dinilai juri pada 14 Desember 2026.

**Tujuan produk:** dalam 3 menit, juri atau pejabat dinas bisa melihat (1) seberapa timpang pendidikan Lampung, (2) bahwa kemiskinan tidak menjelaskan semuanya, dan (3) intervensi apa yang cocok untuk tiap tipe daerah.

**Ukuran keberhasilan:**

| Ukuran | Target |
| --- | --- |
| Lolos 7 besar finalis | Ya |
| Komponen minimal guidebook terpenuhi | 9 dari 9 |
| Waktu muat halaman pertama | < 2 detik (situs statis) |
| Link bisa dibuka tanpa login, di incognito | 100% pengecekan harian sampai 22 Des |
| Demo lengkap 3 halaman | ≤ 3 menit |

## Pengguna dan skenario

Pengguna utama adalah juri; pengguna sasaran yang dibayangkan adalah perencana pendidikan daerah.

| Pengguna | Kebutuhan | Skenario |
| --- | --- | --- |
| Juri lomba | Menilai data, analisis, visualisasi, insight dalam waktu singkat | Membuka link dari PDF, menelusuri 3 halaman, mengecek sumber data |
| Staf Dinas Pendidikan / Bappeda | Tahu daerah mana tertinggal dan kenapa | Memilih kab/kota-nya, melihat posisi, cluster, dan rekomendasi |
| Tim sendiri saat final | Demo lancar 3 menit | Alur klik yang sudah dilatih: peta → scatter Mesuji → cluster |

## Ruang lingkup

**Masuk (v1, untuk submit):**

- 3 halaman cerita (Masalah, Paradoks, Tipologi & Solusi) + 1 halaman Tentang Data
- 15 kab/kota; tren 2015–2026 untuk RLS, HLS, pengeluaran; 2015–2025 untuk kemiskinan; 2020–2026 untuk IPM seri baru
- Variabel penjelas tahun terakhir: porsi PDRB primer 2025, jumlah sekolah 2025, penduduk dan kepadatan
- Korelasi Spearman dan clustering K-Means, dihitung offline di Python lalu diekspor ke JSON
- Filter dan pilihan kab/kota yang tersimpan di URL, sehingga tampilan bisa dibagikan
- Unduh dataset bersih (CSV) dari situs

**Tidak masuk:**

- Backend, database, login, atau input data dari pengguna
- Data tingkat kecamatan atau sekolah
- APS, jumlah guru, dan jumlah murid per kab/kota (tidak dipublikasikan BPS online)
- Model prediksi/forecast dan clustering yang dihitung ulang di browser
- Chatbot atau teks AI yang dibuat saat runtime

## Kebutuhan fungsional

P0 wajib ada saat submit; P1 dikerjakan jika waktu cukup; P2 opsional.

| ID | Halaman | Kebutuhan | Data (file JSON) | Prioritas |
| --- | --- | --- | --- | --- |
| FR-01 | Global | Filter tahun (slider 2015–2026, default 2025) dan pilih kab/kota (combobox, default Mesuji); keduanya tersimpan di URL query | panel.json | P0 |
| FR-02 | Global | Navigasi 4 halaman + header berisi judul halaman dan satu kalimat temuan | insights.json | P0 |
| FR-03 | Global | Footer tiap halaman: sumber data, periode, tanggal akses, link ke Tentang Data | meta.json | P0 |
| FR-04 | 1. Masalah | 4 kartu KPI: rata-rata provinsi, tertinggi, terendah, selisih — untuk indikator terpilih dan tahun terpilih | panel.json | P0 |
| FR-05 | 1. Masalah | Peta choropleth 15 kab/kota; pilih indikator RLS / HLS / IPM / % miskin; klik wilayah = pilih kab/kota | panel.json, lampung.geojson | P0 |
| FR-06 | 1. Masalah | Grafik garis tren 2015–2026; kab/kota terpilih diberi warna aksen, sisanya abu-abu, garis putus-putus rata-rata provinsi | panel.json | P0 |
| FR-07 | 1. Masalah | Grafik ketimpangan per tahun: selisih tertinggi–terendah dan koefisien variasi | disparity.json | P1 |
| FR-08 | 2. Paradoks | Scatter sumbu Y = RLS atau HLS; sumbu X dipilih dari: % miskin, pengeluaran, % PDRB primer, sekolah per 100 ribu penduduk, kepadatan penduduk; garis tren + label tiap titik; Mesuji disorot | panel.json, regions.json | P0 |
| FR-09 | 2. Paradoks | Heatmap korelasi Spearman antar variabel, nilai ρ tertulis di sel, sel tidak signifikan diberi tanda | correlations.json | P0 |
| FR-10 | 2. Paradoks | Tabel peringkat Mesuji 1–15 untuk tiap indikator (miskin, RLS, HLS, IPM, pengeluaran, sekolah/penduduk, kepadatan) | regions.json | P0 |
| FR-11 | 2. Paradoks | Tren kemiskinan vs RLS Mesuji dibanding rata-rata provinsi (dua panel kecil) | panel.json | P1 |
| FR-12 | 3. Tipologi | Peta warna per cluster dengan legenda nama cluster | clusters.json, lampung.geojson | P0 |
| FR-13 | 3. Tipologi | Profil tiap cluster: bar z-score per variabel | clusters.json | P0 |
| FR-14 | 3. Tipologi | Kartu rekomendasi per cluster: masalah utama, intervensi, pihak penerima, insight yang mendasari | clusters.json, insights.json | P0 |
| FR-15 | 3. Tipologi | Panel detail kab/kota terpilih: cluster, peringkat, dan rekomendasinya | regions.json, clusters.json | P1 |
| FR-16 | Tentang Data | Definisi indikator, tabel sumber + link, metode, keterbatasan, AI disclosure | meta.json | P0 |
| FR-17 | Tentang Data | Tombol unduh CSV panel bersih | /data/panel.csv | P1 |
| FR-18 | Global | Tampilan responsif (layar ≥ 360 px) | — | P1 |
| FR-19 | Global | Mode presentasi: sembunyikan filter, perbesar grafik, navigasi keyboard ← → | — | P2 |

## Kebutuhan data

Data mentah sudah terkumpul di `data/raw/` (rincian sumber di `data/SUMBER.md`). Pipeline Python mengubahnya menjadi 7 file di `web/public/data/`; situs hanya membaca file ini dan tidak menghitung apa pun selain filter.

**Bahan mentah → dipakai untuk apa**

| File mentah | Variabel | Tahun | Dipakai di |
| --- | --- | --- | --- |
| `bps_rls_kabkota_2015-2026.csv` | RLS | 2015–2026 | panel, peta, tren, scatter, cluster |
| `bps_hls_kabkota_2015-2026.csv` | HLS | 2015–2026 | panel, peta, tren, scatter, cluster |
| `bps_ipm-uhh-lf-sp2020_kabkota_2020-2026.csv` | IPM seri baru | 2020–2026 | panel, peta |
| `bps_p0-persen-miskin_kabkota_2015-2025.csv` | % penduduk miskin | 2015–2025 | panel, scatter, cluster |
| `bps_pengeluaran-riil-per-kapita-disesuaikan_ribu-rp-tahun_kabkota_2015-2026.csv` | Pengeluaran riil | 2015–2026 | panel, scatter, cluster |
| `bps_pdrb-adhb-sektor_kabkota_2025_milyar-rp.csv` | % PDRB primer | 2025 | regions, scatter, cluster |
| `bps_jumlah-sekolah-smp-sma-smk_kabkota_2025.csv` | Jumlah sekolah | 2025 | regions, scatter, cluster |
| `../processed/penduduk_kabkota_bersih.csv` | Penduduk, kepadatan | ±2024 | regions (rasio per penduduk dan per luas) |
| `../geo/lampung_kabkota.geojson` | Batas wilayah | — | peta |

File `opendata-lampung_*` hanya untuk cek silang dan konteks provinsi, tidak masuk JSON.

**Output untuk web (`web/public/data/`)**

| File | Isi | Ukuran perkiraan |
| --- | --- | --- |
| `panel.json` | Satu baris per kab/kota per tahun (16 wilayah termasuk provinsi × 12 tahun) | < 30 KB |
| `regions.json` | Kondisi terakhir per kab/kota + peringkat + cluster | < 10 KB |
| `correlations.json` | Matriks Spearman ρ dan p-value | < 5 KB |
| `clusters.json` | Cluster, profil z-score, rekomendasi | < 10 KB |
| `disparity.json` | Selisih dan koefisien variasi per indikator per tahun | < 5 KB |
| `insights.json` + `meta.json` | Teks temuan, sumber, definisi, keterbatasan | < 15 KB |
| `lampung_kabkota.geojson` + `panel.csv` | Peta dan unduhan | ± 140 KB |

**Kontrak data** (`web/src/lib/types.ts` — pipeline Python wajib menghasilkan bentuk ini persis):

```typescript
export interface PanelRow {          // panel.json -> PanelRow[]
  kode: string;                      // kode BPS, mis. "1811"; "1800" = provinsi
  nama: string;                      // "Mesuji"
  tahun: number;                     // 2015-2026
  rls: number | null;                // tahun, penduduk 25+
  hls: number | null;                // tahun, anak usia 7
  ipm: number | null;                // seri UHH LF SP2020, ada 2020-2026
  pctMiskin: number | null;          // persen, ada 2015-2025
  pengeluaran: number | null;        // ribu Rp/orang/tahun
}

export interface Region {            // regions.json -> Region[] (15 kab/kota)
  kode: string;
  nama: string;
  tipe: "kabupaten" | "kota";
  penduduk: number;
  kepadatan: number;                 // jiwa/km2
  luasKm2: number;                   // dari GeoJSON (proyeksi equal-area)
  sekolah: { smp: number; sma: number; smk: number };
  sekolahPer100rb: number;           // (SMA+SMK) per 100 ribu penduduk
  sekolahPer100km2: number;          // (SMA+SMK) per 100 km2
  pctPdrbPrimer: number;             // persen, 2025
  clusterId: number;
  peringkat: Record<string, number>; // 1 = nilai terendah di 15 kab/kota
}

export interface Correlations {      // correlations.json
  vars: string[];
  rho: number[][];
  p: number[][];
  tahun: number;
}

export interface Cluster {           // clusters.json -> Cluster[]
  id: number;
  nama: string;                      // mis. "Agraris, tersebar, tertinggal"
  ringkasan: string;
  anggota: string[];                 // kode wilayah
  profil: Record<string, number>;    // z-score rata-rata per variabel
  rekomendasi: { intervensi: string; sasaran: string; insightId: string }[];
}

export interface Disparity {         // disparity.json -> Disparity[]
  indikator: "rls" | "hls" | "ipm" | "pctMiskin";
  tahun: number;
  selisih: number;                   // tertinggi - terendah
  cv: number;                        // koefisien variasi, persen
}

export interface Insight {           // insights.json -> Insight[]
  id: string;                        // "I1"...
  halaman: 1 | 2 | 3;
  judul: string;
  angka: string;                     // angka kunci, mis. "7,30 vs 11,19 tahun"
  teks: string;
}

export interface Meta {              // meta.json
  diaksesPada: string;               // ISO date
  sumber: { nama: string; url: string; variabel: string[] }[];
  definisi: Record<string, string>;
  keterbatasan: string[];
}
```

**Aturan pipeline:**

1. File di `data/raw/` tidak pernah diubah; semua transformasi di `analysis/`.
2. Join selalu memakai `kode` wilayah BPS, bukan nama.
3. Nilai kosong tetap `null` dan tampil "data tidak tersedia"; tidak ada imputasi.
4. Clustering memakai satu tahun penampang (2025) dan variabel yang distandarisasi z-score; seed acak ditetapkan agar hasil sama tiap kali dijalankan.
5. `npm run build` gagal jika JSON tidak lolos validasi skema (zod) — mencegah dashboard rusak karena data salah bentuk.

## Spesifikasi analisis

Data yang terkumpul sudah mengonfirmasi paradoksnya: pada 2025 Mesuji terendah di % miskin (5,92%), RLS (7,30), HLS (11,97), dan IPM (69,40), serta terendah ke-2 di pengeluaran riil. Tetapi jumlah SMP per 100 ribu penduduknya justru tertinggi, sehingga hipotesis "kekurangan sekolah" diganti dengan hipotesis sebaran wilayah.

| Analisis | Spesifikasi | Output |
| --- | --- | --- |
| Disparitas | Selisih tertinggi–terendah dan koefisien variasi per indikator per tahun, 15 kab/kota (tanpa baris provinsi) | `disparity.json` |
| Korelasi | Spearman ρ + p-value antar: RLS, HLS, % miskin, pengeluaran, % PDRB primer, sekolah per 100 ribu, sekolah per 100 km², kepadatan; tahun 2025 | `correlations.json` |
| Clustering | K-Means pada variabel yang sama (z-score, kepadatan di-log); k = 3, 4, 5 dibandingkan dengan skor siluet; cek kestabilan dengan hierarchical (Ward); `random_state=42` | `clusters.json`, `regions.json` |
| Peringkat | Peringkat 1–15 tiap indikator, 1 = nilai terendah | `regions.json` |

**Hipotesis yang diuji (revisi):**

| No | Hipotesis | Diuji dengan |
| --- | --- | --- |
| H1 | Kemiskinan bukan prediktor terkuat rendahnya RLS/HLS | Bandingkan ρ kemiskinan vs variabel lain |
| H2 | Daerah dengan porsi ekonomi primer tinggi punya HLS lebih rendah | ρ % PDRB primer vs HLS |
| H3 | Yang menghambat adalah sebaran wilayah (jarak), bukan jumlah sekolah | ρ kepadatan & sekolah per 100 km² vs HLS; bandingkan dengan sekolah per 100 ribu |
| H4 | Kesenjangan antar kab/kota tidak menyempit sejak 2015 | Tren koefisien variasi RLS/HLS |
| H5 | Angka kemiskinan Mesuji tidak sejalan dengan kesejahteraan riilnya | Peringkat % miskin vs pengeluaran 2015–2025 |

Keterbatasan yang wajib tampil di Tentang Data: n = 15 (korelasi, bukan sebab-akibat); APS, guru, murid per kab/kota tidak tersedia; luas wilayah dihitung dari peta, bukan angka resmi.

## Arsitektur

Monorepo dua bagian: `analysis/` (Python) menghasilkan JSON, `web/` (Next.js) membangun situs statis dari JSON itu. Tidak ada server yang berjalan, sehingga link selalu cepat dan tidak pernah "tidur".

&#91;embedded content: alur data · dari sumber resmi ke link publik\]

Server component membaca JSON dari `public/data/` saat build, memvalidasinya dengan zod, lalu mengirimnya sebagai props ke komponen grafik (client component). Filter berjalan sepenuhnya di browser.

| Lapisan | Pilihan | Catatan |
| --- | --- | --- |
| Olah data | Python 3.12, `uv`, pandas | Skrip `.py` bernomor, bisa dijalankan ulang dari `data/raw/` |
| Analisis | scipy (Spearman), scikit-learn (StandardScaler, KMeans, silhouette\_score), geopandas (luas wilayah) | Seed acak tetap |
| Framework | Next.js 16 App Router, React 19, TypeScript strict | `output: 'export'` di `next.config.ts` |
| UI | Tailwind CSS v4, shadcn/ui (Card, Tabs, Select, Combobox, Slider, Tooltip, Table) | Satu sistem desain, tidak perlu CSS dari nol |
| Grafik & peta | Apache ECharts via `echarts-for-react` | Peta: `echarts.registerMap('lampung', geojson)`; satu library untuk semua grafik |
| State filter | `nuqs` | Tahun, kab/kota, indikator tersimpan di URL |
| Validasi data | zod | Skema = `types.ts`; build gagal jika JSON salah bentuk |
| Kualitas | ESLint, Prettier, Vitest (fungsi util), Playwright (smoke test 4 halaman, P1) | Dijalankan di CI |
| CI/CD | GitHub Actions + Vercel | Push ke `main` = deploy otomatis |
| Hosting | Vercel Hobby (cadangan: GitHub Pages) | Situs statis, gratis, tidak tidur |

Struktur repo:

```
paradoks-mesuji/
├── data/
│   ├── raw/                      # CSV asli BPS & Satu Data (jangan diubah)
│   ├── processed/                # hasil pembersihan
│   ├── geo/lampung_kabkota.geojson
│   └── SUMBER.md
├── analysis/
│   ├── pyproject.toml            # dikelola uv
│   ├── 01_build_panel.py         # gabung raw -> data/processed/panel.csv
│   ├── 02_analysis.py            # disparitas, korelasi, clustering
│   ├── 03_export_web.py          # tulis 7 file ke web/public/data/
│   └── notebooks/eksplorasi.ipynb
├── web/
│   ├── public/data/              # output pipeline (di-commit)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # header, navigasi, footer sumber
│   │   │   ├── page.tsx          # 1. Masalah
│   │   │   ├── paradoks/page.tsx # 2. Paradoks
│   │   │   ├── tipologi/page.tsx # 3. Tipologi & Solusi
│   │   │   └── tentang/page.tsx  # Tentang Data
│   │   ├── components/
│   │   │   ├── charts/           # ChoroplethMap, TrendLine, ScatterExplorer,
│   │   │   │                     # CorrHeatmap, ClusterProfile, DisparityChart
│   │   │   ├── filters/          # YearSlider, RegionSelect, IndicatorSelect
│   │   │   ├── KpiCard.tsx, InsightCallout.tsx, SourceFooter.tsx
│   │   │   └── ui/               # komponen shadcn
│   │   └── lib/
│   │       ├── types.ts          # kontrak data
│   │       ├── schema.ts         # zod, cermin types.ts
│   │       ├── data.ts           # baca + validasi JSON saat build
│   │       ├── format.ts         # angka gaya Indonesia (7,30; Rp1,12 juta)
│   │       └── colors.ts         # palet tunggal
│   ├── next.config.ts            # output: 'export'
│   └── package.json
├── .github/workflows/ci.yml
└── README.md                     # cara menjalankan, sumber, AI disclosure
```

## Memulai development

Urutan: buat kerangka web dulu, lalu jalankan pipeline yang mengisi `web/public/data/`.

```bash
# 1. Kerangka web (sekali saja)
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir
cd web
npx shadcn@latest init
npx shadcn@latest add card tabs select slider tooltip table command popover badge
npm i echarts echarts-for-react nuqs zod
npm i -D vitest

# 2. Pipeline data
cd ../analysis
uv init && uv add pandas scipy scikit-learn geopandas
uv run python 01_build_panel.py
uv run python 02_analysis.py
uv run python 03_export_web.py      # menulis ke ../web/public/data/

# 3. Jalankan
cd ../web && npm run dev            # http://localhost:3000
npm run build                       # hasil statis di web/out/
```

```typescript
// web/next.config.ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true } };
export default nextConfig;
```

Catatan teknis:

- Komponen ECharts wajib `"use client"` dan dimuat dengan `next/dynamic` (`ssr: false`), karena ECharts butuh `window`.
- Peta: baca `lampung_kabkota.geojson`, panggil `echarts.registerMap("lampung", geojson)` sekali, lalu series `type: "map"` dengan `nameProperty: "kode_wilayah"`.
- Format angka memakai `Intl.NumberFormat("id-ID")` agar tampil 7,30 dan Rp1,12 juta.
- Vercel: set Root Directory ke `web`; tidak perlu konfigurasi lain untuk static export.

## Kebutuhan non-fungsional

| Aspek | Kebutuhan | Cara memeriksa |
| --- | --- | --- |
| Akses | Link publik tanpa login; terbuka di incognito, laptop lain, dan HP | Cek manual tiap hari sampai 22 Des |
| Ketersediaan | Situs statis di CDN, tidak ada server yang bisa tidur | Deploy Vercel status "Ready" |
| Performa | Lighthouse Performance ≥ 90 di desktop; total JSON < 300 KB; grafik muncul < 2 detik | Lighthouse di Chrome DevTools |
| Desain | Abu-abu untuk konteks, satu warna aksen untuk kab/kota terpilih (default Mesuji), palet kategori terpisah untuk cluster; judul grafik berupa kalimat temuan | Review visual tiap halaman |
| Keterbacaan | Font grafik ≥ 12 px; satuan di label sumbu; angka format Indonesia; tanpa pie chart | Review visual |
| Aksesibilitas | Kontras teks WCAG AA; warna cluster terbedakan bagi buta warna; setiap grafik punya judul teks; navigasi keyboard | Lighthouse Accessibility ≥ 90 |
| Responsif | Tampil benar di lebar 360 px–1920 px | Chrome device toolbar |
| Etika data | Hanya data agregat; sumber + tanggal akses di tiap halaman; tanpa data sintetik | Cek footer dan halaman Tentang |
| Reproduksibilitas | `uv.lock` dan `package-lock.json` di-commit; pipeline menghasilkan JSON yang sama tiap kali dijalankan | Jalankan ulang pipeline, `git diff` kosong |
| Kualitas kode | TypeScript strict tanpa error; ESLint bersih; CI hijau sebelum merge | GitHub Actions |

## Kriteria penerimaan dan deliverables

Produk dianggap siap submit jika semua butir ini tercentang.

- [ ] Semua FR P0 berjalan di link Vercel publik
- [ ] 9 komponen minimal guidebook terlihat di situs (judul, masalah, tujuan, dataset, ≥3 visualisasi, ≥1 filter, ≥3 insight, ≥2 rekomendasi, sumber)
- [ ] Pipeline dijalankan ulang dari `data/raw/` menghasilkan JSON identik; `npm run build` lolos validasi zod
- [ ] Angka Mesuji 2025 di situs cocok dengan CSV BPS (cek manual 5 indikator)
- [ ] Lighthouse desktop: Performance ≥ 90, Accessibility ≥ 90
- [ ] Link diuji di incognito, laptop lain, dan HP
- [ ] Repo GitHub publik berisi kode, data, README (cara menjalankan, sumber, AI disclosure)
- [ ] Video demo diunggah dengan akses publik (durasi sesuai jawaban panitia)
- [ ] `DASHBOARD_NamaTim_NamaKampus.pdf` berisi link situs, repo, video, dataset
- [ ] `RINGKASAN_NamaTim_NamaKampus.pdf` ≤ 3 halaman, TNR 12, spasi 1,5, dengan AI disclosure
- [ ] `ORISINALITAS_NamaTim_NamaKampus.pdf` bertanda tangan ketua dan dosen

## Milestone build

Data sudah terkumpul, jadi jalur kritis sekarang: pipeline → analisis → halaman. Kerangka web dan CI dibuat paralel sejak hari pertama.

| Milestone | Target selesai | Isi | Status |
| --- | --- | --- | --- |
| M1 Data | 16 Nov | CSV BPS + GeoJSON + SUMBER.md di `data/` | Selesai |
| M0 Setup | 18 Nov | Repo GitHub, kerangka Next.js + shadcn, deploy kosong ke Vercel, CI hijau | Belum |
| M2 Pipeline | 22 Nov | `01`–`03` jalan; 7 file JSON lolos validasi zod | Belum |
| M3 Analisis | 26 Nov | H1–H5 diuji, k cluster dipilih, nama cluster, `insights.json` draf | Belum |
| M4 Halaman 1–2 | 3 Des | FR-01 s.d. FR-10 dengan data asli | Belum |
| M5 Halaman 3 + Tentang | 6 Des | FR-12 s.d. FR-16, teks rekomendasi final | Belum |
| M6 Polish | 10 Des | FR P1, Lighthouse, responsif, uji di HP | Belum |
| M7 Submit | 13–14 Des | Semua kriteria penerimaan tercentang; kirim form | Belum |

## Pertanyaan terbuka

- [ ] Durasi maksimal video demo (tanya CP panitia)
- [ ] Apakah PDF *Lampung Dalam Angka 2026* memuat guru/murid per kab/kota? Jika ya, tambahkan rasio murid-guru ke `regions.json`
- [ ] Jumlah cluster final (diputuskan dari skor siluet di M3)
- [ ] Nama tim, kampus, dan pembagian peran (data/analisis, frontend, narasi)
