# Paradoks Mesuji

Dashboard ketimpangan pendidikan 15 kabupaten/kota di Provinsi Lampung untuk **AI & Coding Dashboard Challenge 2026** (Festival & Expo Sains Data Nasional, UIN Raden Intan Lampung), subtema **Pendidikan**.

**Tim KomitPNL** · Politeknik Negeri Lhokseumawe

**Inti cerita:** Kabupaten Mesuji punya persentase penduduk miskin terendah di Lampung, tetapi rata-rata lama sekolah (RLS), harapan lama sekolah (HLS), dan IPM-nya juga terendah. Dashboard ini menguji mengapa kemiskinan rendah tidak otomatis berarti pendidikan baik, lalu mengelompokkan 15 kab/kota ke tiga tipe daerah dengan rekomendasi yang berbeda.

- Situs: _(isi tautan Vercel setelah deploy)_
- Video demo: _(isi tautan)_

## Struktur

```
data/raw/          CSV asli BPS & Satu Data Lampung (tidak pernah diubah)
data/processed/    hasil pembersihan dan hasil antara pipeline
data/geo/          batas 15 kab/kota (GeoJSON)
data/SUMBER.md     sumber, URL, dan tanggal akses tiap berkas
analysis/          pipeline Python: 01_build_panel -> 02_analysis -> 03_export_web
web/               situs Next.js 16 (ekspor statis), membaca web/public/data/*.json
```

Semua olah data, korelasi, dan clustering dikerjakan di Python. Situs hanya membaca JSON hasil olahan dan memfilter tampilannya.

## Cara menjalankan

