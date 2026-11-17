"""Tahap 3: tulis file data untuk situs ke web/public/data/.

Keluaran (kontrak di web/src/lib/types.ts):
  panel.json, regions.json, correlations.json, clusters.json, disparity.json,
  insights.json, meta.json  + panel.csv (unduhan) + lampung_kabkota.geojson (peta)

Semua angka di teks insight diambil dari hasil olahan, bukan diketik manual.
"""

import json
import shutil

import pandas as pd

from common import (
    CROSS_VARS, CROSS_YEAR, GEO, KABKOTA, MESUJI, NAMA, PANEL_VARS, PROCESSED, PROV, WEB_DATA,
)

TANGGAL_AKSES = "2026-11-16"
KOTA = {"1871", "1872"}


# ---------- util format angka gaya Indonesia ----------
def f(x: float, d: int = 2) -> str:
    s = f"{x:,.{d}f}"
    return s.replace(",", "_").replace(".", ",").replace("_", ".").replace("-", "−")


def rp_juta(ribu_rp: float) -> str:
    return f"Rp{f(ribu_rp / 1000, 2)} juta"


def daftar(names: list[str]) -> str:
    if len(names) <= 2:
        return " dan ".join(names)
    return ", ".join(names[:-1]) + ", dan " + names[-1]


def pv(p: float) -> str:
    """p-value untuk teks: 'p = 0,04' atau 'p < 0,001'."""
    return "p < 0,001" if p < 0.001 else f"p = {f(p, 3 if p < 0.1 else 2)}"


def dump(name: str, obj) -> None:
    text = json.dumps(obj, ensure_ascii=False, indent=1, allow_nan=False)
    (WEB_DATA / name).write_text(text + "\n", encoding="utf-8", newline="\n")


def none_if_nan(v):
    return None if pd.isna(v) else float(v)


# ---------- muat hasil tahap 1-2 ----------
panel = pd.read_csv(PROCESSED / "panel.csv", dtype={"kode": str})
regions = pd.read_csv(PROCESSED / "regions.csv", dtype={"kode": str}).set_index("kode", drop=False)
an = json.loads((PROCESSED / "analysis.json").read_text(encoding="utf-8"))

kab = panel[panel["kode"] != PROV]
cl = an["clustering"]
corr = an["correlations"]
corr_kab = an["correlationsKabupaten"]
disp = pd.DataFrame(an["disparity"])
hist = pd.DataFrame(an["mesujiRankHistory"])


def val(kode: str, tahun: int, var: str) -> float:
    return float(panel[(panel["kode"] == kode) & (panel["tahun"] == tahun)][var].iloc[0])


def rho(a: str, b: str, src=corr) -> tuple[float, float]:
    i, j = src["vars"].index(a), src["vars"].index(b)
    return src["rho"][i][j], src["p"][i][j]


def ekstrem(var: str, tahun: int):
    g = kab[kab["tahun"] == tahun].dropna(subset=[var])
    lo, hi = g.loc[g[var].idxmin()], g.loc[g[var].idxmax()]
    return lo, hi


def cv(ind: str, tahun: int) -> float:
    return float(disp[(disp["indikator"] == ind) & (disp["tahun"] == tahun)]["cv"].iloc[0])


def selisih(ind: str, tahun: int) -> float:
    return float(disp[(disp["indikator"] == ind) & (disp["tahun"] == tahun)]["selisih"].iloc[0])


def sig(p: float) -> str:
    return "signifikan" if p < 0.05 else "tidak signifikan"


# ---------- validasi asumsi penamaan cluster ----------
anggota = {int(k): v for k, v in cl["anggota"].items()}
profil = {int(k): v for k, v in cl["profil"].items()}
if cl["k"] != 3:
    raise SystemExit("Jumlah cluster berubah dari 3: tinjau ulang nama & rekomendasi di 03_export_web.py")
if MESUJI not in anggota[1] or set(anggota[3]) != KOTA:
    raise SystemExit("Susunan cluster berubah: tinjau ulang nama & rekomendasi di 03_export_web.py")
if max(profil, key=lambda c: profil[c]["pctMiskin"]) != 2:
    raise SystemExit("Cluster 2 bukan lagi yang termiskin: tinjau ulang nama & rekomendasi")


def cmean(cid: int, var: str) -> float:
    return float(regions.loc[anggota[cid], var].mean())


def cnames(cid: int) -> list[str]:
    return [NAMA[k] for k in anggota[cid]]


Y = CROSS_YEAR
Y0 = int(panel["tahun"].min())
Y1 = int(panel["tahun"].max())
m = regions.loc[MESUJI]
rk = an["ranks"][MESUJI]
prov = {v: val(PROV, Y, v) for v in PANEL_VARS}

rls_lo, rls_hi = ekstrem("rls", Y)
hls_lo, hls_hi = ekstrem("hls", Y)
r_miskin_rls, p_miskin_rls = rho("pctMiskin", "rls")
r_miskin_hls, p_miskin_hls = rho("pctMiskin", "hls")
r_km2_hls, p_km2_hls = rho("sekolahPer100km2", "hls")
r_pad_hls, p_pad_hls = rho("kepadatan", "hls")
r_rb_hls, p_rb_hls = rho("sekolahPer100rb", "hls")
r_prim_hls, p_prim_hls = rho("pctPdrbPrimer", "hls")
r_peng_hls, p_peng_hls = rho("pengeluaran", "hls")
rk_km2_hls, pk_km2_hls = rho("sekolahPer100km2", "hls", corr_kab)
rk_pad_hls, pk_pad_hls = rho("kepadatan", "hls", corr_kab)
rk_pad_rls, pk_pad_rls = rho("kepadatan", "rls", corr_kab)
rk_miskin_rls, pk_miskin_rls = rho("pctMiskin", "rls", corr_kab)
rk_prim_hls, pk_prim_hls = rho("pctPdrbPrimer", "hls", corr_kab)

