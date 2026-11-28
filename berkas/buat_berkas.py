"""Membuat dua berkas pengumpulan lomba sebagai PDF:

  DASHBOARD_<Tim>_<Kampus>.pdf    tautan dashboard, repo, video, dan dataset (guidebook: Ketentuan Pengumpulan)
  ORISINALITAS_<Tim>_<Kampus>.pdf surat pernyataan orisinalitas (guidebook: Lampiran 1)

Isian diambil dari data_berkas.json; daftar sumber data diambil dari web/public/data/meta.json.
Isian yang masih kosong dicetak sebagai titik-titik (surat) atau tanda merah [BELUM DIISI] (dashboard).

Pemakaian (dari folder mana saja):  python berkas/buat_berkas.py
Butuh Microsoft Edge (atau set BROWSER_PATH ke Chrome/Edge) untuk mencetak HTML ke PDF.
"""

import html
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
BROWSER = os.environ.get("BROWSER_PATH", r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

cfg = json.loads((HERE / "data_berkas.json").read_text(encoding="utf-8"))
# Data pribadi (mis. NIP dosen) disimpan terpisah dan tidak di-commit ke repo publik.
_pribadi = HERE / "data_pribadi.json"
if _pribadi.exists():
    cfg.update(json.loads(_pribadi.read_text(encoding="utf-8")))
meta = json.loads((ROOT / "web" / "public" / "data" / "meta.json").read_text(encoding="utf-8"))

e = html.escape
missing: list[str] = []

CSS = """
@page { size: A4; margin: 2.5cm 2.5cm 2.5cm 2.5cm; }
* { box-sizing: border-box; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 0; }
h1 { font-size: 14pt; text-align: center; margin: 0 0 4pt; text-transform: uppercase; letter-spacing: .3pt; }
.sub { text-align: center; margin: 0 0 18pt; }
table.isian { border-collapse: collapse; margin: 6pt 0 12pt; }
table.isian td { vertical-align: top; padding: 1pt 0; }
table.isian td.k { width: 4.2cm; }
table.isian td.c { width: .6cm; }
p { margin: 0 0 9pt; text-align: justify; }
.kosong { color: #b00020; font-weight: bold; }
a { color: #0b4fa8; word-break: break-word; }
table.grid { border-collapse: collapse; width: 100%; margin: 6pt 0 12pt; font-size: 11pt; line-height: 1.35; }
table.grid th, table.grid td { border: 1px solid #555; padding: 4pt 6pt; vertical-align: top; text-align: left; }
table.grid th { background: #eee; }
.ttd { display: flex; justify-content: space-between; margin-top: 14pt; }
.ttd > div { width: 45%; }
.ruang { height: 2.6cm; }
.kecil { font-size: 10.5pt; }
"""


def isi(key: str, label: str, dots: int = 40) -> str:
    """Nilai isian; bila kosong, kembalikan titik-titik dan catat sebagai belum diisi."""
    v = str(cfg.get(key, "")).strip()
    if v:
        return e(v)
    missing.append(label)
    return "." * dots


def link(key: str, label: str) -> str:
    v = str(cfg.get(key, "")).strip()
    if v:
        return f'<a href="{e(v)}">{e(v)}</a>'
    missing.append(label)
    return f'<span class="kosong">[BELUM DIISI — isi "{key}" di berkas/data_berkas.json]</span>'


def to_pdf(body: str, title: str, out: Path) -> None:
    page = f'<!doctype html><html lang="id"><head><meta charset="utf-8"><title>{e(title)}</title><style>{CSS}</style></head><body>{body}</body></html>'
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "berkas.html"
        src.write_text(page, encoding="utf-8")
        out.unlink(missing_ok=True)
        subprocess.run(
            [BROWSER, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
             f"--user-data-dir={Path(tmp) / 'profil'}", f"--print-to-pdf={out}", src.as_uri()],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
        )
    if not out.exists():
        sys.exit(f"Gagal membuat {out.name}")


tim, kampus_file = cfg["tim"], cfg["kampusUntukNamaFile"]

# ---------------------------------------------------------------- ORISINALITAS (Lampiran 1)
missing.clear()
tanggal = cfg.get("tanggal", "").strip()
tempat_tanggal = f"{e(cfg['tempat'])}, {e(tanggal) if tanggal else '.' * 24 + ' 2026'}"
if not tanggal:
    missing.append("tanggal surat")
nip_dosen = f'<br>NIP. {e(cfg["nipDosen"])}' if str(cfg.get("nipDosen", "")).strip() else ""
orisinalitas = f"""
<h1>Surat Pernyataan Orisinalitas Karya</h1>
<p class="sub">AI &amp; Coding Dashboard Challenge · Festival &amp; Expo Sains Data Nasional 2026</p>
<p>Yang bertanda tangan di bawah ini:</p>
<table class="isian">
  <tr><td class="k">Nama Ketua Tim</td><td class="c">:</td><td>{isi("ketuaTim", "nama ketua tim")}</td></tr>
  <tr><td class="k">Nama Tim</td><td class="c">:</td><td>{e(cfg["tim"])}</td></tr>
  <tr><td class="k">Asal Kampus</td><td class="c">:</td><td>{e(cfg["kampus"])}</td></tr>
  <tr><td class="k">Judul Karya</td><td class="c">:</td><td>{e(cfg["judulKarya"])}</td></tr>
</table>
<p>Dengan ini menyatakan bahwa karya yang kami kirimkan pada AI &amp; Coding Dashboard Challenge, Festival &amp; Expo
Sains Data Nasional 2026, adalah hasil karya orisinal kami, bukan hasil plagiarisme, tidak memanipulasi data, belum
pernah menjadi juara pada kompetisi lain, dan tidak sedang diikutsertakan dalam kompetisi sejenis. Apabila pernyataan
ini tidak benar, kami bersedia menerima sanksi sesuai ketentuan panitia.</p>
<p style="margin-top:14pt">{tempat_tanggal}</p>
<div class="ttd">
  <div>Ketua Tim,<div class="ruang"></div>( {isi("ketuaTim", "nama ketua tim", 36)} )</div>
  <div>Dosen Pembimbing,<div class="ruang"></div>( {isi("dosenPembimbing", "nama dosen pembimbing", 36)} ){nip_dosen}</div>
</div>
"""
out_ori = HERE / f"ORISINALITAS_{tim}_{kampus_file}.pdf"
to_pdf(orisinalitas, "Surat Pernyataan Orisinalitas Karya", out_ori)
missing_ori = sorted(set(missing))

# ---------------------------------------------------------------- DASHBOARD (berkas utama)
missing.clear()
repo = cfg.get("linkRepo", "").strip().rstrip("/")
if repo:
    raw = f"{repo}/tree/main/data/raw"
    dataset_repo = f'<a href="{e(raw)}">{e(raw)}</a> (CSV asli) · unduhan data bersih di halaman Tentang Data situs'
else:
    dataset_repo = link("linkRepo", "link repo GitHub (untuk folder dataset)")

BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober",
         "November", "Desember"]
