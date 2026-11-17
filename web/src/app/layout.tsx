import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Paradoks Mesuji · Ketimpangan Pendidikan Lampung",
    template: "%s · Paradoks Mesuji",
  },
  description:
    "Dashboard ketimpangan pendidikan 15 kabupaten/kota di Lampung: mengapa kemiskinan rendah tidak otomatis berarti pendidikan baik, dan intervensi apa yang cocok untuk tiap tipe daerah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NuqsAdapter>
          <a
            href="#konten"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
          >
            Lewati ke konten
          </a>
          <Suspense fallback={<div className="h-14 border-b" />}>
            <SiteHeader />
          </Suspense>
          <main id="konten" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-8">
            {children}
          </main>
        </NuqsAdapter>
      </body>
    </html>
  );
}
