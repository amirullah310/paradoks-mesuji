// Merekam video demo situs (tanpa suara) dengan caption di layar.
//
// Pemakaian (dari folder demo/):
//   npm install
//   npm run build --prefix ../web          # pastikan web/out/ terbaru
//   node record.mjs                        # hasil: demo/video-demo-tanpa-suara.mp4
//
// Situs disajikan dari web/out/ oleh server statis kecil di port 4173.
// Browser: Microsoft Edge (atau set BROWSER_PATH ke Chrome/Edge lain).

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { SCENES } from "./scenes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, "../web/out");
const VIDEO = path.join(HERE, "video-demo-tanpa-suara.mp4");
const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;
const BROWSER_PATH =
  process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const WIDTH = 1280;
const HEIGHT = 720;
const HEADER_OFFSET = 64; // tinggi header situs yang menempel

if (!existsSync(OUT_DIR)) throw new Error("web/out belum ada. Jalankan `npm run build` di folder web dulu.");

// ---------- server statis ----------
const server = spawn("python", ["-m", "http.server", String(PORT), "-d", OUT_DIR, "--bind", "127.0.0.1"], {
  stdio: "ignore",
});
for (let i = 0; i < 50; i++) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {
    /* belum siap */
  }
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await puppeteer.launch({
  executablePath: BROWSER_PATH,
  headless: true,
  defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", String(e)));

const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

// ---------- caption (dipasang ulang setiap pindah halaman) ----------
async function setCaption(text, label) {
  await page.evaluate(
    ({ text, label }) => {
      let el = document.getElementById("__demo_caption");
      if (!el) {
        el = document.createElement("div");
        el.id = "__demo_caption";
        Object.assign(el.style, {
          position: "fixed",
          left: "50%",
          bottom: "14px",
          transform: "translateX(-50%)",
          maxWidth: "1040px",
          padding: "10px 18px",
          borderRadius: "10px",
          background: "rgba(11,11,11,0.86)",
          color: "#ffffff",
          font: '600 17px/1.35 ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif',
          textAlign: "center",
          zIndex: "2147483647",
          boxShadow: "0 6px 24px rgba(0,0,0,.25)",
          pointerEvents: "none",
        });
        document.body.appendChild(el);
      }
      // Selama perekaman bilah filter tidak menempel, agar tidak menutupi grafik.
      if (!document.getElementById("__demo_style")) {
        const st = document.createElement("style");
        st.id = "__demo_style";
        st.textContent = 'section[aria-label="Filter"]{position:static!important}';
        document.head.appendChild(st);
      }
      el.innerHTML = `<span style="opacity:.7;font-weight:500;margin-right:10px">${label}</span>${text}`;
    },
    { text, label },
  );
}

let current = { text: "", label: "" };

// ---------- helper aksi ----------
let deadline = 0; // batas akhir adegan berjalan (ms sejak epoch)

const h = {
  /** Tunggu, tetapi tidak melewati batas akhir adegan agar video tetap sinkron dengan naskah. */
  wait: (s) => sleep(Math.max(0, Math.min(s, (deadline - Date.now()) / 1000))),
  async goto(route) {
    await page.goto(BASE + route, { waitUntil: "networkidle0" });
    await sleep(0.8);
    await setCaption(current.text, current.label);
  },
  async clickNav(href) {
    await page.click(`header nav a[href^="${href}"]`);
    await page.waitForNetworkIdle({ idleTime: 400 });
    await sleep(0.8);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await setCaption(current.text, current.label);
  },
  /** Gulir halus sampai elemen yang memuat teks berada `offset` px di bawah tepi atas. */
  async scrollToText(text, offset = 80) {
    await page.evaluate(
      ({ text, offset, header }) => {
        const nodes = [...document.querySelectorAll("h1,h2,h3,p,span,div,button,dt,th")];
        const el = nodes.find((n) => n.childElementCount === 0 && n.textContent.trim().startsWith(text));
        if (!el) throw new Error(`Teks tidak ditemukan: ${text}`);
        const top = el.getBoundingClientRect().top + window.scrollY - header - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      },
      { text, offset, header: HEADER_OFFSET },
    );
    await sleep(1.2);
  },
  /** Gulir halus sampai kartu berisi grafik (aria-label diawali `prefix`) berada `offset` px di bawah header. */
  async scrollToChart(prefix, offset = 8) {
    await page.evaluate(
      ({ prefix, offset, header }) => {
        const chart = [...document.querySelectorAll('[role="img"]')].find((n) =>
          (n.getAttribute("aria-label") ?? "").startsWith(prefix),
        );
        if (!chart) throw new Error(`Grafik tidak ditemukan: ${prefix}`);
        const card = chart.closest("section") ?? chart;
        const top = card.getBoundingClientRect().top + window.scrollY - header - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      },
      { prefix, offset, header: HEADER_OFFSET },
    );
    await sleep(1.2);
  },
  async scrollBy(dy) {
    await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: "smooth" }), dy);
    await sleep(1);
  },
  /** Arahkan kursor ke posisi relatif di dalam grafik yang aria-label-nya diawali `prefix`. */
  async hoverChart(prefix, rx, ry) {
    const box = await page.evaluate((prefix) => {
      const el = [...document.querySelectorAll('[role="img"]')].find((n) =>
        (n.getAttribute("aria-label") ?? "").startsWith(prefix),
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }, prefix);
    if (!box) throw new Error(`Grafik tidak ditemukan: ${prefix}`);
    await page.mouse.move(box.x + box.w * rx, box.y + box.h * ry, { steps: 25 });
  },
  /** Pilih opsi pada Select yang label-nya ber-id `labelId`. */
  async selectOption(labelId, optionText) {
    await page.click(`[aria-labelledby="${labelId}"]`);
    await sleep(0.7);
    const opt = await page.waitForSelector(`::-p-xpath(//*[@role="option"][normalize-space()="${optionText}"])`);
    await opt.hover();
    await sleep(0.5);
    await opt.click();
    await sleep(0.8);
  },
  async chooseRegion(nama) {
    await page.click('[aria-labelledby="label-wilayah"]');
    await sleep(0.7);
    await page.type('input[placeholder^="Cari kab/kota"]', nama, { delay: 90 });
    await sleep(0.6);
    await page.keyboard.press("Enter");
    await sleep(0.8);
  },
};

// ---------- rekam ----------
await page.goto(BASE + "/", { waitUntil: "networkidle0" });
const recorder = await page.screencast({ path: VIDEO, fps: 30, quality: 20 });
const t0 = Date.now();
let planned = 0;
for (const [i, scene] of SCENES.entries()) {
  current = { text: scene.caption, label: `${i + 1}/${SCENES.length}` };
  await setCaption(current.text, current.label);
  const start = Date.now();
  planned += scene.durasi;
  deadline = t0 + planned * 1000;
  await scene.aksi(h);
  // Samakan dengan durasi di naskah: tunggu sisa waktu bila aksi selesai lebih cepat.
  const drift = planned - (Date.now() - t0) / 1000;
  if (drift > 0) await sleep(drift);
  const took = (Date.now() - start) / 1000;
  console.log(`${String(i + 1).padStart(2)}. ${scene.judul.padEnd(20)} rencana ${scene.durasi}s, aktual ${took.toFixed(1)}s`);
}
await recorder.stop();
await browser.close();
server.kill();
console.log(`Total ${((Date.now() - t0) / 1000).toFixed(1)}s (rencana ${planned}s) -> ${VIDEO}`);
