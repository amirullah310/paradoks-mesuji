"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV = [
  { href: "/", label: "1. Masalah" },
  { href: "/paradoks/", label: "2. Paradoks" },
  { href: "/tipologi/", label: "3. Tipologi & Solusi" },
  { href: "/tentang/", label: "Tentang Data" },
];

const KEEP = ["tahun", "wilayah"]; // filter global ikut berpindah halaman

function normalize(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

export default function SiteHeader() {
  const pathname = normalize(usePathname());
  const params = useSearchParams();
  const kept = new URLSearchParams();
  for (const k of KEEP) {
    const v = params.get(k);
    if (v) kept.set(k, v);
  }
  const qs = kept.toString();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href={qs ? `/?${qs}` : "/"} className="shrink-0 text-sm font-semibold tracking-tight">
          Paradoks Mesuji
        </Link>
        <nav
          aria-label="Halaman"
          className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 sm:justify-end"
        >
          {NAV.map((item) => {
            const active = pathname === normalize(item.href);
            return (
              <Link
                key={item.href}
                href={qs ? `${item.href}?${qs}` : item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-foreground font-medium text-background"
                    : "text-[#52514e] hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