th_rls1 = hist[hist["rls"] == 1]["tahun"]
th_hls1 = hist[hist["hls"] == 1]["tahun"]
th_miskin1 = hist[hist["pctMiskin"] == 1]["tahun"]
hist_m = hist.dropna(subset=["pctMiskin"])
peng_ranks = sorted(set(int(x) for x in hist_m["pengeluaran"]))
n_peng_le2 = int((hist_m["pengeluaran"] <= 2).sum())

# ---------- klaim kata-kata di teks harus benar menurut data ----------
assert rls_lo["kode"] == MESUJI and hls_lo["kode"] == MESUJI
assert all(rk[v] == 1 for v in ("pctMiskin", "rls", "hls", "ipm")), "Mesuji bukan lagi terendah"
assert len(th_miskin1) == len(hist_m), "Mesuji tidak selalu terendah di % miskin"
assert cmean(1, "pctMiskin") < cmean(2, "pctMiskin")
assert all(cmean(1, v) == min(cmean(c, v) for c in anggota) for v in ("rls", "hls"))
assert cmean(2, "sekolahPer100rb") == min(cmean(c, "sekolahPer100rb") for c in anggota)
assert cmean(1, "sekolahPer100rb") > cmean(2, "sekolahPer100rb")
assert cmean(2, "hls") < prov["hls"]
assert all(cmean(3, v) == max(cmean(c, v) for c in anggota) for v in ("rls", "hls", "sekolahPer100km2"))
# Kelompok inti: selalu sekelompok dengan Mesuji di semua solusi yang diuji (02_analysis.py)
inti = cl["intiMesuji"]
assert MESUJI in inti and len(inti) >= 2 and set(inti) <= set(anggota[1])
inti_lain = [k for k in inti if k != MESUJI]
# Anggota tipe 1 yang RLS dan HLS-nya justru di atas provinsi ditulis sebagai pengecualian
pengecualian = [
    k for k in anggota[1] if regions.loc[k, "rls"] > prov["rls"] and regions.loc[k, "hls"] > prov["hls"]
]
assert not set(pengecualian) & set(inti)
# "sebagian besar berpenduduk jarang": lebih dari separuh anggota di bawah median kepadatan 15 kab/kota
jarang = [k for k in anggota[1] if regions.loc[k, "kepadatan"] < regions["kepadatan"].median()]
assert len(jarang) > len(anggota[1]) / 2
sil_k = next(e for e in cl["evaluasi"] if e["k"] == cl["k"])
assert p_miskin_hls >= 0.05 and p_miskin_rls >= 0.05 and p_rb_hls >= 0.05
assert max(p_km2_hls, p_pad_hls, pk_km2_hls, pk_pad_hls) < 0.05 and pk_pad_rls >= 0.05
assert cv("rls", Y1) < cv("rls", Y0)
assert abs(cv("hls", Y1) - cv("hls", Y0)) < 1  # "kesenjangan HLS nyaris tidak bergerak"

