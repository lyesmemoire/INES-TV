/**
 * 🗺️ NUMERIC GEO MAPPING (Google-Grade Optimization)
 * Transforms string Geos into 8-bit integers for high-speed array indexing.
 */
export const GEO_MAP = {
  DZ: 0,
  MA: 1,
  TN: 2,
  US: 3,
  EU: 4,
  OTHER: 5
} as const;

export type GeoIndex = typeof GEO_MAP[keyof typeof GEO_MAP];

export const GEO_WEIGHTS_ARRAY = new Float64Array([
  0.8, // DZ
  1.0, // MA
  1.1, // TN
  2.2, // US
  1.5, // EU
  1.0  // OTHER
]);

export function getGeoIndex(geo: string): GeoIndex {
  return (GEO_MAP[geo as keyof typeof GEO_MAP] ?? GEO_MAP.OTHER) as GeoIndex;
}
