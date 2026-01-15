const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const photosPath = path.join(process.cwd(), "data", "photos.json");
const photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));

function needsAutoTitle(title) {
  return /^img[_\- ]?\d+/i.test(title) || (title || "").length < 3;
}

function generateAutoTitle({ title, location, category, takenAt }) {
  const base = (location || category || title || "Photo").split(",")[0].trim();
  const clean = base.replace(/\s+/g, " ").trim();
  const shortDate = takenAt ? new Date(takenAt).toISOString().slice(0, 10) : "";
  const suffix = crypto.randomBytes(2).toString("hex");
  return [clean || "Photo", shortDate, suffix].filter(Boolean).join(" • ");
}

let updated = 0;
for (const photo of photos) {
  if (needsAutoTitle(photo.title)) {
    const old = photo.title;
    photo.title = generateAutoTitle({
      title: photo.title,
      location: photo.location,
      category: photo.category,
      takenAt: photo.takenAt,
    });
    updated++;
    console.log(`✓ ${old} → ${photo.title}`);
  }
}

if (updated > 0) {
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
  console.log(`\n✅ Retitled ${updated} photos.`);
} else {
  console.log("\n✅ All photo titles already look good.");
}