# ---------- insights ----------
insights = [
    {
        "id": "I1", "halaman": 1,
        "judul": f"Selisih lama sekolah antarwilayah mencapai {f(selisih('rls', Y))} tahun",
        "angka": f"{f(rls_lo['rls'])} vs {f(rls_hi['rls'])} tahun",
        "teks": (
            f"Pada {Y}, rata-rata lama sekolah (RLS) penduduk 25+ di {rls_lo['nama']} hanya {f(rls_lo['rls'])} tahun, "
            f"sedangkan di {rls_hi['nama']} {f(rls_hi['rls'])} tahun. Rata-rata provinsi {f(prov['rls'])} tahun. "
            f"Untuk harapan lama sekolah (HLS), rentangnya {f(hls_lo['hls'])} ({hls_lo['nama']}) sampai "
            f"{f(hls_hi['hls'])} tahun ({hls_hi['nama']})."
        ),
    },
    {
        "id": "I2", "halaman": 1,
        "judul": f"Mesuji terendah di RLS dan HLS setiap tahun sejak {int(th_rls1.min())}",
        "angka": f"{len(th_rls1)} dari {len(hist)} tahun",
        "teks": (
            f"Mesuji berada di peringkat terbawah RLS pada {len(th_rls1)} dari {len(hist)} tahun data "
            f"({int(th_rls1.min())}–{int(th_rls1.max())}) dan terbawah HLS pada {len(th_hls1)} tahun. "
            f"RLS Mesuji naik dari {f(val(MESUJI, Y0, 'rls'))} ({Y0}) menjadi {f(val(MESUJI, Y1, 'rls'))} tahun ({Y1}), "
            f"tetapi belum cukup untuk keluar dari posisi terakhir."
        ),
    },
    {
        "id": "I3", "halaman": 1,
        "judul": "Kesenjangan RLS menyempit, kesenjangan HLS nyaris tidak bergerak",
        "angka": f"CV RLS {f(cv('rls', Y0))}% → {f(cv('rls', Y1))}%",
        "teks": (
            f"Koefisien variasi RLS antar-15 kab/kota turun dari {f(cv('rls', Y0))}% ({Y0}) menjadi {f(cv('rls', Y1))}% ({Y1}); "
            f"selisih tertinggi–terendah turun dari {f(selisih('rls', Y0))} menjadi {f(selisih('rls', Y1))} tahun. "
            f"Untuk HLS, koefisien variasi hanya berubah dari {f(cv('hls', Y0))}% menjadi {f(cv('hls', Y1))}% dan sejak 2020 "
            f"bertahan di kisaran {f(min(cv('hls', t) for t in range(2020, Y1 + 1)))}–{f(max(cv('hls', t) for t in range(2020, Y1 + 1)))}%. "
            f"Artinya peluang sekolah generasi sekarang belum makin merata."
        ),
    },
    {
        "id": "I4", "halaman": 2,
        "judul": "Mesuji: kemiskinan terendah, pendidikan juga terendah",
        "angka": f"{f(m['pctMiskin'])}% miskin · RLS {f(m['rls'])} tahun",
        "teks": (
            f"Pada {Y}, persentase penduduk miskin Mesuji {f(m['pctMiskin'])}%, terendah dari 15 kab/kota "
            f"(provinsi {f(prov['pctMiskin'])}%). Pada tahun yang sama RLS ({f(m['rls'])} tahun), HLS ({f(m['hls'])} tahun), "
            f"dan IPM ({f(m['ipm'])}) Mesuji juga terendah. Mesuji memegang angka kemiskinan terendah pada "
            f"{len(th_miskin1)} dari {len(hist_m)} tahun data ({int(th_miskin1.min())}–{int(th_miskin1.max())})."
        ),
    },
    {
        "id": "I5", "halaman": 2,
        "judul": "Tingkat kemiskinan hampir tidak berkaitan dengan lama sekolah",
        "angka": f"ρ = {f(r_miskin_hls)} ({pv(p_miskin_hls)})",
        "teks": (
            f"Korelasi Spearman {Y} antara % penduduk miskin dan HLS hanya ρ = {f(r_miskin_hls)} ({pv(p_miskin_hls)}), "
            f"dan dengan RLS ρ = {f(r_miskin_rls)} ({pv(p_miskin_rls)}); keduanya tidak signifikan (n = 15). "
            f"Di antara 13 kabupaten saja, arahnya malah positif untuk RLS (ρ = {f(rk_miskin_rls)}, {pv(pk_miskin_rls)}): "
            f"kabupaten yang lebih miskin justru cenderung punya RLS lebih tinggi. "
            f"Angka kemiskinan saja tidak cukup untuk menentukan daerah prioritas pendidikan."
        ),
    },
    {
        "id": "I6", "halaman": 2,
        "judul": "Yang berkaitan dengan HLS adalah sebaran sekolah per luas wilayah, bukan jumlah sekolah per penduduk",
        "angka": f"ρ = {f(r_km2_hls)} vs ρ = {f(r_rb_hls)}",
        "teks": (
            f"HLS berkaitan kuat dengan jumlah SMA+SMK per 100 km² (ρ = {f(r_km2_hls)}, {pv(p_km2_hls)}) dan kepadatan penduduk "
            f"(ρ = {f(r_pad_hls)}, {pv(p_pad_hls)}), tetapi tidak dengan SMA+SMK per 100 ribu penduduk "
            f"(ρ = {f(r_rb_hls)}, {pv(p_rb_hls)}). Kaitan ini bertahan tanpa dua kota "
            f"(13 kabupaten: ρ = {f(rk_km2_hls)} dan {f(rk_pad_hls)}). "
            f"Mesuji punya {f(m['sekolahPer100rb'])} SMA+SMK per 100 ribu penduduk (peringkat {16 - rk['sekolahPer100rb']} tertinggi) "
            f"dan {f(m['smpPer100rb'])} SMP per 100 ribu penduduk (peringkat {16 - rk['smpPer100rb']} tertinggi), "
            f"tetapi hanya {f(m['sekolahPer100km2'])} SMA+SMK per 100 km² dengan kepadatan {f(m['kepadatan'], 0)} jiwa/km²."
        ),
    },
    {
        "id": "I7", "halaman": 2,
        "judul": "Kemiskinan rendah Mesuji tidak sejalan dengan daya belinya",
        "angka": f"{rp_juta(m['pengeluaran'])} per orang per tahun",
        "teks": (
            f"Pengeluaran riil per kapita Mesuji {Y} sebesar {rp_juta(m['pengeluaran'])} per tahun, terendah ke-{rk['pengeluaran']} "
            f"dari 15 kab/kota (provinsi {rp_juta(prov['pengeluaran'])}). Sepanjang {int(hist_m['tahun'].min())}–{int(hist_m['tahun'].max())}, "
            f"Mesuji selalu terendah di % miskin dan berada di dua posisi terbawah pengeluaran pada {n_peng_le2} dari {len(hist_m)} tahun. "
            f"Sedikit penduduk di bawah garis kemiskinan tidak berarti penduduknya sejahtera."
        ),
    },
    {
        "id": "I8", "halaman": 2,
        "judul": "Ekonomi primer berkaitan negatif dengan HLS, tetapi buktinya lemah",
        "angka": f"ρ = {f(r_prim_hls)} ({pv(p_prim_hls)})",
        "teks": (
            f"Makin besar porsi sektor primer dalam PDRB {Y}, HLS cenderung makin rendah (ρ = {f(r_prim_hls)}), "
            f"namun {pv(p_prim_hls)} sehingga {sig(p_prim_hls)} pada taraf 5%. Tanpa dua kota, kaitannya melemah "
            f"(ρ = {f(rk_prim_hls)}, {pv(pk_prim_hls)}). Pengeluaran riil per kapita berkaitan lebih jelas dengan HLS "
            f"(ρ = {f(r_peng_hls)}, {pv(p_peng_hls)})."
        ),
    },
    {
        "id": "I9", "halaman": 3,
        "judul": f"Mesuji tidak sendirian: {len(inti_lain)} kabupaten lain selalu sekelompok dengannya",
        "angka": f"{len(anggota[1])} kabupaten · {f(cmean(1, 'pctMiskin'))}% miskin · RLS {f(cmean(1, 'rls'))} tahun",
        "teks": (
            f"Clustering K-Means (k = {cl['k']}) menempatkan {daftar(cnames(1))} dalam satu tipe: rata-rata % miskin "
            f"{f(cmean(1, 'pctMiskin'))}% (tipe agraris {f(cmean(2, 'pctMiskin'))}%), tetapi RLS {f(cmean(1, 'rls'))} tahun dan "
            f"HLS {f(cmean(1, 'hls'))} tahun (terendah dari semua tipe), padahal SMA+SMK per 100 ribu penduduknya "
            f"{f(cmean(1, 'sekolahPer100rb'))} (tipe agraris {f(cmean(2, 'sekolahPer100rb'))}). "
            f"{daftar([NAMA[k] for k in inti])} selalu sekelompok di {cl['jumlahSolusiDiuji']} solusi yang diuji "
            f"(k = 3, 4, 5; K-Means dan Ward)."
            + "".join(
                f" {NAMA[k]} adalah pengecualian: masuk tipe ini karena kemiskinannya rendah ({f(regions.loc[k, 'pctMiskin'])}%) "
                f"dan sekolahnya banyak, tetapi RLS ({f(regions.loc[k, 'rls'])}) dan HLS ({f(regions.loc[k, 'hls'])}) di atas provinsi "
                f"dan kepadatannya {f(regions.loc[k, 'kepadatan'], 0)} jiwa/km²."
                for k in pengecualian
            )
        ),
    },
    {
        "id": "I10", "halaman": 3,
        "judul": f"{len(anggota[2])} kabupaten agraris menanggung kemiskinan tertinggi dan sekolah menengah paling sedikit per penduduk",
        "angka": f"{f(cmean(2, 'pctMiskin'))}% miskin · {f(cmean(2, 'sekolahPer100rb'))} sekolah per 100 ribu",
        "teks": (
            f"{daftar(cnames(2))} rata-rata memiliki {f(cmean(2, 'pctMiskin'))}% penduduk miskin, porsi PDRB primer "
            f"{f(cmean(2, 'pctPdrbPrimer'))}%, dan {f(cmean(2, 'sekolahPer100rb'))} SMA+SMK per 100 ribu penduduk "
            f"(terendah dari semua tipe). HLS rata-ratanya {f(cmean(2, 'hls'))} tahun, di bawah provinsi ({f(prov['hls'])})."
        ),
    },
    {
        "id": "I11", "halaman": 3,
        "judul": "Dua kota berada di kelas tersendiri",
        "angka": f"RLS {f(cmean(3, 'rls'))} · HLS {f(cmean(3, 'hls'))} tahun",
        "teks": (
            f"{daftar(cnames(3))} punya RLS rata-rata {f(cmean(3, 'rls'))} tahun dan HLS {f(cmean(3, 'hls'))} tahun, "
            f"jauh di atas provinsi ({f(prov['rls'])} dan {f(prov['hls'])}). Kerapatan sekolahnya {f(cmean(3, 'sekolahPer100km2'))} "
            f"SMA+SMK per 100 km², sedangkan dua tipe kabupaten hanya {f(cmean(1, 'sekolahPer100km2'))} dan "
            f"{f(cmean(2, 'sekolahPer100km2'))}. Porsi PDRB primernya {f(cmean(3, 'pctPdrbPrimer'))}%."
        ),
    },
]

