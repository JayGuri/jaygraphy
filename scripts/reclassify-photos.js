const fs = require("fs");
const path = require("path");
const { pipeline, env } = require("@xenova/transformers");

env.allowLocalModels = true;
env.backends.onnx.wasm.numThreads = 1;

const photosPath = path.join(process.cwd(), "data", "photos.json");
const publicPhotosDir = path.join(process.cwd(), "public", "photos");

let classifierPromise = null;
async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline("image-classification", "Xenova/vit-base-patch16-224", {
      quantized: true,
    });
  }
  return classifierPromise;
}

function mapLabelsToCategory(labels) {
  const labelStr = labels.join(" ").toLowerCase();
  const includesAny = (arr) => arr.some((k) => labelStr.includes(k));

  const wildlife = ["bird","duck","goose","swan","eagle","hawk","owl","animal","mammal","dog","cat","fox","wolf","bear","deer","horse","cow","sheep","goat","monkey","penguin","fish","insect","butterfly"];
  const portrait = ["person","people","man","woman","girl","boy","face","portrait","selfie","bride","groom"];
  const nature = ["mountain","valley","waterfall","river","lake","sea","ocean","beach","forest","tree","woodland","flower","plant","sky","cloud","desert","hill","cliff","rock","glacier","bay"];
  const street = ["street","road","city","urban","traffic","car","bus","bicycle","building","skyscraper","bridge","sidewalk","crosswalk","plaza","market","station"];

  if (includesAny(wildlife)) return "Wildlife";
  if (includesAny(portrait)) return "Portrait";
  if (includesAny(nature)) return "Nature";
  if (includesAny(street)) return "Street";
  return "Travel";
}

async function classifyImage(imagePath) {
  const classify = await getClassifier();
  const preds = await classify(imagePath, { topk: 3 });
  const tags = preds.slice(0, 3).map((p) => p.label.toLowerCase().trim());
  const category = mapLabelsToCategory(tags);
  return { category, tags };
}

(async () => {
  const photos = JSON.parse(fs.readFileSync(photosPath, "utf8"));
  let updated = 0;

  for (const photo of photos) {
    const filename = photo.src?.split("/").pop();
    if (!filename) continue;

    const fullPath = path.join(publicPhotosDir, filename);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Skipping missing file: ${fullPath}`);
      continue;
    }

    try {
      const { category, tags } = await classifyImage(fullPath);
      photo.category = category;
      photo.tags = tags;
      updated++;
      console.log(`✓ ${photo.title} → ${category} (${tags.join(", ")})`);
    } catch (err) {
      console.warn(`Classification failed for ${photo.title}:`, err.message);
    }
  }

  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
  console.log(`\n✅ Reclassified ${updated} photos.`);
})();

