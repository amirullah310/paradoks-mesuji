// Blok tampilan bersama: kartu grafik, kartu KPI, callout insight, header halaman.
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { TIDAK_TERSEDIA } from "@/lib/format";
import type { Insight } from "@/lib/types";

export function PageHeader({ eyebrow, title, finding }: { eyebrow: string; title: string; finding: string }) {
  return (
    <header className="flex flex-col gap-2">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{eyebrow}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
      <p className="max-w-3xl text-base text-pretty text-[#52514e] sm:text-lg">{finding}</p>
    </header>
  );
}

/** Kartu grafik: judul berupa kalimat temuan, subjudul berisi variabel/satuan/tahun. */
export function ChartCard({
  title,
  subtitle,
  children,
  note,
  actions,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-base leading-snug font-semibold text-balance sm:text-lg">{title}</h2>
          {subtitle ? <p className="text-sm text-[#6f6e68]">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="min-w-0">{children}</div>
      {note ? <div className="text-xs leading-relaxed text-[#6f6e68]">{note}</div> : null}
    </section>
  );
}

export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-[#6f6e68]">{label}</p>
      <p
        className={`font-semibold tracking-tight tabular-nums ${
          value === TIDAK_TERSEDIA ? "text-base text-[#6f6e68]" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="truncate text-sm text-[#52514e]">{sub}</p> : null}
    </div>
  );
}

export function InsightCallout({ insight }: { insight: Insight }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Insight {insight.id.replace("I", "")}</Badge>
      </div>
      <p className="text-xl font-semibold tracking-tight tabular-nums">{insight.angka}</p>
      <h3 className="text-base leading-snug font-semibold text-balance">{insight.judul}</h3>
      <p className="text-sm leading-relaxed text-[#52514e]">{insight.teks}</p>
    </article>
  );
}

export function InsightGrid({ insights, title = "Temuan utama" }: { insights: Insight[]; title?: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insights.map((i) => (
          <InsightCallout key={i.id} insight={i} />
        ))}
      </div>
    </section>
  );
}

/** Legenda garis: selalu ada bila lebih dari satu seri. */
export function LegendRow({
  items,
}: {
  items: { label: string; color: string; kind?: "line" | "dashed" | "dot" | "swatch" }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#52514e]">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          {it.kind === "dashed" ? (
            <span aria-hidden className="w-5 border-t-2 border-dashed" style={{ borderColor: it.color }} />
          ) : it.kind === "dot" ? (
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: it.color }} />
          ) : it.kind === "swatch" ? (
            <span aria-hidden className="size-3 rounded-sm" style={{ background: it.color }} />
          ) : (
            <span aria-hidden className="h-0.5 w-5 rounded" style={{ background: it.color }} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}
