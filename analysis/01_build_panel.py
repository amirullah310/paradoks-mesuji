"""Tahap 1: gabungkan CSV mentah menjadi panel kab/kota-tahun dan tabel wilayah.

Keluaran:
  data/processed/panel.csv    satu baris per wilayah per tahun (16 wilayah x 12 tahun)
  data/processed/regions.csv  kondisi penampang 2025 per kab/kota (15 baris)

Aturan: file di data/raw tidak diubah; join selalu lewat kode wilayah BPS;
nilai kosong tetap kosong (tidak ada imputasi).
"""

import geopandas as gpd
import pandas as pd

from common import (
    CROSS_YEAR, GEO, KABKOTA, NAMA, PANEL_SOURCES, PROCESSED, RAW, YEARS,
)


def read_wide(filename: str, var: str) -> pd.DataFrame:
    df = pd.read_csv(RAW / filename, dtype={"kode_wilayah": str})
    df["kode_wilayah"] = df["kode_wilayah"].str.strip()
    unknown = set(df["kode_wilayah"]) - set(NAMA)
    if unknown:
        raise ValueError(f"{filename}: kode tidak dikenal {unknown}")
    year_cols = [c for c in df.columns if c.isdigit()]
    long = df.melt(id_vars="kode_wilayah", value_vars=year_cols, var_name="tahun", value_name=var)
    long["tahun"] = long["tahun"].astype(int)
    long[var] = pd.to_numeric(long[var], errors="coerce")
    return long.rename(columns={"kode_wilayah": "kode"})


def build_panel() -> pd.DataFrame:
    grid = pd.MultiIndex.from_product([list(NAMA), YEARS], names=["kode", "tahun"]).to_frame(index=False)
    for var, fname in PANEL_SOURCES.items():
        grid = grid.merge(read_wide(fname, var), on=["kode", "tahun"], how="left")
    grid.insert(1, "nama", grid["kode"].map(NAMA))
    return grid.sort_values(["kode", "tahun"]).reset_index(drop=True)


def build_regions() -> pd.DataFrame:
    reg = pd.DataFrame({"kode": KABKOTA})
    reg["nama"] = reg["kode"].map(NAMA)
    reg["tipe"] = ["kota" if k.startswith("187") else "kabupaten" for k in reg["kode"]]

    # Penduduk & kepadatan 2025 dari BPS Provinsi Lampung (proyeksi hasil SP2020, pertengahan tahun).
    # Sumber menulis penduduk dalam ribu jiwa; dikalikan 1.000 tanpa pembulatan lain.
    pend = pd.read_csv(RAW / "bps_penduduk-kepadatan_kabkota_2025.csv", dtype={"kode_wilayah": str})
    pend["penduduk"] = (pend["penduduk_ribu"] * 1000).round().astype(int)
    pend = pend.rename(columns={"kode_wilayah": "kode", "kepadatan_per_km2": "kepadatan"})
    reg = reg.merge(pend[["kode", "penduduk", "kepadatan"]], on="kode", how="left")

    # Luas wilayah dari GeoJSON, proyeksi equal-area (EPSG:6933), bukan derajat.
    geo = gpd.read_file(GEO)
    geo["kode"] = geo["kode_wilayah"].astype(str)
    geo["luasKm2"] = geo.to_crs(epsg=6933).geometry.area / 1e6
    reg = reg.merge(geo[["kode", "luasKm2"]], on="kode", how="left")

    sek = pd.read_csv(RAW / "bps_jumlah-sekolah-smp-sma-smk_kabkota_2025.csv", dtype={"kode_wilayah": str})
    sek = sek.rename(columns={"kode_wilayah": "kode", "smp_total": "smp", "sma_total": "sma", "smk_total": "smk"})
    reg = reg.merge(sek[["kode", "smp", "sma", "smk"]], on="kode", how="left")

    pdrb = pd.read_csv(RAW / "bps_pdrb-adhb-sektor_kabkota_2025_milyar-rp.csv", dtype={"kode_wilayah": str})
    pdrb = pdrb.rename(columns={"kode_wilayah": "kode", "pct_primer": "pctPdrbPrimer"})
    reg = reg.merge(pdrb[["kode", "pctPdrbPrimer"]], on="kode", how="left")

    menengah = reg["sma"] + reg["smk"]
    reg["sekolahPer100rb"] = menengah / reg["penduduk"] * 100_000
    reg["sekolahPer100km2"] = menengah / reg["luasKm2"] * 100
    reg["smpPer100rb"] = reg["smp"] / reg["penduduk"] * 100_000

    if reg.isna().any().any():
        raise ValueError(f"regions memiliki nilai kosong:\n{reg[reg.isna().any(axis=1)]}")
    return reg


def main() -> None:
    panel = build_panel()
    regions = build_regions()

    # Lampirkan indikator panel tahun penampang ke tabel wilayah
    cross = panel[panel["tahun"] == CROSS_YEAR].drop(columns=["nama", "tahun"])
    regions = regions.merge(cross, on="kode", how="left")

    panel.to_csv(PROCESSED / "panel.csv", index=False, float_format="%.6g", lineterminator="\n")
    regions.to_csv(PROCESSED / "regions.csv", index=False, float_format="%.6g", lineterminator="\n")
    print(f"panel.csv: {len(panel)} baris; regions.csv: {len(regions)} baris")
    print(regions[["nama", "penduduk", "kepadatan", "luasKm2", "sekolahPer100rb", "sekolahPer100km2"]].round(2))


if __name__ == "__main__":
    main()
