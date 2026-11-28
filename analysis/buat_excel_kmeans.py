"""Membuat workbook Excel berisi seluruh langkah K-Means dengan RUMUS AKTIF (bisa diperiksa sel per sel).

Isi: data mentah -> z-score -> centroid awal (k-means++, contoh satu percobaan) -> iterasi 1-4 -> hasil akhir.
Angka masukan diambil dari data/processed (sama dengan dashboard). Semua hitungan lain berupa rumus Excel.

Pemakaian (dari folder analysis/):
    uv run --with openpyxl python buat_excel_kmeans.py
Hasil: ../berkas/Iterasi_KMeans_Paradoks_Mesuji.xlsx (buka di Excel; rumus dihitung saat dibuka)
"""

import json

import numpy as np
import pandas as pd
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

from common import CROSS_VARS, PROCESSED, RAW, ROOT

OUT = ROOT / "berkas" / "Iterasi_KMeans_Paradoks_Mesuji.xlsx"
N_ITER = 4
SEED_CONTOH = 2  # percobaan contoh yang dijelaskan (berakhir di hasil terbaik, sama dengan dashboard)

# ---------------------------------------------------------------- data masukan
reg = pd.read_csv(PROCESSED / "regions.csv", dtype={"kode": str})
pdrb = pd.read_csv(RAW / "bps_pdrb-adhb-sektor_kabkota_2025_milyar-rp.csv", dtype={"kode_wilayah": str})
pdrb = pdrb.rename(columns={"kode_wilayah": "kode"}).set_index("kode")
reg = reg.join(pdrb[["primer", "pdrb_total"]], on="kode")
# % PDRB primer di pipeline = kolom pct_primer pada CSV (2 desimal) = ROUND(primer/total*100; 2)
assert np.allclose((reg["primer"] / reg["pdrb_total"] * 100).round(2), reg["pctPdrbPrimer"]), "pct primer tidak cocok"
n = len(reg)
assert n == 15

# Angka acak percobaan contoh (numpy RandomState(SEED_CONTOH)), dipakai k-means++ di scikit-learn
rs_vals = np.random.RandomState(SEED_CONTOH).uniform(size=7)
u1, u_step2, u_step3 = rs_vals[0], rs_vals[1:4], rs_vals[4:7]

clusters = json.loads((ROOT / "web" / "public" / "data" / "clusters.json").read_text(encoding="utf-8"))
dash_cluster = {k: c["id"] for c in clusters for k in c["anggota"]}
nama_cluster = {c["id"]: c["nama"] for c in clusters}
evaluasi = json.loads((ROOT / "web" / "public" / "data" / "meta.json").read_text(encoding="utf-8"))["metode"]["evaluasiK"]

# ---------------------------------------------------------------- gaya
FONT = "Arial"
BLUE = "0000FF"
F_BASE = Font(name=FONT, size=10)
F_IN = Font(name=FONT, size=10, color=BLUE)
F_BOLD = Font(name=FONT, size=10, bold=True)
F_TITLE = Font(name=FONT, size=14, bold=True)
F_SUB = Font(name=FONT, size=10, italic=True, color="555555")
F_HEAD = Font(name=FONT, size=10, bold=True, color="FFFFFF")
FILL_HEAD = PatternFill("solid", fgColor="3D3C39")
FILL_SEC = PatternFill("solid", fgColor="E8E7E2")
FILL_KEY = PatternFill("solid", fgColor="FFF2CC")
CL_FILL = {1: PatternFill("solid", fgColor="D6E6FA"), 2: PatternFill("solid", fgColor="D5ECD5"),
           3: PatternFill("solid", fgColor="FCEBC7")}
THIN = Side(style="thin", color="BFBFBF")
BOX = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
WRAP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)

VAR_LABEL = {
    "rls": "RLS", "hls": "HLS", "pctMiskin": "% miskin", "pengeluaran": "Pengeluaran",
    "pctPdrbPrimer": "% PDRB primer", "sekolahPer100rb": "Sekolah/100 rb", "sekolahPer100km2": "Sekolah/100 km²",
    "kepadatan": "ln kepadatan",
}
ZCOLS = [get_column_letter(3 + i) for i in range(8)]  # C..J di sheet Z-Score
Z_FIRST, Z_LAST = 4, 18  # baris data di sheet Z-Score / Data Mentah
NAMES = f"'Z-Score'!$B${Z_FIRST}:$B${Z_LAST}"
ZMAT = f"'Z-Score'!$C${Z_FIRST}:$J${Z_LAST}"

