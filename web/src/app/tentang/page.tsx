import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";
import { PageHeader } from "@/components/blocks";
import SourceFooter from "@/components/SourceFooter";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getData } from "@/lib/data";
import { fmt, fmtInt, fmtTanggal } from "@/lib/format";
import { INDICATORS } from "@/lib/indicators";

export const metadata: Metadata = { title: "Tentang Data" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Label untuk istilah yang bukan indikator grafik. */
const EXTRA_LABELS: Record<string, string> = {
  cv: "Koefisien variasi",
  luasKm2: "Luas wilayah",
  penduduk: "Jumlah penduduk",
  sekolah: "Jumlah sekolah",
  peta: "Batas wilayah (peta)",
};
const label = (key: string) => INDICATORS[key]?.label ?? EXTRA_LABELS[key] ?? key;

export default function TentangPage() {
  const { meta, clusters } = getData();
  const d = meta.dataset;
  const defs = Object.entries(meta.definisi);

  return (
    <>
      <PageHeader
        eyebrow="Tentang Data"
        title="Sumber, metode, dan keterbatasan"
        finding={`Semua angka berasal dari publikasi resmi BPS, diakses ${fmtTanggal(meta.diaksesPada)}. Tidak ada data yang dikarang atau diperkirakan.`}
      />

      <p className="text-sm text-[#52514e]">
        Karya untuk{" "}
        <span className="font-medium text-foreground">AI &amp; Coding Dashboard Challenge 2026</span>{" "}
        (Festival &amp; Expo Sains Data Nasional, UIN Raden Intan Lampung), subtema{" "}
        <span className="font-medium text-foreground">Pendidikan</span>, oleh tim{" "}
        <span className="font-medium text-foreground">KomitPNL</span> dari Politeknik Negeri Lhokseumawe.
      </p>

      <Section title="Dataset">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Periode", d.periode],
            ["Cakupan", `${d.jumlahWilayah} kab/kota + provinsi`],
            [
              "Jumlah data panel",
              `${fmtInt(d.jumlahBarisPanel)} baris · ${fmtInt(d.jumlahNilaiTerisi)} nilai`,
            ],
            ["Tahun analisis penampang", String(d.tahunPenampang)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-card p-4">
              <dt className="text-xs font-medium text-[#6f6e68]">{k}</dt>
              <dd className="mt-1 text-base font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-[#52514e]">
          <span className="font-medium text-foreground">Variabel:</span>{" "}
          {d.variabel.map((v) => label(v)).join(" · ")}.
        </p>
        <div>
          <a
            href="/data/panel.csv"
            download
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background hover:bg-foreground/85"
          >
            <DownloadIcon className="size-4" aria-hidden />
            Unduh data panel bersih (CSV)
          </a>
        </div>
      </Section>

      <Section title="Sumber data">
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sumber</TableHead>
                <TableHead>Variabel</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Berkas mentah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meta.sumber.map((s) => (
                <TableRow key={s.berkas} className="align-top">
                  <TableCell className="min-w-56 whitespace-normal">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline underline-offset-4"
                    >
                      {s.nama}
                    </a>
                  </TableCell>
                  <TableCell className="min-w-40 whitespace-normal">
                    {s.variabel.map((v) => INDICATORS[v]?.short ?? EXTRA_LABELS[v] ?? v).join(", ")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{s.periode}</TableCell>
                  <TableCell className="font-mono text-xs break-all whitespace-normal text-[#52514e]">
                    {s.berkas}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Definisi indikator">
        <dl className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {defs.map(([k, v]) => (
            <div key={k} className="text-sm">
              <dt className="font-semibold">{EXTRA_LABELS[k] ?? label(k)}</dt>
              <dd className="mt-0.5 leading-relaxed text-[#52514e]">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Metode">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            <span className="font-medium">Ketimpangan.</span> {meta.metode.disparitas}
          </li>
          <li>
            <span className="font-medium">Korelasi.</span> {meta.metode.korelasi}
          </li>
          <li>
            <span className="font-medium">Tipologi.</span> {meta.metode.clustering}
          </li>
          <li>
            <span className="font-medium">Peringkat.</span> {meta.metode.peringkat}
          </li>
        </ul>
        <div className="max-w-xl rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jumlah tipe (k)</TableHead>
                <TableHead className="text-right">Skor siluet</TableHead>
                <TableHead className="text-right">Kesesuaian dengan Ward (ARI)</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {meta.metode.evaluasiK.map((e) => (
                <TableRow key={e.k}>
                  <TableCell className="font-medium">{e.k}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(e.silhouette, 3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(e.ariWard, 2)}</TableCell>
                  <TableCell>{e.k === meta.metode.kTerpilih ? <Badge>dipilih</Badge> : null}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-[#52514e]">
          Hasil: {clusters.length} tipe, yaitu{" "}
          {clusters.map((c) => `${c.nama} (${c.anggota.length})`).join("; ")}.
        </p>
      </Section>

      <Section title="Keterbatasan">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {meta.keterbatasan.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </Section>

      <Section title="Pernyataan penggunaan AI (AI Assistance Disclosure)">
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No.</TableHead>
                <TableHead>Tools AI</TableHead>
                <TableHead>Tujuan penggunaan</TableHead>
                <TableHead>Bagian karya yang terkait</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meta.aiDisclosure.map((a, i) => (
                <TableRow key={i} className="align-top">
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="whitespace-nowrap">{a.alat}</TableCell>
                  <TableCell className="min-w-56 whitespace-normal">{a.tujuan}</TableCell>
                  <TableCell className="min-w-56 whitespace-normal">{a.bagian}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-sm text-[#52514e]">
          <p className="font-medium text-foreground">Cara tim memeriksa hasil kerja AI:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 leading-relaxed">
            {meta.verifikasiAi.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="mt-2">
            Semua olah data dapat dijalankan ulang dari berkas mentah lewat skrip di folder{" "}
            <code className="font-mono text-xs">analysis/</code>.
          </p>
        </div>
      </Section>

      <SourceFooter meta={meta} />
    </>
  );
}