y, mth, d = (int(x) for x in meta["diaksesPada"].split("-"))
diakses = f"{d} {BULAN[mth - 1]} {y}"
sumber_rows = "".join(
    f'<tr><td><a href="{e(s["url"])}">{e(s["nama"])}</a> <span class="kecil">({e(s["url"].split("/")[2])})</span></td>'
    f'<td>{e(s["periode"])}</td></tr>'
    for s in meta["sumber"]
)
dashboard = f"""
<h1>{e(cfg["judulKarya"])}</h1>
<p class="sub">AI &amp; Coding Dashboard Challenge 2026 · Subtema {e(cfg["subtema"])}<br>
Tim {e(cfg["tim"])} · {e(cfg["kampus"])}</p>

<table class="grid">
  <tr><th style="width:30%">Berkas / tautan</th><th>Alamat</th></tr>
  <tr><td>Dashboard (dapat dibuka tanpa login)</td><td>{link("linkDashboard", "link dashboard")}</td></tr>
  <tr><td>Source code (GitHub)</td><td>{link("linkRepo", "link repo GitHub")}</td></tr>
  <tr><td>Video demo</td><td>{link("linkVideo", "link video demo")}</td></tr>
  <tr><td>Dataset</td><td>{dataset_repo}</td></tr>
</table>

<p>Dashboard ini menunjukkan ketimpangan pendidikan di {meta["dataset"]["jumlahWilayah"]} kabupaten/kota Provinsi Lampung
(periode {e(meta["dataset"]["periode"])}), menguji mengapa Kabupaten Mesuji dengan persentase penduduk miskin terendah
justru memiliki capaian pendidikan terendah, lalu mengelompokkan daerah ke dalam tipe dengan rekomendasi masing-masing.</p>

<p style="margin-bottom:3pt"><b>Sumber data</b> (diakses {diakses}; klik nama sumber untuk membuka tabel aslinya):</p>
<table class="grid"><tr><th>Sumber</th><th style="width:22%">Periode</th></tr>{sumber_rows}</table>
"""
out_dash = HERE / f"DASHBOARD_{tim}_{kampus_file}.pdf"
to_pdf(dashboard, f"DASHBOARD {tim}", out_dash)
missing_dash = sorted(set(missing))

