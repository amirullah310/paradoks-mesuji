// Baca + validasi JSON hasil pipeline saat build (hanya dipakai server component).
import { readFileSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import {
  clustersSchema,
  correlationsSchema,
  disparitySchema,
  geoSchema,
  insightsSchema,
  metaSchema,
  panelSchema,
  regionsSchema,
} from "./schema";
import type {
  Cluster,
  Correlations,
  Disparity,
  GeoFeatureCollection,
  Insight,
  Meta,
  PanelRow,
  Region,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function load<T>(file: string, schema: z.ZodType): T {
  const raw: unknown = JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf-8"));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Data ${file} tidak sesuai kontrak:\n${parsed.error.message}`);
  }
  return parsed.data as T;
}

export interface SiteData {
  panel: PanelRow[];
  regions: Region[];
  correlations: Correlations;
  clusters: Cluster[];
  disparity: Disparity[];
  insights: Insight[];
  meta: Meta;
}

let cache: SiteData | null = null;

export function getData(): SiteData {
  if (cache) return cache;
  const data: SiteData = {
    panel: load<PanelRow[]>("panel.json", panelSchema),
    regions: load<Region[]>("regions.json", regionsSchema),
    correlations: load<Correlations>("correlations.json", correlationsSchema),
    clusters: load<Cluster[]>("clusters.json", clustersSchema),
    disparity: load<Disparity[]>("disparity.json", disparitySchema),
    insights: load<Insight[]>("insights.json", insightsSchema),
    meta: load<Meta>("meta.json", metaSchema),
  };

  // Pemeriksaan silang antarfile
  const kodes = new Set(data.regions.map((r) => r.kode));
  const insightIds = new Set(data.insights.map((i) => i.id));
  const clusterIds = new Set(data.clusters.map((c) => c.id));
  for (const c of data.clusters) {
    for (const k of c.anggota) {
      if (!kodes.has(k)) throw new Error(`clusters.json: kode ${k} tidak dikenal`);
    }
    for (const r of c.rekomendasi) {
      if (!insightIds.has(r.insightId)) {
        throw new Error(`clusters.json: insight ${r.insightId} tidak ada`);
      }
    }
  }
  for (const r of data.regions) {
    if (!clusterIds.has(r.clusterId)) {
      throw new Error(`regions.json: cluster ${r.clusterId} tidak ada`);
    }
  }
  const n = data.correlations.vars.length;
  if (data.correlations.rho.length !== n || data.correlations.p.length !== n) {
    throw new Error("correlations.json: ukuran matriks tidak cocok dengan vars");
  }

  cache = data;
  return data;
}

export function getGeo(): GeoFeatureCollection {
  return load<GeoFeatureCollection>("lampung_kabkota.geojson", geoSchema);
}
