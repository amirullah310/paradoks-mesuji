"use client";

import { useMemo } from "react";
import { ChartCard, InsightGrid, LegendRow } from "@/components/blocks";
import { CorrHeatmap, ScatterExplorer, SimpleLine } from "@/components/charts/lazy";
import FilterBar from "@/components/filters/FilterBar";
import IndicatorSelect from "@/components/filters/IndicatorSelect";
import RegionSelect from "@/components/filters/RegionSelect";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACCENT, CONTEXT, DIVERGING, PROVINCE } from "@/lib/colors";
import { PROVINCE_KODE } from "@/lib/constants";
import { useRegion, useScatterX, useScatterY } from "@/lib/filters";
import { fmt, fmtP } from "@/lib/format";
import { fmtIndicator, INDICATORS, RANK_ROWS, SCATTER_X, SCATTER_Y } from "@/lib/indicators";
import type { Correlations, Hipotesis, Insight, PanelRow, Region } from "@/lib/types";

interface Props {
  panel: PanelRow[];
  regions: Region[];
  correlations: Correlations;
  insights: Insight[];
  hipotesis: Hipotesis[];
}

const HASIL_LABEL: Record<Hipotesis["hasil"], string> = {
  didukung: "Didukung data",
  sebagian: "Didukung sebagian",
  "tidak didukung": "Tidak didukung",
};

/** Strip posisi peringkat 1-15: titik terpilih diberi aksen. */
function RankStrip({ rank, total }: { rank: number; total: number }) {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-3 w-1.5 rounded-[2px]"
          style={{ background: i + 1 === rank ? ACCENT : CONTEXT }}
        />
      ))}
    </span>
  );
}

