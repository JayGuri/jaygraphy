import { Photo } from "@/types/photo";

export type SeriesSlug =
  | "niagara"
  | "bruce"
  | "montreal"
  | "toronto"
  | "goa"
  | "kerala"
  | "bhuj"
  | "quebec"
  | "etobicoke";

export const SERIES_META: Array<{ slug: SeriesSlug; label: string; keywords: string[] }> = [
  { slug: "niagara", label: "Niagara Falls", keywords: ["niagara"] },
  { slug: "bruce", label: "Bruce Peninsula", keywords: ["bruce", "grotto", "tobermory"] },
  { slug: "montreal", label: "Montreal", keywords: ["montreal", "mtl"] },
  { slug: "toronto", label: "Toronto", keywords: ["toronto", "etobicoke", "ontario place"] },
  { slug: "goa", label: "Goa", keywords: ["goa"] },
  { slug: "kerala", label: "Kerala", keywords: ["kerala", "munnar", "vagamon"] },
  { slug: "bhuj", label: "Bhuj", keywords: ["bhuj", "kachchh", "kutch"] },
  { slug: "quebec", label: "Quebec", keywords: ["quebec", "qc", "old quebec", "quebec city"] },
  { slug: "etobicoke", label: "Etobicoke", keywords: ["etobicoke"] },
];

export const SERIES_ORDER = SERIES_META.map((s) => s.slug);

export function inferSeries(photo: Photo): SeriesSlug | string | undefined {
  const haystack = `${photo.series || ""} ${photo.location || ""} ${(photo.tags || []).join(" ")}`.toLowerCase();
  const hit = SERIES_META.find((meta) => meta.keywords.some((kw) => haystack.includes(kw)));
  return hit?.slug || photo.series;
}

export function getSeriesLabel(slug?: string | null) {
  if (!slug) return "";
  return SERIES_META.find((s) => s.slug === slug)?.label ?? slug;
}

export function getSeriesOptions(photos: Photo[]) {
  const derived = new Set<string>();
  photos.forEach((photo) => {
    const s = inferSeries(photo);
    if (s) derived.add(s.toString().toLowerCase());
  });
  return ["all", ...Array.from(derived)];
}
