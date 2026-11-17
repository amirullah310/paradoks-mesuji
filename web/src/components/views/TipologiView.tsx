"use client";

import { useMemo } from "react";
import { ChartCard, InsightGrid } from "@/components/blocks";
import { ClusterProfile, LampungMap } from "@/components/charts/lazy";
import FilterBar from "@/components/filters/FilterBar";
import RegionSelect from "@/components/filters/RegionSelect";
import { Badge } from "@/components/ui/badge";
import { ACCENT, clusterColor } from "@/lib/colors";
import { useRegion } from "@/lib/filters";
import { fmtIndicator, INDICATORS, RANK_ROWS } from "@/lib/indicators";
import type { Cluster, GeoFeatureCollection, Insight, PanelRow, Region } from "@/lib/types";

interface Props {
  regions: Region[];
  clusters: Cluster[];
  insights: Insight[]; // semua insight (untuk rujukan rekomendasi)
  crossRows: PanelRow[]; // baris panel tahun penampang
  vars: string[];
  tahun: number;
  geo: GeoFeatureCollection;
}

function ClusterDot({ id }: { id: number }) {
  return <span aria-hidden className="size-3 shrink-0 rounded-sm" style={{ background: clusterColor(id) }} />;
}

export default function TipologiView({ regions, clusters, insights, crossRows, vars, tahun, geo }: Props) {
  const [region, setRegion] = useRegion(regions.map((r) => r.kode));
  const sel = regions.find((r) => r.kode === region)!;
  const selCluster = clusters.find((c) => c.id === sel.clusterId)!;
  const insightById = useMemo(() => new Map(insights.map((i) => [i.id, i])), [insights]);
  const nameOf = useMemo(() => new Map(regions.map((r) => [r.kode, r.nama])), [regions]);
  const selPanel = crossRows.find((r) => r.kode === region);

  const mapItems = useMemo(
    () =>
      regions.map((r) => {
        const c = clusters.find((cl) => cl.id === r.clusterId)!;
        return {
          kode: r.kode,
          nama: r.nama,
          value: null,
          color: clusterColor(c.id),
          tooltip: [`Tipe ${c.id}: ${c.nama}`],
        };
      }),
    [regions, clusters],
  );

  const limit = useMemo(() => {
    const maxAbs = Math.max(...clusters.flatMap((c) => vars.map((v) => Math.abs(c.profil[v]))));
    return Math.ceil(maxAbs + 0.5);
  }, [clusters, vars]);

  const values: Record<string, number | null | undefined> = {
    rls: selPanel?.rls,
    hls: selPanel?.hls,
    ipm: selPanel?.ipm,
    pctMiskin: selPanel?.pctMiskin,
    pengeluaran: selPanel?.pengeluaran,
    sekolahPer100rb: sel.sekolahPer100rb,
    smpPer100rb: sel.smpPer100rb,
    sekolahPer100km2: sel.sekolahPer100km2,
    kepadatan: sel.kepadatan,
  };

  return (
    <>
      <FilterBar>
        <RegionSelect regions={regions} value={region} onChange={setRegion} />
        <p className="max-w-md pb-1.5 text-sm text-[#52514e]">
          Pilih kab/kota atau klik peta untuk melihat tipe dan rekomendasinya.
        </p>
      </FilterBar>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-3"
          title={`${clusters.length} tipe daerah: ${sel.nama} masuk tipe "${selCluster.nama}"`}
          subtitle={`Hasil K-Means pada ${vars.length} variabel, data ${tahun}. Klik wilayah untuk memilih.`}
          note="Garis tepi oranye = kab/kota terpilih."
        >
          <ul className="mb-2 flex flex-col gap-1.5 text-sm">
            {clusters.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <ClusterDot id={c.id} />
                <span>
                  <span className="font-medium">Tipe {c.id}.</span> {c.nama}{" "}
                  <span className="text-[#6f6e68]">({c.anggota.length})</span>
                </span>
              </li>
            ))}
          </ul>
          <LampungMap
            geo={geo}
            mode="categorical"
            items={mapItems}
            selected={region}
            onSelect={setRegion}
            ariaLabel={`Peta ${clusters.length} tipe daerah di Lampung`}
            height={420}
          />
        </ChartCard>

        <section
          aria-label={`Detail ${sel.nama}`}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 lg:col-span-2"
          style={{ borderTop: `3px solid ${ACCENT}` }}
        >
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-[#6f6e68]">Kab/kota terpilih</p>
            <h2 className="text-xl font-semibold tracking-tight">{sel.nama}</h2>
            <p className="flex items-center gap-2 text-sm">
              <ClusterDot id={selCluster.id} />
              <span>
                <span className="font-medium">Tipe {selCluster.id}.</span> {selCluster.nama}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-[#52514e]">{selCluster.ringkasan}</p>
          </div>
          <dl className="grid grid-cols-1 gap-x-4 text-sm">
            {RANK_ROWS.map((k) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-0"
              >
                <dt className="text-[#52514e]">{INDICATORS[k].short}</dt>
                <dd className="text-right tabular-nums">
                  <span className="font-medium">{fmtIndicator(k, values[k])}</span>
                  <span className="ml-2 text-xs text-[#6f6e68]">
                    peringkat {sel.peringkat[k]}/{regions.length}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-[#6f6e68]">
            Peringkat 1 = nilai terendah. Rekomendasi untuk {sel.nama} ada pada kartu Tipe {selCluster.id} di
            bawah.
          </p>
        </section>
      </div>

      <ChartCard
        title="Tiap tipe punya kombinasi kekuatan dan kelemahan yang berbeda"
        subtitle="Rata-rata z-score per variabel; 0 = rata-rata 15 kab/kota, batang ke kanan = di atas rata-rata"
        note="Kepadatan distandarisasi setelah di-log. Skala sumbu sama di semua panel agar bisa dibandingkan."
      >
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          {clusters.map((c) => (
            <div key={c.id} className="min-w-0">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <ClusterDot id={c.id} />
                Tipe {c.id}. {c.nama}
              </h3>
              <ClusterProfile
                profil={c.profil}
                vars={vars}
                color={clusterColor(c.id)}
                limit={limit}
                ariaLabel={`Profil z-score Tipe ${c.id}: ${c.nama}`}
              />
            </div>
          ))}
        </div>
      </ChartCard>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Rekomendasi per tipe daerah</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {clusters.map((c) => {
            const active = c.id === selCluster.id;
            return (
              <article
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5"
                style={{
                  borderTop: `3px solid ${clusterColor(c.id)}`,
                  outline: active ? `2px solid ${ACCENT}` : undefined,
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5">
                      <ClusterDot id={c.id} />
                    </span>
                    <h3 className="text-base leading-snug font-semibold">
                      Tipe {c.id}. {c.nama}
                    </h3>
                  </div>
                  {active ? (
                    <Badge variant="outline" className="self-start">
                      berisi {sel.nama}
                    </Badge>
                  ) : null}
                  <p className="text-sm text-[#6f6e68]">{c.anggota.map((k) => nameOf.get(k)).join(" · ")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#6f6e68] uppercase">
                    Masalah utama
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed">{c.ringkasan}</p>
                </div>
                <ol className="flex flex-col gap-3">
                  {c.rekomendasi.map((r, idx) => {
                    const ins = insightById.get(r.insightId);
                    return (
                      <li key={idx} className="rounded-lg bg-muted/60 p-3">
                        <p className="text-sm leading-relaxed font-medium">{r.intervensi}</p>
                        <p className="mt-1.5 text-sm text-[#52514e]">
                          <span className="font-medium text-foreground">Untuk:</span> {r.sasaran}
                        </p>
                        {ins ? (
                          <p className="mt-1 text-sm text-[#52514e]">
                            <span className="font-medium text-foreground">
                              Dasar (Insight {ins.id.replace("I", "")}):
                            </span>{" "}
                            {ins.judul} ({ins.angka}).
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      <InsightGrid insights={insights.filter((i) => i.halaman === 3)} title="Temuan tipologi" />
    </>
  );
}