Prasyarat: Python 3.12 + [uv](https://docs.astral.sh/uv/), Node.js 20 atau lebih baru.

```bash
# 1. Pipeline data (menulis ke web/public/data/)
cd analysis
uv sync
uv run python 01_build_panel.py
uv run python 02_analysis.py
uv run python 03_export_web.py

# 2. Situs
cd ../web
npm ci
npm run dev        # http://localhost:3000
npm run build      # hasil statis di web/out/
```

Pemeriksaan kualitas di `web/`: `npm run lint`, `npm run typecheck`, `npm test`.
`npm run build` gagal jika JSON tidak lolos validasi skema zod (`src/lib/schema.ts`).

Deploy: Vercel dengan Root Directory `web` (tanpa konfigurasi lain). Folder `web/out/` juga bisa diunggah ke host statis mana pun.

## Video demo

Folder `demo/` berisi perekam layar otomatis (Puppeteer + Edge) dan naskah narasi.

```bash
cd demo
npm install
node record.mjs        # rekam ulang video-demo-tanpa-suara.mp4 (butuh web/out/ hasil build)
node naskah.mjs        # tulis ulang NASKAH_VIDEO.md dari scenes.mjs
node gabung-suara.mjs  # gabungkan demo/suara/01.m4a … 13.m4a menjadi video-demo-final.mp4 (butuh ffmpeg)
```

Adegan, durasi, caption, dan narasi didefinisikan sekali di `demo/scenes.mjs`, sehingga video dan naskah selalu sinkron.

## Berkas pengumpulan

`berkas/buat_berkas.py` membuat `DASHBOARD_KomitPNL_…pdf` (tautan dashboard, repo, video, dataset) dan
`ORISINALITAS_KomitPNL_…pdf` (Lampiran 1 guidebook), dan `RINGKASAN_KomitPNL_…pdf` (maks. 3 halaman, A4, Times New Roman 12pt, spasi 1,5; angka diambil dari JSON hasil pipeline). Isian (tautan, nama ketua, dosen, tanggal) ada di
`berkas/data_berkas.json`; jalankan `python berkas/buat_berkas.py` setelah mengisinya.

## Data

Rincian lengkap ada di [`data/SUMBER.md`](data/SUMBER.md) dan di halaman **Tentang Data** pada situs.

| Variabel | Sumber | Periode |
| --- | --- | --- |
| RLS, HLS, pengeluaran riil per kapita | BPS | 2015–2026 |
| Persentase penduduk miskin (P0) | BPS | 2015–2025 |
| IPM (seri UHH Long Form SP2020) | BPS | 2020–2026 |
| PDRB ADHB per sektor | BPS | 2025 |
| Jumlah SMP, SMA, SMK | BPS Provinsi Lampung | 2025 |
| Penduduk dan kepadatan | BPS Provinsi Lampung (proyeksi hasil SP2020) | 2025 |
| Batas wilayah | geoBoundaries IDN ADM2 | — |

Aturan yang dipegang: hanya data resmi di `data/raw/`; join lewat kode wilayah BPS; nilai kosong tetap kosong dan tampil "data tidak tersedia"; tidak ada imputasi atau data sintetis.

## Metode singkat

- **Ketimpangan:** selisih tertinggi–terendah dan koefisien variasi per indikator per tahun (15 kab/kota).
- **Korelasi:** Spearman pada data 2025 (n = 15) dengan p-value; diulang tanpa dua kota (n = 13) sebagai uji ketahanan.
- **Tipologi:** K-Means pada 8 variabel z-score (kepadatan di-log), `random_state=42`. k = 3, 4, 5 dibandingkan dengan skor siluet dan kesesuaian dengan Ward; aturan pemilihan ditetapkan lebih dulu dan menghasilkan k = 3. Empat kabupaten (Mesuji, Way Kanan, Tulang Bawang, Tulang Bawang Barat) selalu sekelompok di semua solusi yang diuji.
- **Bahasa temuan:** "berkaitan dengan", bukan "menyebabkan". Hasil yang tidak mendukung hipotesis awal tetap dilaporkan.

Kontrak data antara pipeline dan situs: `web/src/lib/types.ts` (cerminnya `schema.ts`). Dibanding PRD v2, kontrak ditambah `Region.smpPer100rb` serta `Meta.dataset`, `Meta.metode`, `Meta.hipotesis`, `Meta.korelasiKabupaten`, `Meta.aiDisclosure`, dan `Meta.verifikasiAi`.

## Keterbatasan

n = 15 sehingga hasil bersifat korelasional; APS, jumlah guru, dan jumlah murid per kab/kota tidak tersedia daring; luas wilayah dihitung dari peta, bukan angka resmi; skor siluet clustering rendah (sekitar 0,25) dan susunan tipe peka terhadap jumlah tipe, sehingga tipologi adalah alat bantu membaca pola, bukan klasifikasi mutlak. Daftar lengkap ada di halaman Tentang Data.

## AI Assistance Disclosure

Format mengikuti Lampiran 2 guidebook. Tabel yang sama tampil di halaman Tentang Data (sumbernya `meta.json`).

| No. | Tools AI | Tujuan penggunaan | Bagian karya yang terkait |
| --- | --- | --- | --- |
| 1 | Claude Code (Anthropic) | Coding dan debugging pipeline olah data: penggabungan CSV, ketimpangan, korelasi Spearman, dan clustering | Skrip Python di `analysis/` dan berkas JSON hasil olahannya |
| 2 | Claude Code (Anthropic) | Coding dan debugging situs: halaman, filter, peta, dan grafik | Kode situs di `web/` |
| 3 | Claude Code (Anthropic) | Mengambil tabel penduduk dan kepadatan 2025 dari situs BPS Provinsi Lampung dan menyimpannya apa adanya sebagai CSV | `data/raw/bps_penduduk-kepadatan_kabkota_2025.csv` |
| 4 | Claude Code (Anthropic) | Menyusun draf kalimat insight dan rekomendasi dari angka hasil analisis, serta perbaikan bahasa | Teks insight, nama tipe daerah, rekomendasi, halaman Tentang Data, dan draf ringkasan proyek |
| 5 | Claude Code (Anthropic) | Membuat skrip rekaman layar otomatis untuk video demo (tanpa suara) dan menyusun draf naskah narasi | Video demo dan naskahnya (`demo/`); suara narasi direkam sendiri oleh tim |

AI tidak digunakan untuk membuat data, memalsukan hasil analisis, atau membuat referensi. Angka di situs dicek ulang terhadap CSV BPS di `data/raw/`, dan pipeline dijalankan ulang dengan hasil identik.

_(Lengkapi tabel ini, dan `aiDisclosure` di `analysis/03_export_web.py`, bila ada penggunaan AI lain, misalnya saat brainstorming, mengumpulkan CSV lain, atau menulis ringkasan proyek.)_