# ---------- clusters ----------
CLUSTER_TEXT = {
    1: {
        "nama": "Miskin rendah, sekolah banyak, pendidikan tertinggal",
        "ringkasan": (
            "Kabupaten dengan angka kemiskinan rendah dan sekolah menengah yang banyak per penduduk, tetapi RLS dan HLS "
            "rata-ratanya terendah. Sebagian besar anggotanya berpenduduk jarang, sehingga sekolah berjauhan."
        ),
        "rekomendasi": [
            {
                "intervensi": "Dekatkan layanan SMA/SMK ke permukiman yang berjauhan lewat sekolah berasrama, SMP–SMA satu atap, dan bantuan transportasi siswa; jangan hanya menambah jumlah unit sekolah.",
                "sasaran": "Dinas Pendidikan dan Kebudayaan Provinsi Lampung bersama Pemkab setempat",
                "insightId": "I6",
            },
            {
                "intervensi": "Perluas pendidikan kesetaraan (Paket B dan C) bagi penduduk dewasa, karena RLS usia 25+ di tipe ini terendah.",
                "sasaran": "Dinas Pendidikan Kabupaten",
                "insightId": "I9",
            },
            {
                "intervensi": "Masukkan RLS dan HLS, bukan hanya angka kemiskinan, sebagai kriteria penentuan daerah prioritas program pendidikan.",
                "sasaran": "Bappeda Provinsi Lampung",
                "insightId": "I5",
            },
        ],
    },
    2: {
        "nama": "Agraris, miskin lebih tinggi",
        "ringkasan": (
            "Kabupaten dengan porsi ekonomi primer besar dan kemiskinan tertinggi. "
            "Sekolah menengah per penduduk paling sedikit dan HLS rata-rata di bawah provinsi."
        ),
        "rekomendasi": [
            {
                "intervensi": "Prioritaskan bantuan biaya sekolah (beasiswa daerah dan pendampingan penerima PIP) untuk jenjang SMA/SMK, karena kemiskinan di tipe ini tertinggi.",
                "sasaran": "Dinas Pendidikan dan Kebudayaan Provinsi Lampung",
                "insightId": "I10",
            },
            {
                "intervensi": "Petakan kecamatan yang jauh dari SMA/SMK sebelum membangun unit sekolah baru, agar penambahan sekolah memperbaiki sebaran, bukan sekadar jumlah.",
                "sasaran": "Bappeda dan Dinas Pendidikan Kabupaten",
                "insightId": "I6",
            },
            {
                "intervensi": "Pantau HLS tiap tahun sebagai indikator kinerja daerah, karena kesenjangan HLS antarwilayah tidak menyempit.",
                "sasaran": "Bappeda Kabupaten",
                "insightId": "I3",
            },
        ],
    },
    3: {
        "nama": "Perkotaan, pusat layanan",
        "ringkasan": "Dua kota dengan RLS, HLS, dan kerapatan sekolah tertinggi; hampir tanpa ekonomi primer.",
        "rekomendasi": [
            {
                "intervensi": "Jadikan kota sebagai pusat rujukan: sediakan kuota dan asrama bagi siswa dari dua tipe kabupaten, agar kesenjangan dengan wilayah lain menyempit.",
                "sasaran": "Dinas Pendidikan dan Kebudayaan Provinsi Lampung bersama Pemkot",
                "insightId": "I11",
            },
        ],
    },
}
insight_ids = {i["id"] for i in insights}
clusters = []
for cid in sorted(anggota):
    t = CLUSTER_TEXT[cid]
    for r in t["rekomendasi"]:
        assert r["insightId"] in insight_ids, r
    clusters.append({
        "id": cid, "nama": t["nama"], "ringkasan": t["ringkasan"],
        "anggota": anggota[cid], "profil": profil[cid], "rekomendasi": t["rekomendasi"],
    })

