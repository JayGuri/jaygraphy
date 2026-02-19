import path from 'path';
import fs from 'fs';
import { pipeline } from '@xenova/transformers';

const PHOTOGRAPHY_LABELS = {
  categories: [
    'street photography in an urban environment',
    'nature landscape with mountains or forests',
    'portrait photography focusing on a person',
    'cityscape showing buildings and architecture',
    'wildlife photography of animals in their habitat',
    'minimalist composition with negative space',
    'travel photography documenting a destination',
    'architectural photography of structures',
    'food photography of meals or ingredients'
  ],
  lighting: [
    'golden hour lighting with warm sunset tones',
    'blue hour lighting with cool twilight tones',
    'harsh midday sunlight with strong shadows',
    'soft diffused lighting from overcast sky',
    'night photography with artificial city lights',
    'backlit subject with rim lighting effect',
    'dramatic lighting with high contrast shadows',
    'flat even lighting with minimal shadows',
    'dappled light filtering through trees',
  ],
  composition: [
    'rule of thirds composition',
    'symmetrical composition with mirror balance',
    'leading lines drawing eye into the frame',
    'frame within a frame composition',
    'negative space with minimalist subject placement',
    'diagonal lines creating dynamic energy',
    'centered subject with radial balance',
    'foreground interest with layered depth',
    'pattern and repetition composition',
  ],
  mood: [
    'energetic and vibrant atmosphere',
    'serene and peaceful quiet mood',
    'dramatic and intense emotional feeling',
    'nostalgic vintage aesthetic tone',
    'gritty urban documentary raw style',
    'ethereal and dreamlike soft quality',
    'melancholic and contemplative somber tone',
    'joyful and celebratory happy mood',
    'mysterious and moody dark atmosphere',
    'clean and modern minimalist feel'
  ],
  subjects: [
    'people and human subjects in the scene',
    'architectural details and building structures',
    'natural landscape elements like mountains or water',
    'street vendors and market scenes',
    'transportation vehicles like cars or trains',
    'cultural landmarks and monuments',
    'wildlife animals and birds',
    'urban street scenes with city life',
    'food and culinary subjects',
    'abstract patterns and textures'
  ]
};

function extractKeyword(label: string): string {
  const parts = label.split(/\s+(?:with|showing|of|in|focusing|documenting|like)\s+/);
  let mainPart = parts[0].trim();
  const words = mainPart.split(/\s+/);
  if (words.length <= 2) {
    mainPart = words.join(' ');
  } else {
    const filtered = words.filter(w =>
      !['photography', 'composition', 'lighting', 'subject', 'subjects'].includes(w.toLowerCase())
    );
    mainPart = filtered.slice(0, 2).join(' ');
    if (filtered.length === 0) mainPart = words.slice(0, 2).join(' ');
  }
  return mainPart.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-(and|or)$/, '').replace(/^(and|or)-/, '');
}

async function run() {
  const photosJsonPath = path.join(process.cwd(), 'data', 'photos.json');
  const photos: any[] = JSON.parse(fs.readFileSync(photosJsonPath, 'utf8'));

  console.log(`Loading CLIP model (may download ~350MB on first run)...`);
  const classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
  console.log(`CLIP loaded. Processing ${photos.length} photos...`);

  let processed = 0;
  let failed = 0;

  for (const photo of photos) {
    const filename = photo.src.replace('/photos/', '');
    const filePath = path.join(process.cwd(), 'public', 'photos', filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`SKIP (not found): ${filename}`);
      failed++;
      continue;
    }

    try {
      // Category
      const catScores = await classifier(filePath, PHOTOGRAPHY_LABELS.categories) as any[];
      const category = extractKeyword(catScores[0].label);

      // Lighting
      const lightScores = await classifier(filePath, PHOTOGRAPHY_LABELS.lighting) as any[];
      const lighting = extractKeyword(lightScores[0].label);

      // Composition
      const compScores = await classifier(filePath, PHOTOGRAPHY_LABELS.composition) as any[];
      const composition = (compScores as any[]).filter(s => s.score > 0.25).slice(0, 3).map((s: any) => extractKeyword(s.label));

      // Mood
      const moodScores = await classifier(filePath, PHOTOGRAPHY_LABELS.mood) as any[];
      const mood = extractKeyword((moodScores as any[])[0].label);

      // Subjects
      const subjectScores = await classifier(filePath, PHOTOGRAPHY_LABELS.subjects) as any[];
      const subjects = (subjectScores as any[]).filter(s => s.score > 0.30).slice(0, 4).map((s: any) => extractKeyword(s.label));

      const tags = [category, lighting, mood, ...composition, ...subjects].filter(Boolean);
      // Deduplicate
      const uniqueTags = [...new Set(tags)];

      photo.category = category;
      photo.tags = uniqueTags;

      processed++;
      console.log(`[${processed}/${photos.length}] ${filename.split('-').pop()} → ${category} | ${uniqueTags.slice(0,4).join(', ')}`);
    } catch (e: any) {
      console.error(`ERROR processing ${filename}: ${e.message}`);
      failed++;
    }
  }

  fs.writeFileSync(photosJsonPath, JSON.stringify(photos, null, 2), 'utf8');
  console.log(`\nDone. Processed: ${processed} | Failed: ${failed}`);
}

run().catch(console.error);
