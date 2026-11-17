"""Tahap 2: disparitas, korelasi Spearman, clustering, peringkat, uji hipotesis H1-H5.

Masukan : data/processed/panel.csv, data/processed/regions.csv
Keluaran: data/processed/analysis.json (dibaca oleh 03_export_web.py)
"""

import json

import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import fcluster, linkage
from scipy.stats import spearmanr
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler

from common import CROSS_VARS, CROSS_YEAR, MESUJI, PROCESSED, PROV

SEED = 42
K_CANDIDATES = [3, 4, 5]
SIL_TOL = 0.01
RANK_VARS = ["pctMiskin", "rls", "hls", "ipm", "pengeluaran", "sekolahPer100rb",
             "smpPer100rb", "sekolahPer100km2", "kepadatan", "pctPdrbPrimer"]


def load():
    panel = pd.read_csv(PROCESSED / "panel.csv", dtype={"kode": str})
    regions = pd.read_csv(PROCESSED / "regions.csv", dtype={"kode": str})
    return panel, regions


def disparity(panel: pd.DataFrame) -> list[dict]:
    kab = panel[panel["kode"] != PROV]
    out = []
    for ind in ["rls", "hls", "ipm", "pctMiskin"]:
        for tahun, g in kab.groupby("tahun"):
            v = g[ind].dropna()
            if len(v) < 15:
                continue  # tahun tanpa data lengkap tidak dihitung
            out.append({
                "indikator": ind,
                "tahun": int(tahun),
                "selisih": round(float(v.max() - v.min()), 4),
                # CV populasi (ddof=0): 15 kab/kota adalah seluruh populasi wilayah
                "cv": round(float(v.std(ddof=0) / v.mean() * 100), 4),
            })
    return out


def correlations(regions: pd.DataFrame) -> dict:
    x = regions[CROSS_VARS]
    rho, p = spearmanr(x.values)
    return {
        "vars": CROSS_VARS,
        "rho": np.round(rho, 4).tolist(),
        "p": np.round(p, 4).tolist(),
        "tahun": CROSS_YEAR,
        "n": int(len(x)),
    }


def feature_matrix(regions: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray]:
    feats = regions[CROSS_VARS].copy()
    feats["kepadatan"] = np.log(feats["kepadatan"])
    z = StandardScaler().fit_transform(feats.values)
    return feats, z


def clustering(regions: pd.DataFrame) -> dict:
    _, z = feature_matrix(regions)
    ward = linkage(z, method="ward")
    evals = []
    labels_by_k = {}
    all_solutions = []  # semua solusi (K-Means dan Ward, tiap k) untuk uji kestabilan
    for k in K_CANDIDATES:
        km = KMeans(n_clusters=k, n_init=50, random_state=SEED).fit(z)
        ward_labels = fcluster(ward, k, criterion="maxclust")
        evals.append({
            "k": k,
            "silhouette": round(float(silhouette_score(z, km.labels_)), 4),
            "ariWard": round(float(adjusted_rand_score(km.labels_, ward_labels)), 4),
            "inertia": round(float(km.inertia_), 4),
        })
        labels_by_k[k] = km.labels_
        all_solutions += [km.labels_, ward_labels]

    # Kelompok inti: kab/kota yang SELALU sekelompok dengan Mesuji di semua solusi di atas.
    idx_mesuji = regions["kode"].tolist().index(MESUJI)
    always = np.ones(len(regions), dtype=bool)
    for lab in all_solutions:
        always &= np.asarray(lab) == lab[idx_mesuji]
    inti_mesuji = regions.loc[always, "kode"].tolist()
    # Aturan pemilihan k: di antara k yang skor siluetnya berselisih <= SIL_TOL dari
    # maksimum, pilih yang paling konsisten dengan Ward (ARI tertinggi); seri -> k terkecil.
    max_sil = max(e["silhouette"] for e in evals)
    eligible = [e for e in evals if max_sil - e["silhouette"] <= SIL_TOL]
    best_k = max(eligible, key=lambda e: (e["ariWard"], -e["k"]))["k"]
    raw_labels = labels_by_k[best_k]

    # Nomor cluster dibuat stabil: urut berdasarkan rata-rata z-score HLS (terendah = 1)
    zdf = pd.DataFrame(z, columns=CROSS_VARS)
    zdf["raw"] = raw_labels
    order = zdf.groupby("raw")["hls"].mean().sort_values().index.tolist()
    remap = {raw: i + 1 for i, raw in enumerate(order)}
    zdf["clusterId"] = zdf["raw"].map(remap)

    profiles = {
        int(cid): {v: round(float(g[v].mean()), 4) for v in CROSS_VARS}
        for cid, g in zdf.groupby("clusterId")
    }
    members = {
        int(cid): regions.loc[g.index, "kode"].tolist() for cid, g in zdf.groupby("clusterId")
    }
    return {
        "k": best_k,
        "aturanK": f"siluet dalam {SIL_TOL} dari maksimum, lalu ARI vs Ward tertinggi",
        "evaluasi": evals,
        "labels": dict(zip(regions["kode"], zdf["clusterId"].astype(int).tolist())),
        "profil": profiles,
        "anggota": members,
        "intiMesuji": inti_mesuji,
        "jumlahSolusiDiuji": len(all_solutions),
    }