wb = Workbook()


def put(ws, ref, value, font=F_BASE, fmt=None, fill=None, border=True, align=None):
    c = ws[ref]
    c.value = value
    c.font = font
    if fmt:
        c.number_format = fmt
    if fill:
        c.fill = fill
    if border:
        c.border = BOX
    if align:
        c.alignment = align
    return c


def header(ws, row, col, labels):
    for i, lab in enumerate(labels):
        put(ws, f"{get_column_letter(col + i)}{row}", lab, F_HEAD, fill=FILL_HEAD, align=CENTER)


def title(ws, text, sub):
    put(ws, "A1", text, F_TITLE, border=False)
    put(ws, "A2", sub, F_SUB, border=False)


def widths(ws, spec):
    for col, w in spec.items():
        ws.column_dimensions[col].width = w


# ================================================================ 1. Petunjuk
ws = wb.active
ws.title = "Petunjuk"
title(ws, "Iterasi K-Means — Paradoks Mesuji", "Tim KomitPNL · Politeknik Negeri Lhokseumawe · data BPS 2025, 15 kab/kota Lampung")
rows = [
    ("Isi workbook", ""),
    ("1. Data Mentah", "15 kab/kota × 8 variabel. Tiga rasio dihitung dengan rumus; kepadatan diubah ke ln."),
    ("2. Z-Score", "Standarisasi: z = (nilai − rata-rata) ÷ simpangan baku populasi (STDEVP)."),
    ("3. Centroid Awal", "Tahap 3: k-means++ — undian berbobot jarak² untuk memilih 3 centroid awal (contoh satu percobaan)."),
    ("4. Iterasi 1–4", "Tahap 4: jarak Euclidean ke tiap centroid → masuk ke yang terdekat → centroid digeser ke rata-rata anggota."),
    ("5. Hasil Akhir", "Pembagian akhir 3 cluster, dibandingkan dengan dashboard, dan centroid dalam satuan asli."),
    ("6. Evaluasi", "Skor siluet k = 3, 4, 5 dan hasil 50 percobaan (dihitung dengan Python)."),
    ("", ""),
    ("Cara membaca", ""),
    ("Teks biru", "Angka masukan (data BPS atau angka acak). Semua angka hitam adalah RUMUS."),
    ("Sel kuning", "Bisa diubah: pilih kab/kota di bagian 'Contoh hitung jarak' tiap sheet iterasi."),
    ("Rumus jarak", "Jarak = √Σ(z − centroid)², di Excel: =SQRT(SUMXMY2(baris z; baris centroid))."),
    ("Inertia", "Jumlah jarak² setiap kab/kota ke centroid cluster-nya. Makin kecil makin rapat."),
    ("", ""),
    ("Catatan", ""),
    ("Percobaan contoh", f"Centroid awal mengikuti satu percobaan k-means++ (numpy seed {SEED_CONTOH}) yang berakhir di hasil "
                         "yang sama persis dengan dashboard. Program proyek menjalankan 50 percobaan (random_state = 42) "
                         "dan memilih inertia terkecil; hasil akhirnya identik."),
    ("Nomor cluster", "Centroid diberi nomor sesuai dashboard: C1 = Way Kanan (A), C2 = Lampung Timur (C), "
                      "C3 = Bandar Lampung (B)."),
    ("Jika data diubah", "Rumus akan menghitung ulang; bila setelah Iterasi 4 masih ada yang pindah, iterasi perlu ditambah."),
    ("Sumber", "Data mentah: BPS & BPS Provinsi Lampung (lihat sheet Data Mentah). Kode: analysis/02_analysis.py."),
]
for i, (a, b) in enumerate(rows, start=4):
    put(ws, f"A{i}", a, F_BOLD if b == "" or a.startswith(("1", "2", "3", "4", "5", "6")) else F_BASE, border=False)
    put(ws, f"B{i}", b, F_BASE, border=False, align=WRAP)
    if b == "" and a:
        ws[f"A{i}"].fill = FILL_SEC
        ws[f"B{i}"].fill = FILL_SEC
put(ws, "A13", "Teks biru", F_IN, border=False)
put(ws, "A14", "Sel kuning", F_BASE, fill=FILL_KEY, border=False)
widths(ws, {"A": 20, "B": 110})

