---
name: "paradoks-mesuji-dashboard"
description: "Use when building, analyzing, or writing for the Paradoks Mesuji dashboard (Lampung education inequality) for AI & Coding Dashboard Challenge 2026: Python pipeline, Next.js site, insights."
---

# Paradoks Mesuji Dashboard

Proyek lomba **AI & Coding Dashboard Challenge 2026** (Festival & Expo Sains Data Nasional, UIN Raden Intan Lampung). Subtema **Pendidikan** (dipilih 17 Nov 2026; Isu Lokal tidak dipakai). Batas submit **16 Desember 2026 23.59 WIB**; target internal 13-14 Desember. Karya hanya bisa dikirim SEKALI.

**Inti cerita:** Kabupaten Mesuji punya persentase penduduk miskin terendah di Lampung, tetapi RLS, HLS, dan IPM-nya juga terendah. Dashboard menguji mengapa kemiskinan rendah tidak otomatis berarti pendidikan baik, lalu mengelompokkan 15 kab/kota ke tipologi dengan rekomendasi berbeda.

Sumber kebenaran desain produk: PRD "PRD - Dashboard Paradoks Mesuji" (versi 2). Jika PRD dan skill ini berbeda, ikuti PRD dan beri tahu pengguna.

## Bahasa dan gaya

- Semua teks UI, insight, rekomendasi, README, dan komentar untuk pengguna dalam **Bahasa Indonesia**.
- Kode (nama variabel, fungsi, tipe) dalam bahasa Inggris atau Indonesia sesuai kontrak data di bawah; jangan campur gaya dalam satu file.
- Angka tampil format Indonesia: `Intl.NumberFormat("id-ID")` -> 7,30; 5,92%; Rp1,12 juta.

## Struktur repo (jangan diubah tanpa alasan)

```
paradoks-mesuji/
  data/raw/          # CSV asli BPS & Satu Data - JANGAN PERNAH DIUBAH
  data/processed/    # hasil pembersihan
  data/geo/lampung_kabkota.geojson
  data/SUMBER.md     # sumber, URL, tanggal akses tiap file
  analysis/          # Python (uv): 01_build_panel.py, 02_analysis.py, 03_export_web.py
  web/               # Next.js 16, output: 'export'
    public/data/     # 7 file output pipeline (di-commit)
    src/app/         # page.tsx (Masalah), paradoks/, tipologi/, tentang/
    src/components/  # charts/, filters/, ui/ (shadcn)
    src/lib/         # types.ts, schema.ts, data.ts, format.ts, colors.ts
```

## Aturan data (melanggar = risiko diskualifikasi)

1. Hanya data resmi yang ada di `data/raw/`. **Dilarang** mengarang, mengisi, atau "memperkirakan" angka. Nilai kosong tetap `null` dan tampil "data tidak tersedia".
2. Join selalu dengan **kode wilayah BPS**, bukan nama. Kode: 1801 Lampung Barat, 1802 Tanggamus, 1803 Lampung Selatan, 1804 Lampung Timur, 1805 Lampung Tengah, 1806 Lampung Utara, 1807 Way Kanan, 1808 Tulangbawang, 1809 Pesawaran, 1810 Pringsewu, 1811 Mesuji, 1812 Tulang Bawang Barat, 1813 Pesisir Barat, 1871 Kota Bandar Lampung, 1872 Kota Metro, 1800 Provinsi.
3. Ejaan nama berbeda antar sumber (Tulangbawang vs Tulang Bawang, Metro vs Kota Metro) - normalisasi lewat kode.
4. IPM: pakai seri **UHH Long Form SP2020** (2020-2026). Seri lama hanya untuk tren panjang dan harus diberi label.
5. Penduduk dan kepadatan: pakai `data/raw/bps_penduduk-kepadatan_kabkota_2025.csv` (BPS Lampung, proyeksi hasil SP2020). File `opendata-lampung_kepadatan-penduduk_kabkota_ASLI.csv` dan `data/processed/penduduk_kabkota_bersih.csv` tidak dipakai lagi (kode wilayah salah, tanpa tahun).
6. Tidak tersedia per kab/kota: APS, jumlah guru, jumlah murid. Jangan membuat fitur yang membutuhkannya; HLS menggantikan APS.
7. Setiap angka yang ditampilkan harus bisa ditelusuri ke satu file di `data/raw/` dan tercatat di `SUMBER.md`.
8. Jangan pernah meng-hardcode angka temuan di komponen; baca dari JSON.

## Kontrak data web (`web/src/lib/types.ts`)

Pipeline Python WAJIB menghasilkan bentuk ini; `schema.ts` (zod) adalah cerminnya dan build harus gagal jika tidak cocok.

- `panel.json` -> `PanelRow[]`: `{kode, nama, tahun, rls, hls, ipm, pctMiskin, pengeluaran}` (number | null)
- `regions.json` -> `Region[]`: `{kode, nama, tipe, penduduk, kepadatan, luasKm2, sekolah:{smp,sma,smk}, sekolahPer100rb, sekolahPer100km2, pctPdrbPrimer, clusterId, peringkat}`; peringkat 1 = nilai terendah
- `correlations.json`: `{vars, rho, p, tahun}`
- `clusters.json` -> `Cluster[]`: `{id, nama, ringkasan, anggota, profil, rekomendasi:[{intervensi, sasaran, insightId}]}`
- `disparity.json` -> `Disparity[]`: `{indikator, tahun, selisih, cv}`
- `insights.json` -> `Insight[]`: `{id, halaman, judul, angka, teks}`
- `meta.json`: `{diaksesPada, sumber, definisi, keterbatasan}`

