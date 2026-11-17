import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/blocks";
import SourceFooter from "@/components/SourceFooter";
import ParadoksView from "@/components/views/ParadoksView";
import { getData } from "@/lib/data";

export const metadata: Metadata = { title: "Paradoks" };

export default function ParadoksPage() {
  const { panel, regions, correlations, insights, meta } = getData();
  const page = insights.filter((i) => i.halaman === 2);
  const i5 = page.find((i) => i.id === "I5") ?? page[1];

  return (
    <>
      <PageHeader
        eyebrow="Halaman 2 · Paradoks"
        title="Mengapa daerah dengan kemiskinan terendah punya pendidikan terendah?"
        finding={`${page[0].judul} (${page[0].angka}). ${i5.judul}.`}
      />
      <Suspense>
        <ParadoksView
          panel={panel}
          regions={regions}
          correlations={correlations}
          insights={page}
          hipotesis={meta.hipotesis}
        />
      </Suspense>
      <SourceFooter meta={meta} />
    </>
  );
}