export default function ParadoksView({ panel, regions, correlations, insights, hipotesis }: Props) {
  const [region, setRegion] = useRegion(regions.map((r) => r.kode));
  const [xKey, setXKey] = useScatterX();
  const [yKey, setYKey] = useScatterY();
  const tahun = correlations.tahun;
  const sel = regions.find((r) => r.kode === region)!;
  const total = regions.length;

  /** Nilai penampang per kab/kota: gabungan panel (tahun penampang) dan regions. */
  const cross = useMemo(() => {
    const map = new Map<string, Record<string, number | null>>();
    for (const r of regions) {
      const p = panel.find((row) => row.kode === r.kode && row.tahun === tahun);
      map.set(r.kode, {
        rls: p?.rls ?? null,
        hls: p?.hls ?? null,
        ipm: p?.ipm ?? null,
        pctMiskin: p?.pctMiskin ?? null,
        pengeluaran: p?.pengeluaran ?? null,
        pctPdrbPrimer: r.pctPdrbPrimer,
        sekolahPer100rb: r.sekolahPer100rb,
        sekolahPer100km2: r.sekolahPer100km2,
        smpPer100rb: r.smpPer100rb,
        kepadatan: r.kepadatan,
      });
    }
    return map;
  }, [panel, regions, tahun]);

  const points = useMemo(
    () =>
      regions
        .map((r) => ({
          kode: r.kode,
          nama: r.nama,
          x: cross.get(r.kode)![xKey],
          y: cross.get(r.kode)![yKey],
        }))
        .filter(
          (p): p is { kode: string; nama: string; x: number; y: number } => p.x !== null && p.y !== null,
        ),
    [regions, cross, xKey, yKey],
  );

  const ix = correlations.vars.indexOf(xKey);
  const iy = correlations.vars.indexOf(yKey);
  const rho = correlations.rho[iy][ix];
  const p = correlations.p[iy][ix];
  const xInfo = INDICATORS[xKey];
  const yInfo = INDICATORS[yKey];
  const relation =
    p >= 0.05
      ? "tidak berkaitan signifikan dengan"
      : Math.abs(rho) >= 0.7
        ? `berkaitan kuat (${rho > 0 ? "searah" : "berlawanan arah"}) dengan`
        : `berkaitan (${rho > 0 ? "searah" : "berlawanan arah"}) dengan`;

  // Judul heatmap: variabel yang paling kuat dan paling lemah kaitannya dengan HLS.
  const hlsIdx = correlations.vars.indexOf("hls");
  const others = correlations.vars
    .map((v, i) => ({ v, r: correlations.rho[hlsIdx][i] }))
    .filter((o) => o.v !== "hls" && o.v !== "rls")
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  const strongest = others[0];
  const weakest = others[others.length - 1];

  const lowestCount = RANK_ROWS.filter((k) => sel.peringkat[k] === 1).length;
  const provRows = panel.filter((r) => r.kode === PROVINCE_KODE);
  const selRows = panel.filter((r) => r.kode === region);

  return (
    <>
      <FilterBar>
        <RegionSelect regions={regions} value={region} onChange={setRegion} />
        <IndicatorSelect
          id="label-y"
          label="Sumbu Y (pendidikan)"
          options={SCATTER_Y}
          value={yKey}
          onChange={setYKey}
        />
        <IndicatorSelect
          id="label-x"
          label="Sumbu X (faktor penjelas)"
          options={SCATTER_X}
          value={xKey}
          onChange={setXKey}
        />
      </FilterBar>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-2"
          title={
            lowestCount > 0
              ? `${sel.nama} berada di peringkat terendah pada ${lowestCount} dari ${RANK_ROWS.length} indikator`
              : `Posisi ${sel.nama} di antara ${total} kab/kota`
          }
          subtitle={`Nilai ${tahun} dan peringkat; 1 = nilai terendah, ${total} = tertinggi`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indikator</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-right">Peringkat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RANK_ROWS.map((k) => {
                const rank = sel.peringkat[k];
                return (
                  <TableRow key={k}>
                    <TableCell className="whitespace-normal">{INDICATORS[k].label}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmtIndicator(k, cross.get(region)?.[k])}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center justify-end gap-2">
                        <RankStrip rank={rank} total={total} />
                        <span className="w-12 text-right font-medium tabular-nums">
                          {rank}/{total}
                        </span>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ChartCard>

        <ChartCard
          className="lg:col-span-3"
          title={`${yInfo.short} ${relation} ${xInfo.label.toLowerCase().replace("pdrb", "PDRB").replace("sma+smk", "SMA+SMK")}`}
          subtitle={`Spearman ρ = ${fmt(rho)}, ${fmtP(p)}, n = ${total} kab/kota, ${tahun}. Klik titik untuk memilih.`}
          note={
            <LegendRow
              items={[
                { label: sel.nama, color: ACCENT, kind: "dot" },
                { label: "Kab/kota lain", color: "#8f8e88", kind: "dot" },
                { label: "Garis tren (alat bantu baca)", color: "#6f6e68", kind: "dashed" },
              ]}
            />
          }
        >
          <ScatterExplorer
            points={points}
            xKey={xKey}
            yKey={yKey}
            selected={region}
            onSelect={setRegion}
            ariaLabel={`Diagram pencar ${yInfo.label} terhadap ${xInfo.label}, ${total} kab/kota, ${tahun}`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title={`HLS paling berkaitan dengan ${INDICATORS[strongest.v].short.toLowerCase()} (ρ = ${fmt(strongest.r)}), paling lemah dengan ${INDICATORS[weakest.v].short} (ρ = ${fmt(weakest.r)})`}
          subtitle={`Korelasi Spearman antarvariabel, ${tahun}, n = ${total}`}
          note={
            <div className="flex flex-col gap-1.5">
              <LegendRow
                items={[
                  { label: "Positif (searah)", color: DIVERGING.positive, kind: "swatch" },
                  { label: "Mendekati nol", color: DIVERGING.neutral, kind: "swatch" },
                  { label: "Negatif (berlawanan)", color: DIVERGING.negative, kind: "swatch" },
                ]}
              />
              <span>
                ts = tidak signifikan pada taraf 5% (p ≥ 0,05). Arahkan kursor ke sel untuk melihat p-value.
              </span>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <CorrHeatmap
                correlations={correlations}
                ariaLabel={`Matriks korelasi Spearman ${correlations.vars.length} variabel tahun ${tahun}`}
              />
            </div>
          </div>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title={`Kemiskinan dan lama sekolah ${sel.nama} dibanding provinsi`}
          subtitle="Dua panel dengan sumbu masing-masing"
          note={
            <LegendRow
              items={[
                { label: sel.nama, color: ACCENT },
                { label: "Provinsi Lampung", color: PROVINCE, kind: "dashed" },
              ]}
            />
          }
        >
          <div className="flex flex-col gap-2">
            {(["pctMiskin", "rls"] as const).map((k) => (
              <div key={k}>
                <h3 className="text-sm font-medium">{INDICATORS[k].label}</h3>
                <SimpleLine
                  height={200}
                  unit={INDICATORS[k].unit}
                  series={[
                    {
                      name: sel.nama.replace("Kota ", ""),
                      color: ACCENT,
                      points: selRows.map((r) => ({ tahun: r.tahun, value: r[k] })),
                    },
                    {
                      name: "Provinsi",
                      color: PROVINCE,
                      dashed: true,
                      points: provRows.map((r) => ({ tahun: r.tahun, value: r[k] })),
                    },
                  ]}
                  ariaLabel={`Tren ${INDICATORS[k].label} ${sel.nama} dibanding Provinsi Lampung`}
                />
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <InsightGrid insights={insights} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Hasil uji hipotesis</h2>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Hipotesis</TableHead>
                <TableHead>Hasil</TableHead>
                <TableHead>Bukti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hipotesis.map((h) => (
                <TableRow key={h.id} className="align-top">
                  <TableCell className="font-medium">{h.id}</TableCell>
                  <TableCell className="min-w-48 whitespace-normal">{h.pernyataan}</TableCell>
                  <TableCell>
                    <Badge variant={h.hasil === "didukung" ? "default" : "outline"}>
                      {HASIL_LABEL[h.hasil]}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-72 whitespace-normal text-[#52514e]">{h.bukti}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-[#6f6e68]">
          Hasil dilaporkan apa adanya, termasuk yang tidak mendukung hipotesis awal. Semua kaitan bersifat
          korelasional (n = {total}).
        </p>
      </section>
    </>
  );
}