# ---------- panel & regions ----------
panel_rows = [
    {
        "kode": r.kode, "nama": r.nama, "tahun": int(r.tahun),
        **{v: none_if_nan(getattr(r, v)) for v in PANEL_VARS},
    }
    for r in panel.itertuples()
]

region_rows = []
for kode in KABKOTA:
    r = regions.loc[kode]
    region_rows.append({
        "kode": kode, "nama": r["nama"], "tipe": r["tipe"],
        "penduduk": int(r["penduduk"]), "kepadatan": float(r["kepadatan"]),
        "luasKm2": round(float(r["luasKm2"]), 1),
        "sekolah": {"smp": int(r["smp"]), "sma": int(r["sma"]), "smk": int(r["smk"])},
        "sekolahPer100rb": round(float(r["sekolahPer100rb"]), 2),
        "sekolahPer100km2": round(float(r["sekolahPer100km2"]), 2),
        "smpPer100rb": round(float(r["smpPer100rb"]), 2),
        "pctPdrbPrimer": float(r["pctPdrbPrimer"]),
        "clusterId": int(cl["labels"][kode]),
        "peringkat": an["ranks"][kode],
    })

# ---------- hipotesis ----------
LABEL = {
    "pctMiskin": "% penduduk miskin", "pengeluaran": "pengeluaran riil", "pctPdrbPrimer": "% PDRB primer",
    "sekolahPer100rb": "sekolah per 100 ribu penduduk", "sekolahPer100km2": "sekolah per 100 km²", "kepadatan": "kepadatan",
}
strongest_hls = max((v for v in CROSS_VARS if v not in ("hls", "rls")), key=lambda v: abs(rho(v, "hls")[0]))
hipotesis = [
    {
        "id": "H1", "pernyataan": "Kemiskinan bukan prediktor terkuat rendahnya RLS/HLS.",
        "hasil": "didukung",
        "bukti": (
            f"ρ % miskin–HLS = {f(r_miskin_hls)} ({pv(p_miskin_hls)}) dan –RLS = {f(r_miskin_rls)} ({pv(p_miskin_rls)}), "
            f"keduanya tidak signifikan. Untuk HLS, kaitan terkuat adalah {LABEL[strongest_hls]} (ρ = {f(rho(strongest_hls, 'hls')[0])}), "
            f"disusul kepadatan (ρ = {f(r_pad_hls)}) dan pengeluaran riil (ρ = {f(r_peng_hls)})."
        ),
    },
    {
        "id": "H2", "pernyataan": "Daerah dengan porsi ekonomi primer tinggi punya HLS lebih rendah.",
        "hasil": "sebagian",
        "bukti": (
            f"Arahnya sesuai (ρ = {f(r_prim_hls)}) tetapi {pv(p_prim_hls)}, {sig(p_prim_hls)} pada taraf 5%; "
            f"tanpa dua kota ρ = {f(rk_prim_hls)} ({pv(pk_prim_hls)})."
        ),
    },
    {
        "id": "H3", "pernyataan": "Yang menghambat adalah sebaran wilayah (jarak), bukan jumlah sekolah.",
        "hasil": "didukung",
        "bukti": (
            f"HLS berkaitan dengan kepadatan (ρ = {f(r_pad_hls)}) dan sekolah per 100 km² (ρ = {f(r_km2_hls)}), "
            f"tidak dengan sekolah per 100 ribu penduduk (ρ = {f(r_rb_hls)}, {pv(p_rb_hls)}). Bertahan pada 13 kabupaten "
            f"(ρ = {f(rk_pad_hls)} dan {f(rk_km2_hls)}). Catatan: untuk RLS kaitan dengan kepadatan hilang tanpa kota "
            f"(ρ = {f(rk_pad_rls)}, {pv(pk_pad_rls)}), jadi temuan ini berlaku untuk HLS."
        ),
    },
    {
        "id": "H4", "pernyataan": "Kesenjangan antar kab/kota tidak menyempit sejak 2015.",
        "hasil": "sebagian",
        "bukti": (
            f"Tidak didukung untuk RLS: koefisien variasi turun dari {f(cv('rls', Y0))}% ke {f(cv('rls', Y1))}%. "
            f"Didukung untuk HLS: {f(cv('hls', Y0))}% ke {f(cv('hls', Y1))}%, dan selisih tertinggi–terendah tetap sekitar "
            f"{f(selisih('hls', Y1))} tahun sejak 2020."
        ),
    },
    {
        "id": "H5", "pernyataan": "Angka kemiskinan Mesuji tidak sejalan dengan kesejahteraan riilnya.",
        "hasil": "didukung",
        "bukti": (
            f"{int(hist_m['tahun'].min())}–{int(hist_m['tahun'].max())}: Mesuji selalu peringkat 1 terendah % miskin, "
            f"tetapi pengeluaran riilnya berada di peringkat {' atau '.join(str(x) for x in peng_ranks)} terendah."
        ),
    },
]

