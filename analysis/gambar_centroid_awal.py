"""Gambar penjelasan: 3 centroid awal (contoh satu percobaan k-means++) dan pembagian iterasi 1.

Panel kiri : peta Lampung, warna = kelompok hasil iterasi 1, bintang = kab/kota yang terpilih sebagai centroid awal.
Panel kanan: "peta data" — posisi 15 kab/kota menurut kemiripan 8 variabel (z-score), diproyeksikan ke 2 dimensi
             dengan PCA. Garis menghubungkan tiap kab/kota ke centroid terdekat; angka = jarak Euclidean di 8 dimensi.

Hanya untuk penjelasan; tidak mengubah hasil analisis. Pemakaian (dari folder analysis/):
    uv run --with matplotlib python gambar_centroid_awal.py
Hasil: ../berkas/gambar/centroid_awal.png
"""

import importlib

import geopandas as gpd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402
from sklearn.cluster import kmeans_plusplus  # noqa: E402
from sklearn.decomposition import PCA  # noqa: E402

from common import GEO, ROOT  # noqa: E402

m = importlib.import_module("02_analysis")
_, regions = m.load()
_, z = m.feature_matrix(regions)
kode = regions["kode"].tolist()
nama = regions["nama"].str.replace("Kota ", "").tolist()

# Contoh satu percobaan k-means++ yang berakhir di hasil terbaik (inertia 32,45), lihat penjelasan Tahap 3–4.
SEED = 2
centers, idx = kmeans_plusplus(z, n_clusters=3, random_state=SEED)
D = np.sqrt(((z[:, None, :] - centers[None, :, :]) ** 2).sum(axis=2))
lab = D.argmin(axis=1)

# Warna mengikuti cluster akhir di dashboard: A -> Cluster 1 (biru), B -> Cluster 3 (kuning), C -> Cluster 2 (hijau)
huruf = ["A", "B", "C"]
warna = ["#2a78d6", "#eda100", "#008300"]
judul = [f"Centroid {huruf[k]} = {nama[idx[k]]}" for k in range(3)]

# pergeseran label (titik) untuk wilayah yang berdempetan
GESER_PETA = {"Bandar Lampung": (-48, -6), "Metro": (-28, 16), "Pesawaran": (-38, -16), "Pringsewu": (-30, 12)}
GESER_DATA = {"Pesawaran": (-8, 8, "right"), "Lampung Barat": (8, -12, "left"), "Pesisir Barat": (-8, 8, "right"),
              "Tanggamus": (-8, 6, "right")}

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(17, 8.2), gridspec_kw={"width_ratios": [1, 1.15]})
fig.patch.set_facecolor("white")

# ---------- panel kiri: peta geografis ----------
geo = gpd.read_file(GEO)
geo["kode"] = geo["kode_wilayah"].astype(str)
geo["grup"] = geo["kode"].map(dict(zip(kode, lab)))
geo["warna"] = geo["grup"].map(lambda g: warna[g])
geo.plot(ax=ax1, color=geo["warna"], edgecolor="white", linewidth=1.2)
for k in range(3):
    geo[geo["kode"] == kode[idx[k]]].plot(ax=ax1, facecolor="none", edgecolor="#111111", linewidth=2.6)
for _, row in geo.iterrows():
    p = row.geometry.representative_point()
    i = kode.index(row["kode"])
    is_c = i in idx
    label = nama[i].replace("Lampung ", "Lam. ").replace("Tulang Bawang", "Tuba")
    if is_c:
        ax1.plot(p.x, p.y, marker="*", ms=17, color="#111111", mec="white", mew=1, zorder=5)
    # wilayah kecil di selatan diberi label bergeser agar tidak bertumpuk
    dx, dy = GESER_PETA.get(nama[i], (0, 10 if is_c else 0))
    ax1.annotate(
        label, (p.x, p.y), xytext=(dx, dy), textcoords="offset points", ha="center", va="center",
        fontsize=8.5, fontweight="bold" if is_c else "normal",
        bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.8), zorder=6,
        arrowprops=dict(arrowstyle="-", color="#555555", lw=0.7) if (dx, dy) != (0, 0) and not is_c else None,
    )
