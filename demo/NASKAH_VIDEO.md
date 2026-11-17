# Naskah narasi video demo — Paradoks Mesuji

Total durasi: **3:16** (13 adegan). Video tanpa suara: `demo/video-demo-tanpa-suara.mp4`.

## Cara merekam

1. Rekam **satu berkas per adegan** (nama: `01.m4a`, `02.m4a`, …). Kalau salah, ulang adegan itu saja.
2. Baca santai. Setiap adegan sudah diberi ruang beberapa detik; kalau suara lebih pendek, sisanya hening dan tidak masalah.
   Kalau lebih panjang dari durasi adegan, bacalah sedikit lebih cepat atau beri tahu saya untuk memperpanjang adegannya.
3. Rekam di ruangan sepi; HP sudah cukup. Diam 1 detik sebelum dan sesudah bicara.
4. Simpan berkasnya di folder `demo/suara/`, lalu jalankan `node gabung-suara.mjs` dari folder `demo/`.
   Hasilnya `demo/video-demo-final.mp4`: tiap rekaman otomatis ditempatkan di detik awal adegannya.

Angka dibaca seperti tertulis (mis. "tujuh koma tiga nol"). Semua angka sesuai data BPS di dashboard.

## Naskah per adegan

### 1. Pembuka — 0:00 s.d. 0:14 (14 detik)

**Di layar:** Paradoks Mesuji · Tim KomitPNL, Politeknik Negeri Lhokseumawe

> Halo, kami tim KomitPNL dari Politeknik Negeri Lhokseumawe. Ini dashboard Paradoks Mesuji, untuk subtema Pendidikan. Kami membandingkan pendidikan di lima belas kabupaten dan kota di Lampung.

<sub>26 kata · sekitar 11 detik bila dibaca santai</sub>

### 2. Masalah — 0:14 s.d. 0:31 (17 detik)

**Di layar:** Kemiskinan Mesuji terendah (5,92%), tetapi lama sekolahnya juga terendah

> Masalahnya begini: Mesuji punya persentase penduduk miskin paling rendah di Lampung, lima koma sembilan dua persen. Tapi lama sekolahnya justru paling pendek. Kalau prioritas program hanya dilihat dari kemiskinan, Mesuji akan terlewat.

<sub>32 kata · sekitar 13 detik bila dibaca santai</sub>

### 3. Peta lama sekolah — 0:31 s.d. 0:48 (17 detik)

**Di layar:** RLS 2025: Mesuji 7,30 tahun vs Kota Metro 11,19 tahun

> Di peta ini, warna makin gelap berarti rata-rata lama sekolah makin tinggi. Tahun 2025, penduduk dewasa Mesuji rata-rata bersekolah tujuh koma tiga nol tahun, sedangkan Kota Metro sebelas koma satu sembilan tahun. Selisihnya tiga koma delapan sembilan tahun.

<sub>38 kata · sekitar 16 detik bila dibaca santai</sub>

### 4. Filter indikator — 0:48 s.d. 1:03 (15 detik)

**Di layar:** Filter: ganti indikator ke Harapan Lama Sekolah (HLS)

> Indikator dan tahun bisa diganti lewat filter di atas. Untuk harapan lama sekolah anak-anak, Mesuji juga terendah, dan garis oranye ini menunjukkan Mesuji selalu di posisi terbawah sejak 2015.

<sub>29 kata · sekitar 12 detik bila dibaca santai</sub>

### 5. Ketimpangan — 1:03 s.d. 1:15 (12 detik)

**Di layar:** Kesenjangan HLS antarwilayah hampir tidak bergerak sejak 2020

> Kesenjangan lama sekolah orang dewasa memang menyempit, tapi kesenjangan harapan lama sekolah anak hampir tidak bergerak sejak 2020.

<sub>18 kata · sekitar 8 detik bila dibaca santai</sub>

### 6. Kemiskinan vs HLS — 1:15 s.d. 1:30 (15 detik)

**Di layar:** Kemiskinan vs HLS: ρ = 0,04 (tidak signifikan)