# ---------------------------------------------------------------- RINGKASAN (maks. 3 halaman)
# Semua angka diambil dari JSON hasil pipeline; teks insight dan rekomendasi sama dengan yang tampil di situs.
missing.clear()
DATA = ROOT / "web" / "public" / "data"
panel = json.loads((DATA / "panel.json").read_text(encoding="utf-8"))
insights = {i["id"]: i for i in json.loads((DATA / "insights.json").read_text(encoding="utf-8"))}
clusters = json.loads((DATA / "clusters.json").read_text(encoding="utf-8"))
regions = {r["kode"]: r for r in json.loads((DATA / "regions.json").read_text(encoding="utf-8"))}


def angka(x: float, d: int = 2) -> str:
    return f"{x:,.{d}f}".replace(",", "_").replace(".", ",").replace("_", ".")


Y = meta["dataset"]["tahunPenampang"]
baris = [r for r in panel if r["tahun"] == Y]
kab = [r for r in baris if r["kode"] != "1800"]
prov = next(r for r in baris if r["kode"] == "1800")
rls_lo = min(kab, key=lambda r: r["rls"])
rls_hi = max(kab, key=lambda r: r["rls"])
miskin_lo = min(kab, key=lambda r: r["pctMiskin"])
assert miskin_lo["kode"] == rls_lo["kode"], "Paradoks berubah: daerah termiskin-terendah tidak sama dengan RLS terendah"

ev = next(x for x in meta["metode"]["evaluasiK"] if x["k"] == meta["metode"]["kTerpilih"])
hasil_label = {"didukung": "didukung", "sebagian": "didukung sebagian", "tidak didukung": "tidak didukung"}
hipotesis = "; ".join(
    f"<b>{e(h['id'])}</b> {e(h['pernyataan'].rstrip('.')[0].lower() + h['pernyataan'].rstrip('.')[1:])} "
    f"<i>({hasil_label[h['hasil']]})</i>"
    for h in meta["hipotesis"]
)
insight_list = "".join(
    f"<li><b>{e(insights[i]['judul'])}</b>: {e(insights[i]['angka'])}.</li>"
    for i in ["I1", "I3", "I5", "I6", "I7", "I9"]
)
rekom = "".join(
    f"<li><b>Tipe {c['id']}. {e(c['nama'])}</b> ({e(', '.join(regions[k]['nama'] for k in c['anggota']))}):"
    "<ul>"
    + "".join(f"<li>{e(r['intervensi'])} <i>Penerima: {e(r['sasaran'])}.</i></li>" for r in c["rekomendasi"])
    + "</ul></li>"
    for c in clusters
)
ai_rows = "".join(
    f"<tr><td>{n}</td><td>{e(a['alat'])}</td><td>{e(a['tujuan'])}</td><td>{e(a['bagian'])}</td></tr>"
    for n, a in enumerate(meta["aiDisclosure"], 1)
)
link_dash = cfg.get("linkDashboard", "").strip()
tautan = (
    f'<a href="{e(link_dash)}">{e(link_dash)}</a>'
    if link_dash
    else link("linkDashboard", "link dashboard")
)

RINGKASAN_CSS = """
@page { size: A4; margin: 2cm 2.5cm 2cm 2.5cm; }
h2 { font-size: 12pt; margin: 8pt 0 2pt; }
ul, ol { margin: 0 0 6pt; padding-left: 18pt; }
li { margin: 0 0 1pt; text-align: justify; }
li ul { margin: 1pt 0 2pt; }
.head { text-align: center; margin-bottom: 8pt; }
table.grid { font-size: 12pt; }
"""