ax1.set_title("Peta Lampung: letak 3 centroid awal (★) dan pembagian iterasi 1", fontsize=12.5, loc="left")
ax1.set_axis_off()

# ---------- panel kanan: peta jarak data (PCA) ----------
pca = PCA(n_components=2).fit(z)
P = pca.transform(z)
for i in range(len(z)):
    c = P[idx[lab[i]]]
    if i != idx[lab[i]]:
        ax2.plot([P[i, 0], c[0]], [P[i, 1], c[1]], color=warna[lab[i]], lw=1.3, alpha=0.75, zorder=1)
        mx, my = c[0] + 0.6 * (P[i, 0] - c[0]), c[1] + 0.6 * (P[i, 1] - c[1])
        ax2.text(mx, my, f"{D[i, lab[i]]:.2f}".replace(".", ","), fontsize=8, color="#333333", ha="center",
                 va="center", bbox=dict(boxstyle="round,pad=0.1", fc="white", ec="none", alpha=0.85), zorder=3)
for i in range(len(z)):
    is_c = i in idx
    ax2.scatter(P[i, 0], P[i, 1], s=420 if is_c else 90, marker="*" if is_c else "o", color=warna[lab[i]],
                edgecolor="#111111" if is_c else "white", linewidth=1.2, zorder=4)
    dx, dy, ha = GESER_DATA.get(nama[i], (7, 6, "left"))
    ax2.annotate(nama[i], (P[i, 0], P[i, 1]), xytext=(dx, dy), textcoords="offset points", fontsize=9, ha=ha,
                 fontweight="bold" if is_c else "normal", zorder=5)
ev = pca.explained_variance_ratio_ * 100
ax2.set_xlabel(f"Komponen utama 1 ({ev[0]:.0f}% variasi data)".replace(".", ","), fontsize=10)
ax2.set_ylabel(f"Komponen utama 2 ({ev[1]:.0f}% variasi data)".replace(".", ","), fontsize=10)
ax2.set_title("Peta jarak data: angka = jarak Euclidean ke centroid terdekat (8 variabel z-score)",
              fontsize=12.5, loc="left")
ax2.grid(color="#e8e7e2", lw=0.8)
for s in ax2.spines.values():
    s.set_color("#c9c8c2")

legend = [Line2D([0], [0], marker="*", color="w", markerfacecolor=warna[k], markeredgecolor="#111111",
                 markersize=16, label=f"{judul[k]}") for k in range(3)]
fig.legend(handles=legend, loc="lower center", ncol=3, frameon=False, fontsize=11, bbox_to_anchor=(0.5, 0.015))
fig.suptitle("Tahap 3 K-Means: 3 centroid awal (k-means++) dan pembagian pertama 15 kab/kota Lampung",
             fontsize=15, fontweight="bold", x=0.01, ha="left", y=0.985)
fig.text(0.01, 0.94,
         "Jarak K-Means adalah kemiripan data, bukan jarak geografis. Panel kanan meringkas 8 variabel menjadi 2 sumbu "
         "(PCA), jadi panjang garis hanya gambaran;\nangka di garis adalah jarak sebenarnya di 8 variabel. "
         "Setiap kab/kota masuk ke centroid dengan jarak terkecil. Data BPS 2025.",
         fontsize=10, color="#52514e", va="top")
fig.tight_layout(rect=(0, 0.06, 1, 0.9))

out = ROOT / "berkas" / "gambar" / "centroid_awal.png"
out.parent.mkdir(parents=True, exist_ok=True)
fig.savefig(out, dpi=150)
print("Ditulis:", out)
print("Centroid awal:", [nama[i] for i in idx])
for i in np.argsort(lab, kind="stable"):
    print(f"  {nama[i]:22s} jarak A={D[i,0]:.2f} B={D[i,1]:.2f} C={D[i,2]:.2f} -> {huruf[lab[i]]}")