Jika mengubah kontrak, ubah `types.ts`, `schema.ts`, dan `03_export_web.py` dalam satu perubahan.

## Analisis (Python)

- Python 3.12 dengan `uv`; pandas, scipy, scikit-learn, geopandas.
- Skrip bernomor dan deterministik: menjalankan ulang dari `data/raw/` harus menghasilkan JSON identik. Clustering `random_state=42`.
- Disparitas: selisih tertinggi-terendah dan koefisien variasi per indikator per tahun (15 kab/kota, tanpa baris provinsi).
- Korelasi: **Spearman** (n = 15), selalu sertakan p-value.
- Clustering: K-Means pada z-score (kepadatan di-log); bandingkan k = 3, 4, 5 dengan skor siluet; cek dengan Ward.
- Luas wilayah dari GeoJSON dengan proyeksi equal-area, bukan derajat.
- Hipotesis: H1 kemiskinan bukan prediktor terkuat; H2 ekonomi primer vs HLS; H3 sebaran wilayah (jarak), bukan jumlah sekolah; H4 ketimpangan tidak menyempit; H5 kemiskinan Mesuji tidak sejalan dengan pengeluaran riil.
- Bahasa temuan: "berkaitan dengan", bukan "menyebabkan" (n = 15, korelasional). Laporkan hasil apa adanya walau tidak mendukung hipotesis.

## Frontend (Next.js)

- Next.js 16 App Router, React 19, TypeScript strict, `output: "export"`, `images: { unoptimized: true }`. Tidak ada API route, server action, atau fitur yang butuh server.
- Server component membaca JSON di build (`lib/data.ts`), validasi zod, kirim sebagai props ke client component.
- Grafik: Apache ECharts via `echarts-for-react`, komponen `"use client"` dimuat dengan `next/dynamic` (`ssr: false`).
- Peta: `echarts.registerMap("lampung", geojson)` sekali; series `type: "map"`, cocokkan dengan `kode_wilayah`.
- State filter (tahun, kab/kota, indikator) di URL dengan `nuqs`. Default: tahun 2025, kab/kota Mesuji.
- UI: Tailwind v4 + shadcn/ui. Jangan menambah library UI lain.
- Halaman: `/` Masalah, `/paradoks`, `/tipologi`, `/tentang`. Setiap halaman punya header (judul + satu kalimat temuan) dan footer sumber.

## Desain visual

- Abu-abu netral untuk konteks; **satu warna aksen** untuk kab/kota terpilih (default Mesuji); garis putus-putus untuk rata-rata provinsi.
- Palet kategori terpisah hanya untuk cluster, aman buta warna. Semua warna dari `lib/colors.ts`.
- Judul grafik berupa **kalimat temuan** ("Mesuji terendah di RLS sejak 2015"), bukan nama variabel.
- Satuan di label sumbu; font >= 12 px; tidak ada pie chart, 3D, atau gradien dekoratif.
- Responsif 360-1920 px; kontras WCAG AA.

## Aturan lomba yang memengaruhi kode dan teks

- Penilaian: Analisis 20%, Kualitas Data 15%, Fungsi Produk 15%, Visualisasi 15%, Insight & Rekomendasi 15%, Relevansi 10%, Presentasi 10%.
- Komponen minimal yang harus terlihat di situs: judul, permasalahan, tujuan, dataset (sumber, periode, jumlah data, variabel), >= 3 visualisasi, >= 1 filter, >= 3 insight, >= 2 rekomendasi berbasis hasil, sumber.
- AI boleh untuk coding, debugging, pembersihan data, visualisasi, perbaikan bahasa. AI **dilarang** membuat data fiktif, memalsukan hasil, membuat referensi palsu, atau menulis kesimpulan yang tidak didukung data.
- Setiap penggunaan AI yang signifikan dicatat untuk tabel AI Assistance Disclosure (README dan halaman Tentang).
- Link harus bisa dibuka juri tanpa login sampai pengumuman pemenang.

## Insight dan rekomendasi

- Setiap insight memuat angka dan tahun, diambil dari JSON.
- Setiap rekomendasi merujuk ke satu `insightId` dan menyebut pihak penerima (Dinas Pendidikan Provinsi/Kabupaten, Pemkab, Bappeda).
- Rekomendasi dibedakan per cluster, bukan satu resep untuk semua.

## Sebelum menyelesaikan tugas

- [ ] Pipeline dijalankan ulang dan `git diff web/public/data/` tidak berubah tanpa alasan
- [ ] `npm run lint`, `tsc --noEmit`, dan `npm run build` lolos
- [ ] Angka Mesuji di UI cocok dengan CSV di `data/raw/`
- [ ] Tidak ada angka yang di-hardcode atau dikarang
- [ ] Teks UI dalam Bahasa Indonesia dengan format angka id-ID
- [ ] `SUMBER.md` dan catatan AI disclosure diperbarui jika ada sumber atau penggunaan AI baru