# ================================================================ 2. Data Mentah
ws = wb.create_sheet("Data Mentah")
title(ws, "Tahap 0–1 · Data mentah 2025", "Teks biru = data BPS apa adanya. Kolom O–R = rumus (rasio dan ln kepadatan).")
header(ws, 3, 1, ["No", "Kode BPS", "Kab/kota", "RLS (tahun)", "HLS (tahun)", "% miskin", "Pengeluaran (ribu Rp/th)",
                  "PDRB primer (miliar Rp)", "PDRB total (miliar Rp)", "Jumlah SMA", "Jumlah SMK", "Penduduk (jiwa)",
                  "Luas (km², dari peta)", "Kepadatan (jiwa/km²)", "% PDRB primer", "SMA+SMK /100 rb pddk",
                  "SMA+SMK /100 km²", "ln kepadatan"])
for i, r in enumerate(reg.itertuples(), start=Z_FIRST):
    put(ws, f"A{i}", i - Z_FIRST + 1, align=CENTER)
    put(ws, f"B{i}", r.kode, F_IN)
    put(ws, f"C{i}", r.nama, F_IN)
    put(ws, f"D{i}", r.rls, F_IN, "0.00")
    put(ws, f"E{i}", r.hls, F_IN, "0.00")
    put(ws, f"F{i}", r.pctMiskin, F_IN, "0.00")
    put(ws, f"G{i}", r.pengeluaran, F_IN, "#,##0")
    put(ws, f"H{i}", r.primer, F_IN, "#,##0.00")
    put(ws, f"I{i}", r.pdrb_total, F_IN, "#,##0.00")
    put(ws, f"J{i}", int(r.sma), F_IN, "0")
    put(ws, f"K{i}", int(r.smk), F_IN, "0")
    put(ws, f"L{i}", int(r.penduduk), F_IN, "#,##0")
    put(ws, f"M{i}", r.luasKm2, F_IN, "#,##0.0")
    put(ws, f"N{i}", r.kepadatan, F_IN, "#,##0")
    put(ws, f"O{i}", f"=ROUND(H{i}/I{i}*100,2)", fmt="0.00")
    put(ws, f"P{i}", f"=(J{i}+K{i})/L{i}*100000", fmt="0.00")
    put(ws, f"Q{i}", f"=(J{i}+K{i})/M{i}*100", fmt="0.00")
    put(ws, f"R{i}", f"=LN(N{i})", fmt="0.000")
notes = [
    "Sumber: RLS, HLS, % miskin, pengeluaran, PDRB — BPS (tabel kab/kota). SMA/SMK, penduduk, kepadatan — BPS Provinsi Lampung 2025.",
    "Luas wilayah dihitung dari peta geoBoundaries (proyeksi equal-area EPSG:6933), bukan angka luas resmi.",
    "% PDRB primer = ROUND(primer ÷ total × 100; 2), sama dengan kolom pct_primer di berkas mentah yang dipakai program.",
    "Variabel clustering (8): D, E, F, G, O, P, Q, R. Kepadatan memakai ln karena rentangnya sangat lebar (59 s.d. 6.673).",
]
for j, t in enumerate(notes, start=Z_LAST + 2):
    put(ws, f"A{j}", t, F_SUB, border=False)
widths(ws, {"A": 5, "B": 9, "C": 21, **{c: 12 for c in "DEFGHIJKLMNOPQR"}})
ws.row_dimensions[3].height = 42
ws.freeze_panes = "D4"

# ================================================================ 3. Z-Score
ws = wb.create_sheet("Z-Score")
title(ws, "Tahap 2 · Standarisasi z-score", "z = (nilai − rata-rata) ÷ simpangan baku populasi. Baris 20–21 = rata-rata dan simpangan baku.")
header(ws, 3, 1, ["No", "Kab/kota"] + [VAR_LABEL[v] for v in CROSS_VARS])
SRC = ["D", "E", "F", "G", "O", "P", "Q", "R"]
for i in range(Z_FIRST, Z_LAST + 1):
    put(ws, f"A{i}", i - Z_FIRST + 1, align=CENTER)
    put(ws, f"B{i}", f"='Data Mentah'!C{i}")
    for zc, sc in zip(ZCOLS, SRC):
        put(ws, f"{zc}{i}", f"=('Data Mentah'!{sc}{i}-{zc}$20)/{zc}$21", fmt="0.000")
