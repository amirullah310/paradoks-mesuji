// Pasca-build: ekspor statis Next.js menyimpan data prefetch per segmen di folder
// bersarang (out/paradoks/__next.paradoks/__PAGE__.txt), sedangkan browser memintanya
// dengan nama bertitik (out/paradoks/__next.paradoks.__PAGE__.txt). Vercel memetakan ini
// sendiri; skrip ini menyalin berkasnya agar host statis biasa (GitHub Pages, http.server)
// tidak mengembalikan 404 saat berpindah halaman.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
let copied = 0;

function flatten(segmentDir, parent, prefix) {
  for (const name of readdirSync(segmentDir)) {
    const full = path.join(segmentDir, name);
    const flatName = `${prefix}.${name}`;
    if (statSync(full).isDirectory()) {
      flatten(full, parent, flatName);
    } else {
      const target = path.join(parent, flatName);
      if (!existsSync(target)) {
        copyFileSync(full, target);
        copied += 1;
      }
    }
  }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(full, dir, name);
    else if (name !== "_next") walk(full);
  }
}

if (existsSync(OUT)) {
  walk(OUT);
  console.log(`flatten-segments: ${copied} berkas disalin`);
}
