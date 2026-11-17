// Menulis NASKAH_VIDEO.md dari scenes.mjs: potongan narasi per adegan dengan waktu mulai-selesai.
// Pemakaian: node naskah.mjs
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES } from "./scenes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(1, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const words = (t) => t.split(/\s+/).filter(Boolean).length;

let t = 0;
const parts = [];
for (const [i, s] of SCENES.entries()) {
  const start = t;
  t += s.durasi;
  const w = words(s.narasi);
  parts.push(
    `### ${i + 1}. ${s.judul} — ${mmss(start)} s.d. ${mmss(t)} (${s.durasi} detik)\n\n` +
      `**Di layar:** ${s.caption}\n\n` +
      `> ${s.narasi}\n\n` +
      `<sub>${w} kata · sekitar ${Math.round(w / 2.4)} detik bila dibaca santai</sub>\n`,
  );
}

const md = `# Naskah narasi video demo — Paradoks Mesuji

Total durasi: **${mmss(t)}** (${SCENES.length} adegan). Video tanpa suara: \`demo/video-demo-tanpa-suara.mp4\`.

## Cara merekam

1. Rekam **satu berkas per adegan** (nama: \`01.m4a\`, \`02.m4a\`, …). Kalau salah, ulang adegan itu saja.
2. Baca santai. Setiap adegan sudah diberi ruang beberapa detik; kalau suara lebih pendek, sisanya hening dan tidak masalah.
   Kalau lebih panjang dari durasi adegan, bacalah sedikit lebih cepat atau beri tahu saya untuk memperpanjang adegannya.
3. Rekam di ruangan sepi; HP sudah cukup. Diam 1 detik sebelum dan sesudah bicara.
4. Simpan berkasnya di folder \`demo/suara/\`, lalu jalankan \`node gabung-suara.mjs\` dari folder \`demo/\`.
   Hasilnya \`demo/video-demo-final.mp4\`: tiap rekaman otomatis ditempatkan di detik awal adegannya.

Angka dibaca seperti tertulis (mis. "tujuh koma tiga nol"). Semua angka sesuai data BPS di dashboard.

## Naskah per adegan

${parts.join("\n")}`;

writeFileSync(path.join(HERE, "NASKAH_VIDEO.md"), md, "utf-8");
console.log(`NASKAH_VIDEO.md ditulis: ${SCENES.length} adegan, ${mmss(t)}`);