# ---------- meta ----------
BPS = "https://www.bps.go.id/id/statistics-table/2/"
meta = {
    "diaksesPada": TANGGAL_AKSES,
    "dataset": {
        "periode": f"{Y0}–{Y1}",
        "jumlahWilayah": len(KABKOTA),
        "jumlahBarisPanel": len(panel_rows),
        "jumlahNilaiTerisi": int(panel[PANEL_VARS].notna().sum().sum()),
        "tahunPenampang": Y,
        "variabel": PANEL_VARS + ["pctPdrbPrimer", "sekolah (SMP, SMA, SMK)", "penduduk", "kepadatan", "luasKm2"],
    },
    "sumber": [
        {"nama": "BPS – [Metode Baru] Rata-rata Lama Sekolah", "url": BPS + "NDE1IzI=/-metode-baru--rata-rata-lama-sekolah.html",
         "variabel": ["rls"], "periode": "2015–2026", "berkas": "bps_rls_kabkota_2015-2026.csv"},
        {"nama": "BPS – [Metode Baru] Harapan Lama Sekolah", "url": BPS + "NDE3IzI=/-metode-baru--harapan-lama-sekolah--tahun-.html",
         "variabel": ["hls"], "periode": "2015–2026", "berkas": "bps_hls_kabkota_2015-2026.csv"},
        {"nama": "BPS – IPM (UHH hasil Long Form SP2020)", "url": BPS + "MjIwNSMy/-metode-baru--indeks-pembangunan-manusia--umur-harapan-hidup-hasil-long-form-sp2020-.html",
         "variabel": ["ipm"], "periode": "2020–2026", "berkas": "bps_ipm-uhh-lf-sp2020_kabkota_2020-2026.csv"},
        {"nama": "BPS – Persentase Penduduk Miskin (P0) Menurut Kabupaten/Kota", "url": BPS + "NjIxIzI=/persentase-penduduk-miskin--p0--menurut-kabupaten-kota--persen-.html",
         "variabel": ["pctMiskin"], "periode": "2015–2025", "berkas": "bps_p0-persen-miskin_kabkota_2015-2025.csv"},
        {"nama": "BPS – [Metode Baru] Pengeluaran per Kapita Disesuaikan", "url": BPS + "NDE2IzI=/-metode-baru-pengeluaran-per-kapita-disesuaikan.html",
         "variabel": ["pengeluaran"], "periode": "2015–2026", "berkas": "bps_pengeluaran-riil-per-kapita-disesuaikan_ribu-rp-tahun_kabkota_2015-2026.csv"},
        {"nama": "BPS – PDRB Triwulanan ADHB Menurut Lapangan Usaha Kab/Kota (kolom tahunan)", "url": BPS + "MjUzMyMy/pdrb-triwulanan-atas-dasar-harga-berlaku-menurut-lapangan-usaha-di-kabupaten-kota-seluruh-indonesia.html",
         "variabel": ["pctPdrbPrimer"], "periode": "2025", "berkas": "bps_pdrb-adhb-sektor_kabkota_2025_milyar-rp.csv"},
        {"nama": "BPS Provinsi Lampung – Jumlah SMP, SMA, SMK Menurut Kabupaten/Kota", "url": "https://lampung.bps.go.id/id/statistics-table/2/ODUwIzI=/jumlah-sekolah-menengah-atas--sma--di-bawah-kementerian-pendidikan--kebudayaan--riset--dan-teknologi-menurut-kabupaten-kota.html",
         "variabel": ["sekolah", "sekolahPer100rb", "sekolahPer100km2", "smpPer100rb"], "periode": "2025", "berkas": "bps_jumlah-sekolah-smp-sma-smk_kabkota_2025.csv"},
        {"nama": "BPS Provinsi Lampung – Penduduk, Laju Pertumbuhan, Distribusi, Kepadatan, dan Rasio Jenis Kelamin Menurut Kabupaten/Kota, 2025",
         "url": "https://lampung.bps.go.id/id/statistics-table/3/V1ZSbFRUY3lTbFpEYTNsVWNGcDZjek53YkhsNFFUMDkjMw==/jumlah-penduduk--laju-pertumbuhan-penduduk--distribusi-persentase-penduduk--kepadatan-penduduk--rasio-jenis-kelamin-penduduk-menurut-kabupaten-kota-di-provinsi-lampung--2025.html?year=2025",
         "variabel": ["penduduk", "kepadatan"], "periode": "2025 (proyeksi hasil SP2020)", "berkas": "bps_penduduk-kepadatan_kabkota_2025.csv"},
        {"nama": "geoBoundaries IDN ADM2 (batas kab/kota, disederhanakan)", "url": "https://github.com/wmgeolab/geoBoundaries",
         "variabel": ["luasKm2", "peta"], "periode": "—", "berkas": "lampung_kabkota.geojson"},
    ],
    "definisi": {
        "rls": "Rata-rata Lama Sekolah: rata-rata jumlah tahun pendidikan formal yang dijalani penduduk usia 25 tahun ke atas. Menggambarkan capaian generasi dewasa.",
        "hls": "Harapan Lama Sekolah: lama sekolah (tahun) yang diharapkan akan dijalani anak usia 7 tahun. Menggambarkan peluang sekolah generasi sekarang.",
        "ipm": "Indeks Pembangunan Manusia, seri umur harapan hidup hasil Long Form SP2020 (tersedia 2020–2026).",
        "pctMiskin": "Persentase penduduk miskin (P0): bagian penduduk dengan pengeluaran per kapita di bawah garis kemiskinan.",
        "pengeluaran": "Pengeluaran riil per kapita yang disesuaikan (ribu rupiah per orang per tahun), ukuran daya beli dalam IPM.",
        "pctPdrbPrimer": "Porsi sektor primer (pertanian, kehutanan, perikanan, pertambangan) dalam PDRB atas dasar harga berlaku 2025.",
        "sekolahPer100rb": "Jumlah SMA + SMK (negeri dan swasta) per 100 ribu penduduk.",
        "sekolahPer100km2": "Jumlah SMA + SMK per 100 km² luas wilayah; pendekatan untuk jarak ke sekolah.",
        "smpPer100rb": "Jumlah SMP (negeri dan swasta) per 100 ribu penduduk.",
        "penduduk": "Jumlah penduduk pertengahan tahun 2025 menurut Proyeksi Penduduk Indonesia 2020–2035 hasil Sensus Penduduk 2020 (BPS).",
        "kepadatan": "Jumlah penduduk per km² tahun 2025 menurut BPS Provinsi Lampung.",
        "luasKm2": "Luas wilayah dihitung dari poligon peta dengan proyeksi equal-area (EPSG:6933); bukan angka luas resmi.",
        "cv": "Koefisien variasi: simpangan baku antar-15 kab/kota dibagi rata-ratanya (persen). Makin besar, makin timpang.",
    },
    "metode": {
        "korelasi": f"Korelasi peringkat Spearman pada data penampang {Y} (n = 15 kab/kota), dengan p-value dua sisi. Uji ketahanan diulang pada 13 kabupaten tanpa dua kota.",
        "disparitas": "Selisih nilai tertinggi–terendah dan koefisien variasi (simpangan baku populasi ÷ rata-rata) per indikator per tahun, 15 kab/kota tanpa baris provinsi.",
        "clustering": (
            "K-Means pada 8 variabel yang distandarisasi z-score (kepadatan di-log), n_init = 50, random_state = 42. "
            "Nilai k = 3, 4, 5 dibandingkan dengan skor siluet dan kesesuaian dengan hierarchical clustering Ward (Adjusted Rand Index). "
            f"Aturan pemilihan: {cl['aturanK']}. Kestabilan diuji dengan mencari kab/kota yang selalu sekelompok "
            f"di semua {cl['jumlahSolusiDiuji']} solusi (k = 3, 4, 5; K-Means dan Ward)."
        ),
        "variabelCluster": CROSS_VARS,
        "kTerpilih": cl["k"],
        "evaluasiK": cl["evaluasi"],
        "peringkat": "Peringkat 1–15 per indikator; 1 = nilai terendah.",
    },
    "hipotesis": hipotesis,
    "korelasiKabupaten": corr_kab,
    "keterbatasan": [
        "Hanya 15 kab/kota (n = 15): hasil bersifat korelasional dan tidak membuktikan sebab-akibat. Temuan ditulis sebagai \"berkaitan dengan\".",
        "Angka Partisipasi Sekolah, jumlah guru, dan jumlah murid per kab/kota tidak dipublikasikan BPS secara daring; HLS dipakai sebagai pengganti partisipasi sekolah.",
        "Luas wilayah dihitung dari peta geoBoundaries yang disederhanakan, bukan angka resmi; rasio sekolah per 100 km² adalah pendekatan jarak, bukan ukuran jarak sebenarnya.",
        "Variabel penjelas (PDRB, jumlah sekolah, penduduk) hanya tersedia untuk satu tahun, sehingga korelasi dan clustering memakai penampang 2025 saja.",
        "Jumlah penduduk 2025 adalah angka proyeksi BPS (hasil Sensus Penduduk 2020, pertengahan tahun), bukan hasil pencacahan.",
        "Dua kota (Bandar Lampung dan Metro) sangat berbeda dari 13 kabupaten dan memengaruhi korelasi; karena itu korelasi juga dihitung tanpa keduanya.",
        (
            f"Skor siluet clustering rendah ({f(sil_k['silhouette'])}) dan K-Means hanya sebagian sejalan dengan Ward "
            f"(ARI {f(sil_k['ariWard'])}): batas antartipe tidak tegas dan susunan tipe berubah bila jumlah tipe atau metode diubah. "
            f"Yang konsisten di semua solusi adalah kelompok inti {daftar([NAMA[k] for k in inti])}. "
            "Tipologi dipakai sebagai alat bantu membaca pola, bukan klasifikasi mutlak."
        ),
        "IPM seri baru hanya tersedia sejak 2020; persentase penduduk miskin belum tersedia untuk 2026.",
    ],
    # Format mengikuti Lampiran 2 guidebook: Tools AI, tujuan penggunaan, bagian karya yang terkait.
    "aiDisclosure": [
        {
            "alat": "Claude Code (Anthropic)",
            "tujuan": "Coding dan debugging pipeline olah data: penggabungan CSV, ketimpangan, korelasi Spearman, dan clustering.",
            "bagian": "Skrip Python di folder analysis/ dan berkas JSON hasil olahannya.",
        },
        {
            "alat": "Claude Code (Anthropic)",
            "tujuan": "Coding dan debugging situs: halaman, filter, peta, dan grafik.",
            "bagian": "Kode situs di folder web/ (empat halaman dashboard).",
        },
        {
            "alat": "Claude Code (Anthropic)",
            "tujuan": "Mengambil tabel penduduk dan kepadatan 2025 dari situs BPS Provinsi Lampung dan menyimpannya apa adanya sebagai CSV.",
            "bagian": "Berkas data/raw/bps_penduduk-kepadatan_kabkota_2025.csv.",
        },
        {
            "alat": "Claude Code (Anthropic)",
            "tujuan": "Menyusun draf kalimat insight dan rekomendasi dari angka hasil analisis, serta perbaikan bahasa.",
            "bagian": "Teks insight, nama tipe daerah, rekomendasi, halaman Tentang Data, dan draf ringkasan proyek.",
        },
        {
            "alat": "Claude Code (Anthropic)",
            "tujuan": "Membuat skrip rekaman layar otomatis untuk video demo (tanpa suara) dan menyusun draf naskah narasi.",
            "bagian": "Video demo dan naskahnya (folder demo/); suara narasi direkam sendiri oleh tim.",
        },
    ],
    "verifikasiAi": [
        "Angka di situs dicek ulang terhadap CSV BPS di data/raw; pipeline dijalankan ulang dan hasilnya identik.",
        "Setiap angka dalam kalimat insight diisi otomatis dari hasil olahan, lalu kalimatnya ditinjau tim.",
        "AI tidak digunakan untuk membuat data, memalsukan hasil analisis, atau membuat referensi.",
    ],
}