put(ws, "B20", "Rata-rata", F_BOLD, fill=FILL_SEC)
put(ws, "B21", "Simpangan baku (populasi)", F_BOLD, fill=FILL_SEC)
for zc, sc in zip(ZCOLS, SRC):
    put(ws, f"{zc}20", f"=AVERAGE('Data Mentah'!{sc}{Z_FIRST}:{sc}{Z_LAST})", fmt="#,##0.000", fill=FILL_SEC)
    put(ws, f"{zc}21", f"=STDEVP('Data Mentah'!{sc}{Z_FIRST}:{sc}{Z_LAST})", fmt="#,##0.000", fill=FILL_SEC)
put(ws, "B23", "Simpangan baku populasi (dibagi n = 15), sama seperti StandardScaler di scikit-learn.", F_SUB, border=False)
widths(ws, {"A": 5, "B": 24, **{c: 14 for c in ZCOLS}})
ws.freeze_panes = "C4"

# ================================================================ 4. Centroid Awal (k-means++)
ws = wb.create_sheet("Centroid Awal")
title(ws, "Tahap 3 · Memilih 3 centroid awal dengan k-means++ (contoh satu percobaan)",
      "Tiket = jarak² ke centroid terdekat yang sudah terpilih. Kandidat diundi dengan peluang sebanding tiket; "
      "dari 3 kandidat dipilih yang membuat total tiket paling kecil.")

put(ws, "A4", "Langkah 1 — centroid pertama: undian dengan peluang sama (1/15)", F_BOLD, fill=FILL_SEC, border=False)
put(ws, "B5", "Angka acak u")
put(ws, "C5", float(u1), F_IN, "0.0000")
ws["C5"].comment = Comment(f"Angka acak pertama dari numpy RandomState({SEED_CONTOH}), dipakai scikit-learn untuk k-means++.", "KomitPNL")
put(ws, "B6", "Urutan terpilih = INT(u × 15) + 1")
put(ws, "C6", "=INT(C5*15)+1", fmt="0")
put(ws, "B7", "Centroid A")
put(ws, "C7", f"=INDEX({NAMES},C6)", F_BOLD, fill=FILL_KEY)


def kpp_block(top, step, tiket_formula, prev_choice_note):
    """Satu langkah k-means++: tabel tiket (baris top+2 .. top+16), kandidat di K..P."""
    put(ws, f"A{top}", f"Langkah {step} — {prev_choice_note}", F_BOLD, fill=FILL_SEC, border=False)
    h = top + 1
    header(ws, h, 1, ["No", "Kab/kota", "Tiket (jarak² ke centroid terdekat)", "Batas bawah", "Batas atas", "Peluang",
                      "Total jika kandidat 1", "Total jika kandidat 2", "Total jika kandidat 3"])
    first, last = h + 1, h + 15
    for k, i in enumerate(range(first, last + 1)):
        zr = Z_FIRST + k
        put(ws, f"A{i}", k + 1, align=CENTER)
        put(ws, f"B{i}", f"='Z-Score'!B{zr}")
        put(ws, f"C{i}", tiket_formula(zr, i), fmt="0.000")
        put(ws, f"D{i}", "=0" if k == 0 else f"=E{i - 1}", fmt="0.000")
        put(ws, f"E{i}", f"=D{i}+C{i}", fmt="0.000")
        put(ws, f"F{i}", f"=C{i}/$C${last + 1}", fmt="0.0%")
        for col, cand_row in zip("GHI", (first, first + 1, first + 2)):
            put(ws, f"{col}{i}", f"=MIN($C{i},SUMXMY2('Z-Score'!$C{zr}:$J{zr},INDEX({ZMAT},$N${cand_row},0)))", fmt="0.000")
    tot = last + 1
    put(ws, f"B{tot}", "Total", F_BOLD, fill=FILL_SEC)
    for col in "CGHI":
        put(ws, f"{col}{tot}", f"=SUM({col}{first}:{col}{last})", F_BOLD, "0.000", fill=FILL_SEC)
    put(ws, f"F{tot}", f"=SUM(F{first}:F{last})", F_BOLD, "0.0%", fill=FILL_SEC)
    # kandidat
    header(ws, h, 11, ["Kandidat", "Angka acak u", "u × total tiket", "Urutan (jatuh di)", "Kab/kota", "Total tiket jika dipilih"])
    u_vals = u_step2 if step == 2 else u_step3
    for j in range(3):
        r = first + j
        put(ws, f"K{r}", j + 1, align=CENTER)
        put(ws, f"L{r}", float(u_vals[j]), F_IN, "0.0000")
        put(ws, f"M{r}", f"=L{r}*$C${tot}", fmt="0.000")
        put(ws, f"N{r}", f"=MATCH(M{r},$D${first}:$D${last},1)", fmt="0")
        put(ws, f"O{r}", f"=INDEX({NAMES},N{r})")
        put(ws, f"P{r}", f"={'GHI'[j]}{tot}", fmt="0.000")
    ws[f"L{first}"].comment = Comment(
        f"Angka acak lanjutan dari numpy RandomState({SEED_CONTOH}). Undian: kab/kota yang rentang "
        "[batas bawah, batas atas) memuat u × total tiket.", "KomitPNL")
    pick = first + 4
    put(ws, f"K{pick}", "Terpilih", F_BOLD, fill=FILL_KEY)
    put(ws, f"L{pick}", "(total terkecil)", fill=FILL_KEY)
    put(ws, f"M{pick}", f"=MIN(P{first}:P{first + 2})", F_BOLD, "0.000", fill=FILL_KEY)
    put(ws, f"N{pick}", f"=INDEX(N{first}:N{first + 2},MATCH(M{pick},P{first}:P{first + 2},0))", F_BOLD, "0", fill=FILL_KEY)
    put(ws, f"O{pick}", f"=INDEX({NAMES},N{pick})", F_BOLD, fill=FILL_KEY)
    return first, last, tot, pick


