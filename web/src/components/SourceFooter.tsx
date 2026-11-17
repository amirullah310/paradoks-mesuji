import Link from "next/link";
import { fmtTanggal } from "@/lib/format";
import type { Meta } from "@/lib/types";

/** Footer tiap halaman: sumber data, periode, tanggal akses, tautan ke Tentang Data. */
export default function SourceFooter({ meta }: { meta: Meta }) {
  const lembaga = [
    ...new Set(
      meta.sumber.map((s) =>
        s.nama.startsWith("BPS Provinsi")
          ? "BPS Provinsi Lampung"
          : s.nama.startsWith("BPS")
            ? "Badan Pusat Statistik (BPS)"
            : s.nama.split(" – ")[0].split(" (")[0],
      ),
    ),
  ];
  return (
    <footer className="mt-4 border-t pt-5 pb-10 text-sm text-[#52514e]">
      <p>
        <strong className="font-semibold text-foreground">Sumber data:</strong> {lembaga.join(" · ")}.
      </p>
      <p className="mt-1">
        Periode {meta.dataset.periode} · {meta.dataset.jumlahWilayah} kabupaten/kota · diakses{" "}
        {fmtTanggal(meta.diaksesPada)} ·{" "}
        <Link href="/tentang/" className="font-medium text-foreground underline underline-offset-4">
          Tentang Data, metode, dan keterbatasan
        </Link>
      </p>
      <p className="mt-1 text-xs text-[#6f6e68]">
        Hanya data agregat resmi; tidak ada data sintetis. Hasil bersifat korelasional (n ={" "}
        {meta.dataset.jumlahWilayah}), bukan bukti sebab-akibat.
      </p>
    </footer>
  );
}
