import { describe, expect, it } from "vitest";
import { fmt, fmtP, fmtRpJuta, fmtTanggal, TIDAK_TERSEDIA } from "./format";
import { fmtIndicator } from "./indicators";
import { linearFit, rankAscending } from "./stats";

describe("format angka Indonesia", () => {
  it("memakai koma desimal", () => {
    expect(fmt(7.3)).toBe("7,30");
    expect(fmt(11683, 0)).toBe("11.683");
  });
  it("memakai tanda minus tipografis", () => {
    expect(fmt(-0.5)).toBe("−0,50");
  });
  it("menampilkan nilai kosong sebagai data tidak tersedia", () => {
    expect(fmt(null)).toBe(TIDAK_TERSEDIA);
    expect(fmtIndicator("ipm", null)).toBe(TIDAK_TERSEDIA);
  });
  it("mengubah ribu rupiah menjadi juta", () => {
    expect(fmtRpJuta(9843)).toBe("Rp9,84 juta");
  });
  it("menambahkan satuan sesuai indikator", () => {
    expect(fmtIndicator("pctMiskin", 5.92)).toBe("5,92%");
    expect(fmtIndicator("rls", 7.3)).toBe("7,30 tahun");
    expect(fmtIndicator("kepadatan", 109)).toBe("109 jiwa/km²");
  });
  it("memformat p-value", () => {
    expect(fmtP(0.0001)).toBe("p < 0,001");
    expect(fmtP(0.0551)).toBe("p = 0,055");
    expect(fmtP(0.56)).toBe("p = 0,56");
  });
  it("memformat tanggal", () => {
    expect(fmtTanggal("2026-11-16")).toBe("16 November 2026");
  });
});

describe("util statistik tampilan", () => {
  it("menghitung garis tren", () => {
    const fit = linearFit([
      [0, 1],
      [1, 3],
      [2, 5],
    ]);
    expect(fit?.a).toBeCloseTo(1);
    expect(fit?.b).toBeCloseTo(2);
  });
  it("mengembalikan null bila x konstan", () => {
    expect(
      linearFit([
        [1, 1],
        [1, 2],
      ]),
    ).toBeNull();
  });
  it("memberi peringkat 1 untuk nilai terendah", () => {
    expect(rankAscending([5.92, 6.44, 6.72], 5.92)).toBe(1);
    expect(rankAscending([5.92, 6.44, 6.72], 6.72)).toBe(3);
  });
});