# ---------- tulis ----------
WEB_DATA.mkdir(parents=True, exist_ok=True)
dump("panel.json", panel_rows)
dump("regions.json", region_rows)
dump("correlations.json", {k: corr[k] for k in ("vars", "rho", "p", "tahun")})
dump("clusters.json", clusters)
dump("disparity.json", an["disparity"])
dump("insights.json", insights)
dump("meta.json", meta)
shutil.copyfile(PROCESSED / "panel.csv", WEB_DATA / "panel.csv")

# GeoJSON untuk peta: kode wilayah dijadikan string agar cocok dengan kode di JSON lain
geo = json.loads(GEO.read_text(encoding="utf-8"))
for ft in geo["features"]:
    kode = str(ft["properties"]["kode_wilayah"])
    ft["properties"] = {"kode_wilayah": kode, "kab_kota": NAMA[kode]}
(WEB_DATA / "lampung_kabkota.geojson").write_text(
    json.dumps(geo, ensure_ascii=False, separators=(",", ":")), encoding="utf-8", newline="\n"
)

print(f"Ditulis ke {WEB_DATA}")
for i in insights:
    print(f"\n[{i['id']}] {i['judul']}\n  {i['angka']}\n  {i['teks']}")
for h in hipotesis:
    print(f"\n{h['id']} ({h['hasil']}): {h['bukti']}")