# Langkah 2: tiket = jarak² ke centroid A
s2_first, s2_last, s2_tot, s2_pick = kpp_block(
    9, 2, lambda zr, i: f"=SUMXMY2('Z-Score'!$C{zr}:$J{zr},INDEX({ZMAT},$C$6,0))",
    "centroid kedua: undian berbobot jarak² ke centroid A")
# Langkah 3: tiket = jarak² ke centroid terdekat (A atau B)
s3_first, s3_last, s3_tot, s3_pick = kpp_block(
    30, 3, lambda zr, i: f"=MIN(C{i - 21},SUMXMY2('Z-Score'!$C{zr}:$J{zr},INDEX({ZMAT},$N${s2_pick},0)))",
    "centroid ketiga: undian berbobot jarak² ke centroid terdekat (A atau B)")

res = s3_tot + 3
put(ws, f"A{res}", "Hasil Tahap 3 — dinomori sesuai dashboard", F_BOLD, fill=FILL_SEC, border=False)
header(ws, res + 1, 2, ["Centroid", "Urutan", "Kab/kota", "Asal"])
CA_ROWS = {}
for j, (lab, ref, asal) in enumerate([("C1", "$C$6", "A (langkah 1)"), ("C2", f"$N${s3_pick}", "C (langkah 3)"),
                                      ("C3", f"$N${s2_pick}", "B (langkah 2)")]):
    r = res + 2 + j
    put(ws, f"B{r}", lab, F_BOLD, fill=CL_FILL[j + 1])
    put(ws, f"C{r}", f"={ref}", fmt="0")
    put(ws, f"D{r}", f"=INDEX({NAMES},C{r})", F_BOLD)
    put(ws, f"E{r}", asal)
    CA_ROWS[j + 1] = r
put(ws, f"B{res + 6}", "Total tiket akhir (= inertia Iterasi 1)", F_BOLD)
put(ws, f"D{res + 6}", f"=M{s3_pick}", F_BOLD, "0.000")
widths(ws, {"A": 5, "B": 24, "C": 15, "D": 12, "E": 12, "F": 10, "G": 13, "H": 13, "I": 13, "J": 3, "K": 10,
            "L": 13, "M": 15, "N": 13, "O": 20, "P": 16})
for r in (10, 31):
    ws.row_dimensions[r].height = 42

