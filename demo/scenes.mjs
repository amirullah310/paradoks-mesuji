// Daftar adegan video demo. Dipakai oleh record.mjs (rekaman layar) dan
// naskah.mjs (naskah narasi), sehingga durasi di video dan naskah selalu sama.
//
// Angka dalam narasi diambil dari web/public/data (data BPS 2025). Bila data
// berubah, periksa ulang angka di sini sebelum merekam ulang.
//
// durasi  : panjang adegan dalam detik (sudah termasuk jeda napas)
// caption : teks singkat di layar
// narasi  : kalimat yang dibaca perekam suara
// aksi    : langkah di browser (lihat helper di record.mjs)

export const SCENES = [
  {
    judul: "Pembuka",
    durasi: 14,
    caption: "Paradoks Mesuji · Tim KomitPNL, Politeknik Negeri Lhokseumawe",
    narasi:
      "Halo, kami tim KomitPNL dari Politeknik Negeri Lhokseumawe. Ini dashboard Paradoks Mesuji, untuk subtema Pendidikan. " +
      "Kami membandingkan pendidikan di lima belas kabupaten dan kota di Lampung.",
    aksi: async (h) => {
      await h.goto("/");
      await h.wait(13);
    },
  },
  {
    judul: "Masalah",
    durasi: 17,
    caption: "Kemiskinan Mesuji terendah (5,92%), tetapi lama sekolahnya juga terendah",
    narasi:
      "Masalahnya begini: Mesuji punya persentase penduduk miskin paling rendah di Lampung, lima koma sembilan dua persen. " +
      "Tapi lama sekolahnya justru paling pendek. Kalau prioritas program hanya dilihat dari kemiskinan, Mesuji akan terlewat.",
    aksi: async (h) => {
      await h.scrollToText("Permasalahan", 90);
      await h.wait(15);
    },
  },
  {
    judul: "Peta lama sekolah",
    durasi: 17,
    caption: "RLS 2025: Mesuji 7,30 tahun vs Kota Metro 11,19 tahun",
    narasi:
      "Di peta ini, warna makin gelap berarti rata-rata lama sekolah makin tinggi. Tahun 2025, penduduk dewasa Mesuji " +
      "rata-rata bersekolah tujuh koma tiga nol tahun, sedangkan Kota Metro sebelas koma satu sembilan tahun. " +
      "Selisihnya tiga koma delapan sembilan tahun.",
    aksi: async (h) => {
      await h.scrollToChart("Peta", 8);
      await h.wait(2);
      await h.hoverChart("Peta", 0.7, 0.14);
      await h.wait(13);
    },
  },
  {
    judul: "Filter indikator",
    durasi: 15,
    caption: "Filter: ganti indikator ke Harapan Lama Sekolah (HLS)",
    narasi:
      "Indikator dan tahun bisa diganti lewat filter di atas. Untuk harapan lama sekolah anak-anak, Mesuji juga terendah, " +
      "dan garis oranye ini menunjukkan Mesuji selalu di posisi terbawah sejak 2015.",
    aksi: async (h) => {
      await h.scrollToText("Indikator", 0);
      await h.selectOption("label-indikator", "Harapan Lama Sekolah (HLS)");
      await h.scrollToChart("Peta", 8);
      await h.wait(2);
      await h.hoverChart("Tren", 0.6, 0.7);
      await h.wait(9);
    },
  },
  {
    judul: "Ketimpangan",
    durasi: 12,
    caption: "Kesenjangan HLS antarwilayah hampir tidak bergerak sejak 2020",
    narasi:
      "Kesenjangan lama sekolah orang dewasa memang menyempit, tapi kesenjangan harapan lama sekolah anak " +
      "hampir tidak bergerak sejak 2020.",
    aksi: async (h) => {
      await h.scrollToChart("Selisih", 8);
      await h.wait(11);
    },
  },
  {
    judul: "Kemiskinan vs HLS",
    durasi: 15,
    caption: "Kemiskinan vs HLS: ρ = 0,04 (tidak signifikan)",
    narasi:
      "Di halaman kedua, kami menguji apakah kemiskinan menjelaskan hal ini. Ternyata tidak. Korelasi Spearman antara " +
      "persentase penduduk miskin dan harapan lama sekolah hanya nol koma nol empat, tidak signifikan.",
    aksi: async (h) => {
      await h.clickNav("/paradoks/");
      await h.wait(1.5);
      await h.scrollToChart("Diagram pencar", 8);
      await h.wait(12);
    },
  },
  {
    judul: "Kepadatan vs HLS",
    durasi: 14,
    caption: "Kepadatan penduduk vs HLS: ρ = 0,85",
    narasi:
      "Begitu sumbu X diganti ke kepadatan penduduk, polanya jelas: korelasinya nol koma delapan lima. " +
      "Daerah yang penduduknya jarang cenderung punya harapan lama sekolah lebih rendah.",
    aksi: async (h) => {
      await h.scrollToText("Sumbu X", 0);
      await h.selectOption("label-x", "Kepadatan penduduk");
      await h.scrollToChart("Diagram pencar", 8);
      await h.wait(12);
    },
  },
  {
    judul: "Matriks korelasi",
    durasi: 20,
    caption: "Yang berkaitan: sekolah per 100 km² (ρ = 0,89), bukan sekolah per penduduk (ρ = 0,11)",
    narasi:
      "Matriks korelasi ini merangkum semuanya. Yang paling berkaitan dengan harapan lama sekolah adalah jumlah SMA dan SMK " +
      "per seratus kilometer persegi, nol koma delapan sembilan. Jumlah sekolah per penduduk justru tidak berkaitan. " +
      "Mesuji sebenarnya punya banyak sekolah per penduduk, tapi letaknya berjauhan.",
    aksi: async (h) => {
      await h.scrollToChart("Matriks korelasi", 8);
      await h.wait(18);
    },
  },
  {
    judul: "Tipologi",
    durasi: 17,
    caption: "3 tipe daerah · Mesuji, Way Kanan, Tulang Bawang, Tulang Bawang Barat selalu sekelompok",
    narasi:
      "Di halaman ketiga, lima belas daerah kami kelompokkan dengan K-Means menjadi tiga tipe. Mesuji, Way Kanan, " +
      "Tulang Bawang, dan Tulang Bawang Barat selalu berada di kelompok yang sama, di semua solusi yang kami uji.",
    aksi: async (h) => {
      await h.clickNav("/tipologi/");
      await h.wait(1.5);
      await h.scrollToChart("Peta", 8);
      await h.wait(14);
    },
  },
  {
    judul: "Pilih kabupaten",
    durasi: 11,
    caption: "Filter: pilih kabupaten untuk melihat tipe dan peringkatnya",
    narasi: "Pilih satu kabupaten, dan panel di kanan menampilkan tipenya serta peringkatnya di setiap indikator.",
    aksi: async (h) => {
      await h.scrollToText("Kabupaten/kota", 0);
      await h.chooseRegion("Way Kanan");
      await h.scrollToChart("Peta", 8);
      await h.wait(9);
    },
  },
  {
    judul: "Rekomendasi",
    durasi: 22,
    caption: "Rekomendasi berbeda per tipe, lengkap dengan pihak penerima dan insight dasarnya",
    narasi:
      "Setiap tipe mendapat rekomendasi yang berbeda. Untuk tipe Mesuji: dekatkan SMA dan SMK ke permukiman lewat sekolah " +
      "berasrama dan bantuan transportasi, perluas pendidikan kesetaraan untuk orang dewasa, dan jadikan lama sekolah " +
      "sebagai kriteria prioritas, bukan hanya kemiskinan. Setiap rekomendasi menyebut pihak penerima dan insight yang mendasarinya.",
    aksi: async (h) => {
      await h.scrollToText("Rekomendasi per tipe daerah", 80);
      await h.wait(9);
      await h.scrollBy(320);
      await h.wait(10);
    },
  },
  {
    judul: "Tentang Data",
    durasi: 12,
    caption: "Sumber BPS, metode, keterbatasan, dan pernyataan penggunaan AI",
    narasi:
      "Semua data berasal dari BPS dan bisa diunduh di halaman Tentang Data, lengkap dengan metode, keterbatasan, " +
      "dan pernyataan penggunaan AI.",
    aksi: async (h) => {
      await h.clickNav("/tentang/");
      await h.wait(4);
      await h.scrollToText("Sumber data", 80);
      await h.wait(6);
    },
  },
  {
    judul: "Penutup",
    durasi: 10,
    caption: "Kemiskinan rendah ≠ pendidikan baik · yang perlu diperhatikan: jarak ke sekolah",
    narasi:
      "Kesimpulannya: kemiskinan rendah tidak otomatis berarti pendidikan baik. Yang perlu diperhatikan adalah " +
      "jarak ke sekolah. Terima kasih.",
    aksi: async (h) => {
      await h.clickNav("/");
      await h.wait(9);
    },
  },
];
