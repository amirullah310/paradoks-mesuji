# Sumber Data — Paradoks Mesuji

Diakses: 16 November 2026. Semua file mentah ada di `raw/`. Angka diambil apa adanya dari sumber; desimal koma diubah menjadi titik.

## Inti (BPS, per kab/kota Lampung)

| File | Isi | Satuan | Tahun | Sumber |
|---|---|---|---|---|
| `raw/bps_p0-persen-miskin_kabkota_2015-2025.csv` | Persentase penduduk miskin (P0) | % | 2015–2025 | [BPS – P0 Menurut Kabupaten/Kota](https://www.bps.go.id/id/statistics-table/2/NjIxIzI=/persentase-penduduk-miskin--p0--menurut-kabupaten-kota--persen-.html) |
| `raw/bps_rls_kabkota_2015-2026.csv` | Rata-rata Lama Sekolah, usia 25+ | tahun | 2015–2026 | [BPS – [Metode Baru] RLS](https://www.bps.go.id/id/statistics-table/2/NDE1IzI=/-metode-baru--rata-rata-lama-sekolah.html) |
| `raw/bps_hls_kabkota_2015-2026.csv` | Harapan Lama Sekolah, usia 7 | tahun | 2015–2026 | [BPS – [Metode Baru] HLS](https://www.bps.go.id/id/statistics-table/2/NDE3IzI=/-metode-baru--harapan-lama-sekolah--tahun-.html) |
| `raw/bps_pengeluaran-riil-per-kapita-disesuaikan_ribu-rp-tahun_kabkota_2015-2026.csv` | Pengeluaran riil per kapita disesuaikan | ribu Rp/orang/tahun | 2015–2026 | [BPS – [Metode Baru] Pengeluaran per Kapita Disesuaikan](https://www.bps.go.id/id/statistics-table/2/NDE2IzI=/-metode-baru-pengeluaran-per-kapita-disesuaikan.html) |
| `raw/bps_ipm-uhh-lf-sp2020_kabkota_2020-2026.csv` | IPM seri terbaru (UHH Long Form SP2020) — **pakai ini** | indeks | 2020–2026 | [BPS – IPM (UHH LF SP2020)](https://www.bps.go.id/id/statistics-table/2/MjIwNSMy/-metode-baru--indeks-pembangunan-manusia--umur-harapan-hidup-hasil-long-form-sp2020-.html) |
| `raw/bps_ipm-seri-lama_kabkota_2015-2024.csv` | IPM seri lama (untuk tren panjang saja) | indeks | 2015–2024 | [BPS – [Metode Baru] IPM](https://www.bps.go.id/id/statistics-table/2/NDEzIzI=/-metode-baru--indeks-pembangunan-manusia.html) |
| `raw/bps_pdrb-adhb-sektor_kabkota_2025_milyar-rp.csv` | PDRB ADHB sektor primer/sekunder/tersier + % primer | miliar Rp | 2025 | [BPS – PDRB Triwulanan ADHB Kab/Kota](https://www.bps.go.id/id/statistics-table/2/MjUzMyMy/pdrb-triwulanan-atas-dasar-harga-berlaku-menurut-lapangan-usaha-di-kabupaten-kota-seluruh-indonesia.html) (kolom Tahunan) |

## Pendukung (Satu Data Lampung)

| File | Isi | Catatan |
|---|---|---|
| `raw/opendata-lampung_hls_kabkota_2018-2024.csv` | HLS per kab/kota | Pembanding untuk cek silang dengan BPS. [Sumber](https://opendata.lampungprov.go.id/dataset/harapan-lama-sekolah-provinsi-lampung) |
| `raw/opendata-lampung_rls_kabkota_2018-2024.csv` | RLS per kab/kota | Pembanding. [Sumber](https://opendata.lampungprov.go.id/dataset/ratarata-lama-sekolah-provinsi-lampung-dan-nasional) |
| `raw/opendata-lampung_aps-apk-apm-guru_PROVINSI_2018-2024.csv` | APS, APK, APM, jumlah guru | **Tingkat provinsi saja**, untuk konteks. Guru SD 2021 tertulis 5195 di sumber (kemungkinan salah ketik). |
| `raw/opendata-lampung_kepadatan-penduduk_kabkota_ASLI.csv` | Penduduk & kepadatan | **Tidak dipakai lagi** (diganti tabel BPS 2025 di bawah). Kode wilayah di sumber tidak sesuai standar BPS, tahun tidak dicantumkan, dan penduduk Pesisir Barat tertulis 177.43. [Sumber](https://opendata.lampungprov.go.id/dataset/data-tingkat-kepadatan-penduduk) |

## Peta

| File | Isi | Sumber |
|---|---|---|
| `geo/lampung_kabkota.geojson` | Batas 15 kab/kota Lampung, kolom `kode_wilayah` (kode BPS) dan `kab_kota` | geoBoundaries IDN ADM2 (simplified), dipotong ke Lampung — [wmgeolab/geoBoundaries](https://github.com/wmgeolab/geoBoundaries) |

## Kode wilayah BPS

1801 Lampung Barat · 1802 Tanggamus · 1803 Lampung Selatan · 1804 Lampung Timur · 1805 Lampung Tengah · 1806 Lampung Utara · 1807 Way Kanan · 1808 Tulangbawang · 1809 Pesawaran · 1810 Pringsewu · 1811 Mesuji · 1812 Tulang Bawang Barat · 1813 Pesisir Barat · 1871 Kota Bandar Lampung · 1872 Kota Metro · 1800 Provinsi Lampung

## Akses sekolah (BPS Provinsi Lampung)

| File | Isi | Tahun | Sumber |
|---|---|---|---|
| `raw/bps_jumlah-sekolah-smp-sma-smk_kabkota_2025.csv` | Jumlah SMP, SMA, SMK (negeri, swasta, total) | 2025 | BPS Lampung: [SMP](https://lampung.bps.go.id/id/statistics-table/2/ODQ4IzI=/jumlah-sekolah-menengah-pertama--smp--di-bawah-kementerian-pendidikan--kebudayaan--riset--dan-teknologi-menurut-kabupaten-kota.html) · [SMA](https://lampung.bps.go.id/id/statistics-table/2/ODUwIzI=/jumlah-sekolah-menengah-atas--sma--di-bawah-kementerian-pendidikan--kebudayaan--riset--dan-teknologi-menurut-kabupaten-kota.html) · [SMK](https://lampung.bps.go.id/id/statistics-table/2/ODUxIzI=/jumlah-sekolah-menengah-kejuruan--smk--di-bawah-kementerian-pendidikan--kebudayaan--riset--dan-teknologi-menurut-kabupaten-kota.html) |
| `raw/bps_penduduk-kepadatan_kabkota_2025.csv` | Jumlah penduduk (ribu jiwa), laju pertumbuhan, distribusi, kepadatan per km², rasio jenis kelamin — **dipakai untuk penduduk dan kepadatan** | 2025 | [BPS Lampung – Penduduk, Laju Pertumbuhan, Distribusi, Kepadatan, Rasio Jenis Kelamin Menurut Kab/Kota, 2025](https://lampung.bps.go.id/id/statistics-table/3/V1ZSbFRUY3lTbFpEYTNsVWNGcDZjek53YkhsNFFUMDkjMw==/jumlah-penduduk--laju-pertumbuhan-penduduk--distribusi-persentase-penduduk--kepadatan-penduduk--rasio-jenis-kelamin-penduduk-menurut-kabupaten-kota-di-provinsi-lampung--2025.html?year=2025). Catatan sumber: Proyeksi Penduduk Indonesia 2020–2035 hasil SP2020 (pertengahan tahun/Juni). Diakses 16 November 2026; tabel disalin apa adanya dari halaman. |
| `processed/penduduk_kabkota_bersih.csv` | Turunan dari file kepadatan Satu Data Lampung — **tidak dipakai lagi**, disimpan sebagai arsip | — | Turunan dari file kepadatan Satu Data Lampung |

## Tidak tersedia online (sudah dicek 16 Nov 2026)

- **Jumlah guru dan murid SMP/SMA per kab/kota.** Tabel BPS Lampung untuk 2024/2025 dan 2025/2026 tampil kosong ("..."); portal statistik Dapodik juga sudah tidak menyediakan rekap per kab/kota. Alternatif: tabel di PDF *Provinsi Lampung Dalam Angka 2026* bab Pendidikan, atau tabel BPS 2015 (terlalu lama). Variabel akses diwakili jumlah sekolah per penduduk dan per luas wilayah.
- **APS 13–15 dan 16–18 per kab/kota.** BPS Lampung hanya menerbitkan APS tingkat provinsi. HLS per kab/kota (yang dihitung dari partisipasi sekolah per umur) dipakai sebagai pengganti.

## Hasil antara pipeline (`processed/`)

Dibuat ulang oleh skrip di `analysis/`; jangan disunting manual.

| File | Dibuat oleh | Isi |
|---|---|---|
| `processed/panel.csv` | `01_build_panel.py` | Panel 16 wilayah × 12 tahun (RLS, HLS, IPM, % miskin, pengeluaran) |
| `processed/regions.csv` | `01_build_panel.py` | Penampang 2025 per kab/kota + rasio sekolah per penduduk dan per luas |
| `processed/analysis.json` | `02_analysis.py` | Ketimpangan, korelasi Spearman, clustering, peringkat |
