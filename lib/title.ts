export function needsAutoTitle(title: string) {
  return /^img[_\- ]?\d+/i.test(title) || title.length < 3;
}

const removeNoise = (value: string) =>
  value
    // Drop common random suffixes / hashes / numeric ids
    .replace(/\b[0-9a-f]{4,}\b/gi, "")
    .replace(/\b\d{3,}\b/g, "")
    .replace(/[•|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function cleanPhotoTitle(
  rawTitle: string,
  opts: { location?: string; category?: string } = {}
) {
  const { location, category } = opts;
  const firstPiece = rawTitle?.split("•")[0] ?? rawTitle;
  const sanitized = removeNoise(firstPiece || "");

  const fallback = removeNoise(location?.split(",")[0] || "") || category || "Untitled frame";
  const base = sanitized.length > 2 ? sanitized : fallback;

  return base;
}

export function generateAutoTitle(opts: {
  title?: string;
  location?: string;
  category?: string;
  takenAt?: string;
}) {
  const { title = "", location, category } = opts;
  return cleanPhotoTitle(title, { location, category });
}