def ranks(regions: pd.DataFrame) -> dict:
    out = {}
    for _, row in regions.iterrows():
        out[row["kode"]] = {}
    for v in RANK_VARS:
        r = regions[v].rank(method="min", ascending=True).astype(int)
        for kode, val in zip(regions["kode"], r):
            out[kode][v] = int(val)
    return out


def mesuji_rank_history(panel: pd.DataFrame) -> list[dict]:
    """H5: peringkat Mesuji (1 = terendah) untuk % miskin dan pengeluaran per tahun."""
    kab = panel[panel["kode"] != PROV]
    out = []
    for tahun, g in kab.groupby("tahun"):
        row = {"tahun": int(tahun)}
        for v in ["pctMiskin", "pengeluaran", "rls", "hls"]:
            if g[v].notna().sum() == 15:
                r = g[v].rank(method="min", ascending=True)
                row[v] = int(r[g["kode"] == MESUJI].iloc[0])
            else:
                row[v] = None
        out.append(row)
    return out


def main() -> None:
    panel, regions = load()
    corr = correlations(regions)
    # Uji ketahanan: ulangi korelasi tanpa dua kota (n = 13 kabupaten)
    corr_kab = correlations(regions[regions["tipe"] == "kabupaten"])
    result = {
        "disparity": disparity(panel),
        "correlations": corr,
        "correlationsKabupaten": corr_kab,
        "clustering": clustering(regions),
        "ranks": ranks(regions),
        "mesujiRankHistory": mesuji_rank_history(panel),
    }
    (PROCESSED / "analysis.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8"
    )

    # Ringkasan ke konsol untuk pengecekan manual
    print("Evaluasi k:", result["clustering"]["evaluasi"])
    print("k terpilih:", result["clustering"]["k"])
    for cid, mem in result["clustering"]["anggota"].items():
        print(cid, [regions.set_index("kode").loc[m, "nama"] for m in mem])
        print("   ", result["clustering"]["profil"][cid])
    rho = pd.DataFrame(corr["rho"], index=CROSS_VARS, columns=CROSS_VARS)
    p = pd.DataFrame(corr["p"], index=CROSS_VARS, columns=CROSS_VARS)
    print(pd.concat({"rho_rls": rho["rls"], "p_rls": p["rls"], "rho_hls": rho["hls"], "p_hls": p["hls"]}, axis=1))
    rk = pd.DataFrame(corr_kab["rho"], index=CROSS_VARS, columns=CROSS_VARS)
    pk = pd.DataFrame(corr_kab["p"], index=CROSS_VARS, columns=CROSS_VARS)
    print("Tanpa kota (n=13):")
    print(pd.concat({"rho_rls": rk["rls"], "p_rls": pk["rls"], "rho_hls": rk["hls"], "p_hls": pk["hls"]}, axis=1))
    print(pd.DataFrame(result["disparity"]).pivot(index="tahun", columns="indikator", values="selisih").round(2))
    print(pd.DataFrame(result["disparity"]).pivot(index="tahun", columns="indikator", values="cv").round(2))
    print(pd.DataFrame(result["mesujiRankHistory"]))


if __name__ == "__main__":
    main()