# ================================================================ 5. Iterasi 1..N
C_ROWS = {1: 5, 2: 6, 3: 7}
D_FIRST, D_LAST = 11, 25
for it in range(1, N_ITER + 1):
    ws = wb.create_sheet(f"Iterasi {it}")
    prev = f"'Iterasi {it - 1}'"
    title(ws, f"Tahap 4 · Iterasi {it}",
          "Langkah (a): jarak setiap kab/kota ke 3 centroid → masuk ke yang terdekat. "
          + ("Centroid = 3 centroid awal dari Tahap 3." if it == 1 else
             f"Centroid = rata-rata z-score anggota tiap cluster pada Iterasi {it - 1} (langkah b)."))
    header(ws, 4, 1, ["Centroid", "Asal"] + [VAR_LABEL[v] for v in CROSS_VARS] + ["Jumlah anggota"])
    for c, r in C_ROWS.items():
        put(ws, f"A{r}", c, F_BOLD, fill=CL_FILL[c], align=CENTER)
        if it == 1:
            put(ws, f"B{r}", f"=\"Centroid awal: \"&'Centroid Awal'!D{CA_ROWS[c]}")
            for k, zc in enumerate(ZCOLS, start=1):
                put(ws, f"{zc}{r}", f"=INDEX({ZMAT},'Centroid Awal'!$C${CA_ROWS[c]},{k})", fmt="0.000")
            put(ws, f"K{r}", "-", align=CENTER)
        else:
            put(ws, f"B{r}", f"Rata-rata anggota Iterasi {it - 1}")
            for zc in ZCOLS:
                put(ws, f"{zc}{r}",
                    f"=AVERAGEIF({prev}!$F${D_FIRST}:$F${D_LAST},$A{r},'Z-Score'!{zc}${Z_FIRST}:{zc}${Z_LAST})",
                    fmt="0.000")
            put(ws, f"K{r}", f"=COUNTIF({prev}!$F${D_FIRST}:$F${D_LAST},$A{r})", fmt="0", align=CENTER)
    put(ws, "A9", "Jarak Euclidean = SQRT(SUMXMY2(baris z-score; baris centroid))", F_BOLD, fill=FILL_SEC, border=False)
    header(ws, 10, 1, ["No", "Kab/kota", "Jarak ke C1", "Jarak ke C2", "Jarak ke C3", "Masuk cluster",
                       "Jarak ke centroid sendiri", "Jarak²", "Cluster iterasi sebelumnya", "Status"])
    for k, i in enumerate(range(D_FIRST, D_LAST + 1)):
        zr = Z_FIRST + k
        put(ws, f"A{i}", k + 1, align=CENTER)
        put(ws, f"B{i}", f"='Z-Score'!B{zr}")
        for col, cr in zip("CDE", (5, 6, 7)):
            put(ws, f"{col}{i}", f"=SQRT(SUMXMY2('Z-Score'!$C{zr}:$J{zr},$C${cr}:$J${cr}))", fmt="0.000")
        put(ws, f"F{i}", f"=MATCH(MIN(C{i}:E{i}),C{i}:E{i},0)", F_BOLD, "0", align=CENTER)
        put(ws, f"G{i}", f"=MIN(C{i}:E{i})", fmt="0.000")
        put(ws, f"H{i}", f"=G{i}^2", fmt="0.000")
        if it == 1:
            put(ws, f"I{i}", "-", align=CENTER)
            put(ws, f"J{i}", "Pembagian pertama")
        else:
            put(ws, f"I{i}", f"={prev}!F{i}", fmt="0", align=CENTER)
            put(ws, f"J{i}", f"=IF(F{i}<>I{i},\"Pindah\",\"Tetap\")")
    put(ws, "G26", "Inertia (Σ jarak²)", F_BOLD, fill=FILL_KEY)
    put(ws, "H26", f"=SUM(H{D_FIRST}:H{D_LAST})", F_BOLD, "0.000", fill=FILL_KEY)
    put(ws, "B28", "Jumlah kab/kota yang pindah cluster", F_BOLD)
    put(ws, "B29", "Status iterasi", F_BOLD)
    if it == 1:
        put(ws, "E28", "-", align=CENTER)
        put(ws, "E29", "Pembagian pertama dari centroid awal")
    else:
        put(ws, "E28", f"=COUNTIF(J{D_FIRST}:J{D_LAST},\"Pindah\")", F_BOLD, "0", align=CENTER)
        put(ws, "E29", f"=IF(E28=0,\"KONVERGEN: tidak ada yang pindah, iterasi selesai\","
                       f"\"Belum konvergen: centroid digeser lagi di iterasi berikutnya\")", F_BOLD)

    # contoh hitung jarak per variabel
    put(ws, "A32", "Contoh hitung jarak per variabel (pilih kab/kota di sel kuning)", F_BOLD, fill=FILL_SEC, border=False)
    put(ws, "B33", "Kab/kota")
    put(ws, "C33", "Mesuji", F_IN, fill=FILL_KEY)
    dv = DataValidation(type="list", formula1=f"={NAMES}", allow_blank=False)
    ws.add_data_validation(dv)
    dv.add("C33")
    put(ws, "B34", "Urutan")
    put(ws, "C34", f"=MATCH(C33,{NAMES},0)", fmt="0")
    header(ws, 36, 1, ["Variabel", "z kab/kota", "Centroid C1", "(z − C1)²", "Centroid C2", "(z − C2)²",
                       "Centroid C3", "(z − C3)²"])
    for k, v in enumerate(CROSS_VARS, start=1):
        r = 36 + k
        put(ws, f"A{r}", VAR_LABEL[v])
        put(ws, f"B{r}", f"=INDEX({ZMAT},$C$34,{k})", fmt="0.000")
        for ccol, scol, crow in (("C", "D", 5), ("E", "F", 6), ("G", "H", 7)):
            put(ws, f"{ccol}{r}", f"=INDEX($C${crow}:$J${crow},1,{k})", fmt="0.000")
            put(ws, f"{scol}{r}", f"=(B{r}-{ccol}{r})^2", fmt="0.000")
    put(ws, "A45", "Jumlah", F_BOLD, fill=FILL_SEC)
    put(ws, "A46", "Jarak = √jumlah", F_BOLD, fill=FILL_KEY)
    for scol in "DFH":
        put(ws, f"{scol}45", f"=SUM({scol}37:{scol}44)", F_BOLD, "0.000", fill=FILL_SEC)
        put(ws, f"{scol}46", f"=SQRT({scol}45)", F_BOLD, "0.000", fill=FILL_KEY)
    widths(ws, {"A": 16, "B": 30, **{c: 13 for c in "CDEFGHIJ"}, "K": 12})
    ws.row_dimensions[4].height = 30
    ws.row_dimensions[10].height = 42
    ws.freeze_panes = "C11"

