"""Konstanta dan path bersama untuk pipeline Paradoks Mesuji."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
GEO = ROOT / "data" / "geo" / "lampung_kabkota.geojson"
WEB_DATA = ROOT / "web" / "public" / "data"

PROV = "1800"
MESUJI = "1811"

# Nama baku per kode wilayah BPS. Semua join memakai kode, nama hanya untuk tampilan.
NAMA = {
    "1800": "Provinsi Lampung",
    "1801": "Lampung Barat",
    "1802": "Tanggamus",
    "1803": "Lampung Selatan",
    "1804": "Lampung Timur",
    "1805": "Lampung Tengah",
    "1806": "Lampung Utara",
    "1807": "Way Kanan",
    "1808": "Tulang Bawang",
    "1809": "Pesawaran",
    "1810": "Pringsewu",
    "1811": "Mesuji",
    "1812": "Tulang Bawang Barat",
    "1813": "Pesisir Barat",
    "1871": "Kota Bandar Lampung",
    "1872": "Kota Metro",
}
KABKOTA = [k for k in NAMA if k != PROV]

# File mentah -> nama variabel panel
PANEL_SOURCES = {
    "rls": "bps_rls_kabkota_2015-2026.csv",
    "hls": "bps_hls_kabkota_2015-2026.csv",
    "ipm": "bps_ipm-uhh-lf-sp2020_kabkota_2020-2026.csv",
    "pctMiskin": "bps_p0-persen-miskin_kabkota_2015-2025.csv",
    "pengeluaran": "bps_pengeluaran-riil-per-kapita-disesuaikan_ribu-rp-tahun_kabkota_2015-2026.csv",
}
PANEL_VARS = list(PANEL_SOURCES)
YEARS = list(range(2015, 2027))
CROSS_YEAR = 2025

# Variabel penampang untuk korelasi & clustering (urutan tetap)
CROSS_VARS = [
    "rls",
    "hls",
    "pctMiskin",
    "pengeluaran",
    "pctPdrbPrimer",
    "sekolahPer100rb",
    "sekolahPer100km2",
    "kepadatan",
]
