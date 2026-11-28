import type { NextConfig } from "next";

// Alamat dasar situs. Kosong untuk lokal / Vercel; "/paradoks-mesuji" untuk GitHub Pages
// (diset oleh workflow .github/workflows/pages.yml).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