# ================================================================ 6. Hasil Akhir
ws = wb.create_sheet("Hasil Akhir")
last_it = f"'Iterasi {N_ITER}'"
title(ws, "Hasil akhir: 3 cluster",
      f"Diambil dari Iterasi {N_ITER} (konvergen). Kolom E = pembagian di dashboard (hasil program Python) sebagai pembanding.")
header(ws, 4, 1, ["No", "Kab/kota", "Cluster (Excel)", "Nama cluster", "Cluster di dashboard", "Cocok?"])
for k, i in enumerate(range(5, 20)):
    zr = Z_FIRST + k
    put(ws, f"A{i}", k + 1, align=CENTER)
    put(ws, f"B{i}", f"='Z-Score'!B{zr}")
    put(ws, f"C{i}", f"={last_it}!F{D_FIRST + k}", F_BOLD, "0", align=CENTER)
    put(ws, f"D{i}", f"=INDEX($I$5:$I$7,C{i})")
    put(ws, f"E{i}", dash_cluster[reg.iloc[k]["kode"]], F_IN, "0", align=CENTER)
    put(ws, f"F{i}", f"=IF(C{i}=E{i},\"Ya\",\"Tidak\")", align=CENTER)
put(ws, "B21", "Semua cocok dengan dashboard?", F_BOLD, fill=FILL_KEY)
put(ws, "C21", "=IF(COUNTIF(F5:F19,\"Ya\")=15,\"Ya, 15 dari 15\",\"Tidak\")", F_BOLD, fill=FILL_KEY)
put(ws, "B22", "Inertia akhir", F_BOLD)
put(ws, "C22", f"={last_it}!H26", F_BOLD, "0.000")
header(ws, 4, 8, ["Cluster", "Nama"])
for c in (1, 2, 3):
    put(ws, f"H{4 + c}", c, F_BOLD, fill=CL_FILL[c], align=CENTER)
    put(ws, f"I{4 + c}", nama_cluster[c], F_IN)

put(ws, "A25", "Centroid akhir dalam satuan asli (rata-rata anggota)", F_BOLD, fill=FILL_SEC, border=False)
header(ws, 26, 1, ["Cluster", "Jumlah anggota", "RLS (tahun)", "HLS (tahun)", "% miskin", "Pengeluaran (ribu Rp)",
                   "% PDRB primer", "Sekolah/100 rb", "Sekolah/100 km²", "Kepadatan* (jiwa/km²)"])
