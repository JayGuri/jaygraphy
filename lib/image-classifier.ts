import type { Photo } from "@/types/photo";
import { pipeline, env } from "@xenova/transformers";

type Category = Photo["category"];

// Use local cache folder under .cache/transformers (default) to avoid reinstall
env.allowLocalModels = true;
env.backends.onnx.wasm.wasmPaths = undefined;
env.backends.onnx.wasm.numThreads = 1;

let classifierPromise: Promise<any> | null = null;
async function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline("image-classification", "Xenova/vit-base-patch16-224", {
      quantized: true,
    });
  }
  return classifierPromise;
}
function mapLabelsToCategory(labels: string[]): Category {
  const labelStr = labels.join(" ").toLowerCase();

  const includesAny = (keywords: string[]) =>
    keywords.some((k) => labelStr.includes(k));

  const wildlife = [
    "bird",
    "duck",
    "goose",
    "swan",
    "eagle",
    "hawk",
    "owl",
    "animal",
    "mammal",
    "dog",
    "cat",
    "fox",
    "wolf",
    "bear",
    "deer",
    "horse",
    "cow",
    "sheep",
    "goat",
    "monkey",
    "penguin",
    "fish",
    "insect",
    "butterfly",
    "dragonfly",
    "lizard",
    "reptile",
    "snake",
    "turtle",
    "frog",
    "toad",
    "crocodile",
    "alligator",
    "iguana",
    "chameleon"
  ];

  const portrait = [
    "person",
    "people",
    "man",
    "woman",
    "girl",
    "boy",
    "face",
    "portrait",
    "selfie",
    "bride",
    "groom",
    "hair",
    "wig",
    "mask",
    "sunglasses"
  ];

  const nature = [
    "mountain",
    "valley",
    "waterfall",
    "river",
    "lake",
    "sea",
    "ocean",
    "beach",
    "forest",
    "tree",
    "woodland",
    "flower",
    "plant",
    "sky",
    "cloud",
    "desert",
    "hill",
    "cliff",
    "rock",
    "glacier",
    "bay",
    "grass",
    "park",
    "garden",
    "sun",
    "moon",
    "volcano"
  ];

  const street = [
    "street",
    "road",
    "city",
    "urban",
    "traffic",
    "car",
    "bus",
    "bicycle",
    "building",
    "skyscraper",
    "bridge",
    "sidewalk",
    "crosswalk",
    "plaza",
    "market",
    "station",
    "train",
    "metro",
    "shop",
    "store",
    "neon",
    "night",
    "light"
  ];

  const culture = [
    "statue",
    "sculpture",
    "art",
    "painting",
    "graffiti",
    "mural",
    "lantern",
    "dragon",
    "temple",
    "shrine",
    "church",
    "mosque",
    "castle",
    "palace",
    "festival",
    "parade",
    "costume",
    "dance",
    "music",
    "instrument",
    "stage",
    "theater",
    "cinema",
    "museum",
    "gallery",
    "monument",
    "balloon" // Often culturally related (hot air balloons) or festive
  ];

  if (includesAny(wildlife)) return "Wildlife";
  if (includesAny(portrait)) return "Portrait";
  if (includesAny(nature)) return "Nature";
  if (includesAny(street)) return "Street";
  if (includesAny(culture)) return "Culture"; // New category

  // Fallback
  return "Travel";
}

export async function classifyImage(
  imagePath: string
): Promise<{ category: Category; tags: string[]; confidence?: number }> {
  const classify = await getClassifier();
  const predictions = await classify(imagePath, { topk: 3 });

  const tags = predictions
    .slice(0, 3)
    .map((p: { label: string }) => p.label.toLowerCase().trim());

  const category = mapLabelsToCategory(tags);
  const confidence = predictions[0]?.score;

  return { category, tags, confidence };
}