> Di halaman kedua, kami menguji apakah kemiskinan menjelaskan hal ini. Ternyata tidak. Korelasi Spearman antara persentase penduduk miskin dan harapan lama sekolah hanya nol koma nol empat, tidak signifikan.

<sub>29 kata · sekitar 12 detik bila dibaca santai</sub>

### 7. Kepadatan vs HLS — 1:30 s.d. 1:44 (14 detik)

**Di layar:** Kepadatan penduduk vs HLS: ρ = 0,85

> Begitu sumbu X diganti ke kepadatan penduduk, polanya jelas: korelasinya nol koma delapan lima. Daerah yang penduduknya jarang cenderung punya harapan lama sekolah lebih rendah.

<sub>25 kata · sekitar 10 detik bila dibaca santai</sub>

### 8. Matriks korelasi — 1:44 s.d. 2:04 (20 detik)

**Di layar:** Yang berkaitan: sekolah per 100 km² (ρ = 0,89), bukan sekolah per penduduk (ρ = 0,11)

> Matriks korelasi ini merangkum semuanya. Yang paling berkaitan dengan harapan lama sekolah adalah jumlah SMA dan SMK per seratus kilometer persegi, nol koma delapan sembilan. Jumlah sekolah per penduduk justru tidak berkaitan. Mesuji sebenarnya punya banyak sekolah per penduduk, tapi letaknya berjauhan.

<sub>42 kata · sekitar 18 detik bila dibaca santai</sub>

### 9. Tipologi — 2:04 s.d. 2:21 (17 detik)

**Di layar:** 3 tipe daerah · Mesuji, Way Kanan, Tulang Bawang, Tulang Bawang Barat selalu sekelompok

> Di halaman ketiga, lima belas daerah kami kelompokkan dengan K-Means menjadi tiga tipe. Mesuji, Way Kanan, Tulang Bawang, dan Tulang Bawang Barat selalu berada di kelompok yang sama, di semua solusi yang kami uji.

<sub>34 kata · sekitar 14 detik bila dibaca santai</sub>

### 10. Pilih kabupaten — 2:21 s.d. 2:32 (11 detik)

**Di layar:** Filter: pilih kabupaten untuk melihat tipe dan peringkatnya

> Pilih satu kabupaten, dan panel di kanan menampilkan tipenya serta peringkatnya di setiap indikator.

<sub>14 kata · sekitar 6 detik bila dibaca santai</sub>

### 11. Rekomendasi — 2:32 s.d. 2:54 (22 detik)

**Di layar:** Rekomendasi berbeda per tipe, lengkap dengan pihak penerima dan insight dasarnya

> Setiap tipe mendapat rekomendasi yang berbeda. Untuk tipe Mesuji: dekatkan SMA dan SMK ke permukiman lewat sekolah berasrama dan bantuan transportasi, perluas pendidikan kesetaraan untuk orang dewasa, dan jadikan lama sekolah sebagai kriteria prioritas, bukan hanya kemiskinan. Setiap rekomendasi menyebut pihak penerima dan insight yang mendasarinya.

<sub>46 kata · sekitar 19 detik bila dibaca santai</sub>

### 12. Tentang Data — 2:54 s.d. 3:06 (12 detik)

**Di layar:** Sumber BPS, metode, keterbatasan, dan pernyataan penggunaan AI

> Semua data berasal dari BPS dan bisa diunduh di halaman Tentang Data, lengkap dengan metode, keterbatasan, dan pernyataan penggunaan AI.

<sub>20 kata · sekitar 8 detik bila dibaca santai</sub>

### 13. Penutup — 3:06 s.d. 3:16 (10 detik)

**Di layar:** Kemiskinan rendah ≠ pendidikan baik · yang perlu diperhatikan: jarak ke sekolah

> Kesimpulannya: kemiskinan rendah tidak otomatis berarti pendidikan baik. Yang perlu diperhatikan adalah jarak ke sekolah. Terima kasih.

<sub>17 kata · sekitar 7 detik bila dibaca santai</sub>
