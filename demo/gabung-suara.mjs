// Menggabungkan rekaman suara per adegan dengan video tanpa suara.
//
// Taruh berkas suara di demo/suara/ dengan nama 01.*, 02.*, … 13.* (m4a, mp3, wav, ogg, opus, aac, flac).
// Setiap berkas diletakkan tepat di detik awal adegannya (sesuai scenes.mjs / NASKAH_VIDEO.md).
// Adegan tanpa berkas suara dibiarkan hening.
//
// Pemakaian (dari folder demo/): node gabung-suara.mjs
// Hasil: demo/video-demo-final.mp4  (butuh ffmpeg di PATH)

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES } from "./scenes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIDEO = path.join(HERE, "video-demo-tanpa-suara.mp4");
const AUDIO_DIR = path.join(HERE, "suara");
const OUT = path.join(HERE, "video-demo-final.mp4");
const EXT = /\.(m4a|mp3|wav|ogg|opus|aac|flac)$/i;

if (!existsSync(VIDEO)) throw new Error("video-demo-tanpa-suara.mp4 belum ada; jalankan record.mjs dulu.");
const files = existsSync(AUDIO_DIR) ? readdirSync(AUDIO_DIR).filter((f) => EXT.test(f)) : [];

// Detik awal tiap adegan
const starts = [];
let t = 0;
for (const s of SCENES) {
  starts.push(t);
  t += s.durasi;
}
const total = t;

const inputs = ["-i", VIDEO];
const filters = [];
const labels = [];
for (let i = 0; i < SCENES.length; i++) {
  const nomor = String(i + 1).padStart(2, "0");
  const file = files.find((f) => f.startsWith(nomor + "."));
  if (!file) {
    console.log(`Adegan ${nomor} (${SCENES[i].judul}): tidak ada suara, dibiarkan hening`);
    continue;
  }
  const dur = probeDuration(path.join(AUDIO_DIR, file));
  const warn = dur > SCENES[i].durasi ? `  ⚠ lebih panjang ${(dur - SCENES[i].durasi).toFixed(1)} detik dari adegannya` : "";
  console.log(`Adegan ${nomor} (${SCENES[i].judul}): ${file}, ${dur.toFixed(1)} dtk / jatah ${SCENES[i].durasi} dtk${warn}`);
  const idx = inputs.length / 2;
  inputs.push("-i", path.join(AUDIO_DIR, file));
  const ms = Math.round(starts[i] * 1000);
  // seragamkan format, beri jeda 0,3 detik di awal adegan, lalu geser ke waktu adegan
  filters.push(`[${idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${ms + 300}|${ms + 300}[a${idx}]`);
  labels.push(`[a${idx}]`);
}
if (labels.length === 0) throw new Error(`Tidak ada berkas suara di ${AUDIO_DIR} (nama 01.m4a, 02.m4a, …).`);

filters.push(
  `${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,` +
    `loudnorm=I=-16:TP=-1.5:LRA=11,apad,atrim=0:${total}[aout]`,
);

const args = [
  "-y", "-v", "error", ...inputs,
  "-filter_complex", filters.join(";"),
  "-map", "0:v", "-map", "[aout]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest",
  OUT,
];
const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (r.status !== 0) throw new Error("ffmpeg gagal");
console.log(`Selesai: ${OUT}`);

function probeDuration(file) {
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
    encoding: "utf-8",
  });
  return Number(p.stdout.trim());
}
