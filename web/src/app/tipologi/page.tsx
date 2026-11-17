import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/blocks";
import SourceFooter from "@/components/SourceFooter";
import TipologiView from "@/components/views/TipologiView";
import { getData, getGeo } from "@/lib/data";

export const metadata: Metadata = { title: "Tipologi & Solusi" };

export default function TipologiPage() {
  const { panel, regions, clusters, insights, meta } = getData();
  const geo = getGeo();
  const tahun = meta.dataset.tahunPenampang;
  const lead = insights.find((i) => i.halaman === 3)!;

  return (
    <>
      <PageHeader
        eyebrow="Halaman 3 · Tipologi & Solusi"
        title="Satu resep tidak cocok untuk semua daerah"
        finding={`${lead.judul}. Tiap tipe daerah membutuhkan intervensi yang berbeda.`}
      />
      <Suspense>
        <TipologiView
          regions={regions}
          clusters={clusters}
          insights={insights}
          crossRows={panel.filter((r) => r.tahun === tahun)}
          vars={meta.metode.variabelCluster}
          tahun={tahun}
          geo={geo}
        />
      </Suspense>
      <SourceFooter meta={meta} />
    </>
  );
}
