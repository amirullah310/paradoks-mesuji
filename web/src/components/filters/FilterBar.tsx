import type { ReactNode } from "react";

/** Satu baris filter di atas grafik; menempel saat digulir di layar lebar. */
export default function FilterBar({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Filter"
      className="z-30 -mx-4 border-y bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border lg:sticky lg:top-16"
    >
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">{children}</div>
    </section>
  );
}