fmts = ["0.00", "0.00", "0.00", "#,##0", "0.00", "0.00", "0.00"]
for c in (1, 2, 3):
    r = 26 + c
    put(ws, f"A{r}", c, F_BOLD, fill=CL_FILL[c], align=CENTER)
    put(ws, f"B{r}", f"=COUNTIF($C$5:$C$19,A{r})", fmt="0", align=CENTER)
    for col, sc, fm in zip("CDEFGHI", ["D", "E", "F", "G", "O", "P", "Q"], fmts):
        put(ws, f"{col}{r}", f"=AVERAGEIF($C$5:$C$19,$A{r},'Data Mentah'!{sc}${Z_FIRST}:{sc}${Z_LAST})", fmt=fm)
    put(ws, f"J{r}", f"=EXP(AVERAGEIF($C$5:$C$19,$A{r},'Data Mentah'!R${Z_FIRST}:R${Z_LAST}))", fmt="#,##0")
put(ws, "A31", "*Kepadatan = rata-rata geometrik = EXP(rata-rata ln kepadatan), karena clustering memakai ln kepadatan.",
    F_SUB, border=False)
widths(ws, {"A": 9, "B": 24, "C": 14, "D": 46, "E": 14, "F": 12, "G": 13, "H": 10, "I": 52, "J": 16})
ws.row_dimensions[26].height = 32

# ================================================================ 7. Evaluasi
ws = wb.create_sheet("Evaluasi")
title(ws, "Evaluasi: memilih jumlah cluster", "Angka di sheet ini hasil program Python (scikit-learn), ditulis sebagai nilai.")
header(ws, 4, 1, ["Jumlah cluster (k)", "Skor siluet", "Kesesuaian dengan Ward (ARI)", "Inertia terbaik (50 percobaan)",
                  "Dipilih?"])
for j, e in enumerate(evaluasi):
    r = 5 + j
    put(ws, f"A{r}", e["k"], F_IN, "0", align=CENTER)
    put(ws, f"B{r}", e["silhouette"], F_IN, "0.000")
    put(ws, f"C{r}", e["ariWard"], F_IN, "0.00")
    put(ws, f"D{r}", e["inertia"], F_IN, "0.00")
    put(ws, f"E{r}", f"=IF(B{r}=MAX($B$5:$B$7),\"Ya\",\"\")", align=CENTER)
put(ws, "A9", "Aturan pemilihan (ditetapkan sebelum melihat hasil): siluet tertinggi; bila selisih ≤ 0,01, pilih yang "
              "paling sejalan dengan Ward. Hasil: k = 3.", F_SUB, border=False)
put(ws, "A10", "Inertia tidak dipakai untuk memilih k, karena selalu turun bila cluster ditambah.", F_SUB, border=False)

put(ws, "A12", "Hasil 50 percobaan k-means++ (k = 3), satu percobaan per seed 0–49", F_BOLD, fill=FILL_SEC, border=False)
from sklearn.cluster import KMeans  # noqa: E402

import importlib  # noqa: E402

m = importlib.import_module("02_analysis")
_, regions_df = m.load()
_, z = m.feature_matrix(regions_df)
inert = [round(float(KMeans(3, n_init=1, random_state=s).fit(z).inertia_), 2) for s in range(50)]
vals, counts = np.unique(inert, return_counts=True)
header(ws, 13, 1, ["Inertia akhir", "Jumlah percobaan", "Keterangan"])
for j, (v, c) in enumerate(zip(vals, counts)):
    r = 14 + j
    put(ws, f"A{r}", float(v), F_IN, "0.00")
    put(ws, f"B{r}", int(c), F_IN, "0", align=CENTER)
    put(ws, f"C{r}", f"=IF(A{r}=MIN($A$14:$A${13 + len(vals)}),\"Terbaik (dipakai)\",\"\")")
tr = 14 + len(vals)
put(ws, f"A{tr}", "Total", F_BOLD, fill=FILL_SEC)
put(ws, f"B{tr}", f"=SUM(B14:B{tr - 1})", F_BOLD, "0", fill=FILL_SEC, align=CENTER)
put(ws, f"A{tr + 2}", "Percobaan dengan titik awal berbeda bisa berakhir di hasil berbeda; karena itu program "
                      "mengulang 50 kali dan memakai inertia terkecil.", F_SUB, border=False)
widths(ws, {"A": 18, "B": 16, "C": 26, "D": 26, "E": 10})
ws.row_dimensions[4].height = 30

# urutan sheet & simpan
OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print("Ditulis:", OUT)
print("Python pembanding — inertia percobaan contoh: 53.42, 36.36, 33.39, 32.45")
