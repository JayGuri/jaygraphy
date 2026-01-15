import crypto from "crypto";

export function needsAutoTitle(title: string) {
  return /^img[_\- ]?\d+/i.test(title) || title.length < 3;
}

export function generateAutoTitle(opts: {
  title?: string;
  location?: string;
  category?: string;
  takenAt?: string;
}) {
  const { title, location, category, takenAt } = opts;
  const slugPart = (location || category || title || "Photo")
    .split(",")[0]
    .trim();
  const clean = slugPart.replace(/\s+/g, " ").trim();
  const shortDate = takenAt ? new Date(takenAt).toISOString().slice(0, 10) : "";
  const suffix = crypto.randomBytes(2).toString("hex");
  return [clean || "Photo", shortDate, suffix].filter(Boolean).join(" • ");
}