ringkasan = f"""
<style>{RINGKASAN_CSS}</style>
<h1>{e(cfg["judulKarya"])}</h1>
<div class="head">Ringkasan Proyek · AI &amp; Coding Dashboard Challenge 2026 · Subtema {e(cfg["subtema"])}<br>
Tim {e(cfg["tim"])} (ketua: {isi("ketuaTim", "nama ketua tim", 20)}) · {e(cfg["kampus"])}<br>
Dashboard: {tautan}</div>

<h2>1. Permasalahan</h2>
<p>Capaian pendidikan antar-{meta["dataset"]["jumlahWilayah"]} kabupaten/kota di Provinsi Lampung timpang, sementara angka
kemiskinan sering dipakai untuk menentukan daerah prioritas. Pada {Y}, {e(miskin_lo["nama"])} memiliki persentase penduduk
miskin terendah ({angka(miskin_lo["pctMiskin"])}%; provinsi {angka(prov["pctMiskin"])}%), tetapi rata-rata lama sekolah (RLS)
penduduk dewasanya juga terendah: {angka(rls_lo["rls"])} tahun, dibanding {angka(rls_hi["rls"])} tahun di {e(rls_hi["nama"])}
dan {angka(prov["rls"])} tahun rata-rata provinsi. Bila prioritas hanya mengikuti kemiskinan, daerah ini justru terlewat.
Pertanyaan analisis: (1) seberapa timpang lama sekolah dan apakah kesenjangannya menyempit; (2) faktor apa yang berkaitan
dengan lama sekolah selain kemiskinan; (3) tipe daerah apa yang ada dan intervensi apa yang cocok untuk tiap tipe.</p>

<h2>2. Data</h2>
<p>Data agregat resmi BPS dan BPS Provinsi Lampung (diakses {diakses}): RLS, harapan lama sekolah (HLS), dan pengeluaran riil
per kapita 2015–2026; persentase penduduk miskin 2015–2025; IPM seri UHH Long Form SP2020 2020–2026; serta, untuk {Y},
porsi PDRB sektor primer, jumlah SMP/SMA/SMK, penduduk, dan kepadatan. Luas wilayah dihitung dari peta geoBoundaries.
Panel berisi {meta["dataset"]["jumlahBarisPanel"]} baris ({meta["dataset"]["jumlahWilayah"]} kab/kota + provinsi × 12 tahun)
dengan {angka(meta["dataset"]["jumlahNilaiTerisi"], 0)} nilai terisi. Penggabungan memakai kode wilayah BPS; nilai yang tidak
dipublikasikan dibiarkan kosong tanpa imputasi, dan tidak ada data sintetis.</p>

<h2>3. Metode</h2>
<p>Pipeline Python yang dapat dijalankan ulang dengan hasil identik: (a) ketimpangan per tahun dengan selisih
tertinggi–terendah dan koefisien variasi; (b) korelasi peringkat Spearman pada data {Y} (n = 15) dengan p-value, diulang
tanpa dua kota (n = 13) sebagai uji ketahanan; (c) K-Means pada 8 variabel z-score (kepadatan di-log) dengan k = 3, 4, 5
dibandingkan lewat skor siluet dan kesesuaian dengan clustering Ward, menghasilkan k = {meta["metode"]["kTerpilih"]}
(siluet {angka(ev["silhouette"])}); (d) peringkat 1–15 per indikator. Hipotesis yang diuji, dengan hasil apa adanya:
{hipotesis}.</p>

<h2>4. Visualisasi utama</h2>
<p><b>Masalah:</b> kartu KPI, peta choropleth 15 kab/kota, tren 2015–2026 dengan kab/kota terpilih disorot, dan grafik
ketimpangan. <b>Paradoks:</b> diagram pencar dengan sumbu X yang bisa diganti, matriks korelasi Spearman bertanda
signifikansi, tabel peringkat, dan tren kemiskinan vs RLS. <b>Tipologi &amp; Solusi:</b> peta tipe daerah, profil z-score,
panel detail kab/kota, dan kartu rekomendasi. Filter tahun, kab/kota, indikator, dan sumbu grafik tersimpan di URL.</p>

<h2>5. Insight utama</h2>
<ol>{insight_list}</ol>

<h2>6. Rekomendasi (berbeda per tipe daerah)</h2>
<ul>{rekom}</ul>
<p><i>Keterbatasan:</i> n = 15 (korelasional, bukan sebab-akibat); APS, guru, dan murid per kab/kota tidak tersedia daring;
sekolah per 100 km² hanya pendekatan jarak; skor siluet rendah.</p>

<h2>7. Tools</h2>
<p>Python 3.12 (pandas, SciPy, scikit-learn, GeoPandas, uv) untuk olah data dan analisis; Next.js 16, React 19, TypeScript,
Tailwind CSS, shadcn/ui, dan Apache ECharts untuk dashboard; zod untuk validasi data; GitHub untuk kode; Vercel untuk hosting.</p>

<h2>8. Deklarasi penggunaan AI</h2>
<table class="grid">
<tr><th style="width:6%">No.</th><th style="width:20%">Tools AI</th><th>Tujuan penggunaan</th><th style="width:30%">Bagian karya yang terkait</th></tr>
{ai_rows}
</table>
<p>{" ".join(e(v) for v in meta["verifikasiAi"])}</p>
"""
out_ring = HERE / f"RINGKASAN_{tim}_{kampus_file}.pdf"
to_pdf(ringkasan, f"RINGKASAN {tim}", out_ring)
missing_ring = sorted(set(missing))

print(f"Ditulis: {out_dash.name}")
print(f"Ditulis: {out_ori.name}")
print(f"Ditulis: {out_ring.name}")
for name, miss in ((out_dash.name, missing_dash), (out_ori.name, missing_ori), (out_ring.name, missing_ring)):
    if miss:
        print(f"  ! {name} belum lengkap: {', '.join(miss)}")
