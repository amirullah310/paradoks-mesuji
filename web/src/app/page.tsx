import { Suspense } from "react";
import { PageHeader } from "@/components/blocks";
import SourceFooter from "@/components/SourceFooter";
import MasalahView from "@/components/views/MasalahView";
import { getData, getGeo } from "@/lib/data";
import { PROVINCE_KODE } from "@/lib/constants";
import { fmt } from "@/lib/format";
import type { PanelRow } from "@/lib/types";

/** Kab/kota dengan nilai terendah dan tertinggi untuk satu indikator pada satu tahun. */
function extremes(rows: PanelRow[], key: "rls" | "pctMiskin") {
  const sorted = rows
    .filter((r) => r[key] !== null)
    .map((r) => ({ nama: r.nama, value: r[key] as number }))
    .sort((a, b) => a.value - b.value);
  return { lo: sorted[0], hi: sorted[sorted.length - 1] };
}

export default function MasalahPage() {
  const { panel, disparity, insights, meta } = getData();
  const geo = getGeo();
  const page = insights.filter((i) => i.halaman === 1);

  // Angka untuk bagian permasalahan diambil dari data, bukan diketik.
  const tahun = meta.dataset.tahunPenampang;
  const kabkota = panel.filter((r) => r.tahun === tahun && r.kode !== PROVINCE_KODE);
  const rls = extremes(kabkota, "rls");
  const miskin = extremes(kabkota, "pctMiskin");
  const provRls = panel.find((r) => r.tahun === tahun && r.kode === PROVINCE_KODE)?.rls ?? null;
  const selisihRls = disparity.find((d) => d.indikator === "rls" && d.tahun === tahun)?.selisih ?? null;
  const tahunAwal = meta.dataset.periode.split("–")[0];
  const temuanTren = page.find((i) => i.id === "I3");

  return (
    <>
      <PageHeader
        eyebrow="Halaman 1 · Masalah"
        title="Paradoks Mesuji: kemiskinan rendah tidak otomatis berarti pendidikan baik"
        finding={`${page[0].judul}. ${page[1].judul}.`}
      />

      <section className="grid gap-4 md:grid-cols-2" aria-label="Permasalahan dan tujuan">
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[#6f6e68] uppercase">Permasalahan</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Capaian pendidikan antar-{meta.dataset.jumlahWilayah} kabupaten/kota di Provinsi Lampung timpang,
            dan angka kemiskinan, yang sering dipakai untuk menentukan daerah prioritas, tidak menjelaskan
            ketimpangan itu. Kabupaten {miskin.lo.nama} memiliki persentase penduduk miskin terendah di
            Lampung ({fmt(miskin.lo.value)}%), tetapi rata-rata lama sekolah, harapan lama sekolah, dan
            IPM-nya juga terendah.
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            <span className="font-semibold">Mengapa mendesak:</span> pada {tahun}, penduduk dewasa{" "}
            {rls.lo.nama} rata-rata hanya bersekolah {fmt(rls.lo.value)} tahun, terpaut {fmt(selisihRls)}{" "}
            tahun dari {rls.hi.nama} ({fmt(rls.hi.value)})
            {provRls !== null && rls.lo.value < provRls ? ` dan di bawah provinsi (${fmt(provRls)})` : ""}.{" "}
            {temuanTren ? `${temuanTren.judul}. ` : ""}
            Bila prioritas program pendidikan hanya mengikuti angka kemiskinan, daerah dengan kemiskinan
            terendah akan berada di urutan terakhir, padahal lama sekolahnya paling pendek.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-wide text-[#6f6e68] uppercase">
            Tujuan: pertanyaan yang ingin dijawab
          </h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Seberapa timpang lama sekolah antar-{meta.dataset.jumlahWilayah} kabupaten/kota di Lampung, dan
              apakah kesenjangannya menyempit sejak {tahunAwal}?
            </li>
            <li>
              Faktor apa yang berkaitan dengan lama sekolah: kemiskinan, daya beli, struktur ekonomi, jumlah
              sekolah, atau sebaran wilayah?
            </li>
            <li>
              Tipe daerah apa saja yang ada di Lampung, dan intervensi apa yang cocok untuk masing-masing
              tipe?
            </li>
          </ol>
        </div>
      </section>

      <Suspense>
        <MasalahView panel={panel} disparity={disparity} insights={page} geo={geo} />
      </Suspense>

      <SourceFooter meta={meta} />
    </>
  );
}
