"use client";

import { useMemo } from "react";
import { ChartCard, InsightGrid, KpiCard, LegendRow } from "@/components/blocks";
import { LampungMap, SimpleLine, TrendLine } from "@/components/charts/lazy";
import FilterBar from "@/components/filters/FilterBar";
import IndicatorSelect from "@/components/filters/IndicatorSelect";
import RegionSelect from "@/components/filters/RegionSelect";
import YearSlider from "@/components/filters/YearSlider";
import { ACCENT, CONTEXT, INK, PROVINCE } from "@/lib/colors";
import { PROVINCE_KODE } from "@/lib/constants";
import { useMapIndicator, useRegion, useYear } from "@/lib/filters";
import { fmt, TIDAK_TERSEDIA } from "@/lib/format";
import { fmtIndicator, fmtPlain, INDICATORS, MAP_INDICATORS } from "@/lib/indicators";
import { rankAscending } from "@/lib/stats";
import type { Disparity, GeoFeatureCollection, Insight, PanelRow } from "@/lib/types";

interface Props {
  panel: PanelRow[];
  disparity: Disparity[];
  insights: Insight[];
  geo: GeoFeatureCollection;
}

export default function MasalahView({ panel, disparity, insights, geo }: Props) {
  const regions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of panel) if (r.kode !== PROVINCE_KODE) seen.set(r.kode, r.nama);
    return [...seen].map(([kode, nama]) => ({ kode, nama }));
  }, [panel]);

  const [year, setYear] = useYear();
  const [region, setRegion] = useRegion(regions.map((r) => r.kode));
  const [indicator, setIndicator] = useMapIndicator();
  const info = INDICATORS[indicator];
  const regionName = regions.find((r) => r.kode === region)?.nama ?? "";

  // Nilai tahun terpilih (hanya filter; tidak ada perhitungan baru selain urutan).
  const yearRows = useMemo(
    () =>
      panel
        .filter((r) => r.tahun === year && r.kode !== PROVINCE_KODE && r[indicator] !== null)
        .map((r) => ({ kode: r.kode, nama: r.nama, value: r[indicator] as number }))
        .sort((a, b) => a.value - b.value),
    [panel, year, indicator],
  );
  const provValue = panel.find((r) => r.tahun === year && r.kode === PROVINCE_KODE)?.[indicator] ?? null;
  const lo = yearRows[0];
  const hi = yearRows[yearRows.length - 1];
  const hasData = yearRows.length > 0;
  const disp = disparity.filter((d) => d.indikator === indicator);
  const dispYear = disp.find((d) => d.tahun === year);

  const mapItems = useMemo(
    () =>
      regions.map((r) => {
        const row = yearRows.find((y) => y.kode === r.kode);
        const rank = row
          ? rankAscending(
              yearRows.map((y) => y.value),
              row.value,
            )
          : null;
        return {
          kode: r.kode,
          nama: r.nama,
          value: row?.value ?? null,
          tooltip: row
            ? [
                `${info.short} ${year}: <strong>${fmtIndicator(indicator, row.value)}</strong>`,
                `Peringkat ${rank} dari ${yearRows.length} (1 = terendah)`,
              ]
            : [`${info.short} ${year}: ${TIDAK_TERSEDIA}`],
        };
      }),
    [regions, yearRows, info.short, indicator, year],
  );

  // Kalimat temuan untuk judul grafik tren: posisi kab/kota terpilih sepanjang tahun data.
  const trendTitle = useMemo(() => {
    const years = [...new Set(panel.filter((r) => r[indicator] !== null).map((r) => r.tahun))];
    let lowest = 0;
    let highest = 0;
    for (const t of years) {
      const vals = panel
        .filter((r) => r.tahun === t && r.kode !== PROVINCE_KODE && r[indicator] !== null)
        .map((r) => ({ kode: r.kode, v: r[indicator] as number }));
      const mine = vals.find((v) => v.kode === region);
      if (!mine) continue;
      const rank = rankAscending(
        vals.map((v) => v.v),
        mine.v,
      );
      if (rank === 1) lowest += 1;
      if (vals.every((v) => v.v <= mine.v)) highest += 1;
    }
    if (lowest > 0 && lowest >= highest)
      return `${regionName} terendah di ${info.short} pada ${lowest} dari ${years.length} tahun data`;
    if (highest > 0)
      return `${regionName} tertinggi di ${info.short} pada ${highest} dari ${years.length} tahun data`;
    const row = yearRows.find((y) => y.kode === region);
    if (!row) return `${info.short} ${regionName} dibanding 14 kab/kota lain`;
    const rank = rankAscending(
      yearRows.map((y) => y.value),
      row.value,
    );
    return `${regionName} berada di peringkat ${rank} terendah dari ${yearRows.length} untuk ${info.short} pada ${year}`;
  }, [panel, indicator, region, regionName, info.short, yearRows, year]);

  const first = disp[0];
  const last = disp[disp.length - 1];

  return (
    <>
      <FilterBar>
        <IndicatorSelect
          id="label-indikator"
          label="Indikator"
          options={MAP_INDICATORS}
          value={indicator}
          onChange={setIndicator}
        />
        <YearSlider value={year} onChange={setYear} />
        <RegionSelect regions={regions} value={region} onChange={setRegion} />
      </FilterBar>

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label={`Provinsi Lampung · ${year}`}
          value={fmtIndicator(indicator, provValue)}
          sub={info.short}
        />
        <KpiCard
          label="Tertinggi"
          value={hasData ? fmtIndicator(indicator, hi.value) : TIDAK_TERSEDIA}
          sub={hasData ? hi.nama : undefined}
        />
        <KpiCard
          label="Terendah"
          value={hasData ? fmtIndicator(indicator, lo.value) : TIDAK_TERSEDIA}
          sub={hasData ? lo.nama : undefined}
        />
        <KpiCard
          label="Selisih tertinggi–terendah"
          value={dispYear ? fmtIndicator(indicator, dispYear.selisih).replace("%", " poin") : TIDAK_TERSEDIA}
          sub={dispYear ? `Koefisien variasi ${fmt(dispYear.cv)}%` : undefined}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={
            hasData
              ? `${lo.nama} terendah (${fmtPlain(indicator, lo.value)}), ${hi.nama} tertinggi (${fmtPlain(indicator, hi.value)}) pada ${year}`
              : `${info.short} ${year}: ${TIDAK_TERSEDIA}`
          }
          subtitle={`${info.label}, ${info.unit}, ${year}. Klik wilayah untuk memilih.`}
          note={
            hasData
              ? "Warna makin gelap = nilai makin tinggi. Garis tepi oranye = kab/kota terpilih."
              : `Seri ${info.short} tidak tersedia untuk ${year}; geser tahun untuk melihat data.`
          }
        >
          <LampungMap
            geo={geo}
            mode="sequential"
            items={mapItems}
            selected={region}
            onSelect={setRegion}
            formatValue={(v) => fmtPlain(indicator, v)}
            ariaLabel={`Peta ${info.label} 15 kabupaten/kota Lampung tahun ${year}`}
          />
        </ChartCard>

        <ChartCard
          title={trendTitle}
          subtitle={`${info.label}, ${info.unit}, tiap kab/kota per tahun`}
          note={
            <LegendRow
              items={[
                { label: regionName, color: ACCENT },
                { label: "Provinsi Lampung", color: PROVINCE, kind: "dashed" },
                { label: "14 kab/kota lain", color: CONTEXT },
              ]}
            />
          }
        >
          <TrendLine
            panel={panel}
            indicator={indicator}
            selected={region}
            provinceKode={PROVINCE_KODE}
            year={year}
            ariaLabel={`Tren ${info.label} ${regionName} dibanding kab/kota lain dan provinsi`}
          />
        </ChartCard>
      </div>

      <ChartCard
        title={
          first && last
            ? `Ketimpangan ${info.short}: koefisien variasi ${fmt(first.cv)}% (${first.tahun}) menjadi ${fmt(last.cv)}% (${last.tahun})`
            : `Ketimpangan ${info.short} antarwilayah`
        }
        subtitle="Dua ukuran ketimpangan antar-15 kab/kota per tahun (tanpa baris provinsi)"
        note="Koefisien variasi = simpangan baku ÷ rata-rata. Makin kecil, makin merata."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Selisih tertinggi–terendah</h3>
            <SimpleLine
              series={[
                {
                  name: "Selisih",
                  color: INK.secondary,
                  points: disp.map((d) => ({ tahun: d.tahun, value: d.selisih })),
                },
              ]}
              unit={info.unit === "%" ? "poin persen" : info.unit}
              markYear={year}
              ariaLabel={`Selisih ${info.short} tertinggi dan terendah per tahun`}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium">Koefisien variasi</h3>
            <SimpleLine
              series={[
                {
                  name: "Koefisien variasi",
                  color: INK.secondary,
                  points: disp.map((d) => ({ tahun: d.tahun, value: d.cv })),
                },
              ]}
              unit="%"
              markYear={year}
              ariaLabel={`Koefisien variasi ${info.short} per tahun`}
            />
          </div>
        </div>
      </ChartCard>

      <InsightGrid insights={insights} />
    </>
  );
}
