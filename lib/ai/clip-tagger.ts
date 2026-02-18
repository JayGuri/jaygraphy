import { pipeline } from '@xenova/transformers'

// Photography-specific label database
// CLIP will compare each image against these descriptions
const PHOTOGRAPHY_LABELS = {
  // Primary category classification
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
  
  // Lighting quality detection
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
    'studio lighting with controlled setup'
  ],
  
  // Composition techniques
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
    'dutch angle with tilted horizon'
  ],
  
  // Mood and atmosphere
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
  
  // Subject matter
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
}

let clipClassifier: any = null

export async function analyzeWithCLIP(imagePath: string) {
  // Lazy-load the CLIP model (downloads ~350MB on first run)
  if (!clipClassifier) {
    console.log('Loading CLIP model (first run will download ~350MB)...')
    clipClassifier = await pipeline(
      'zero-shot-image-classification',
      'Xenova/clip-vit-base-patch32'
    )
    console.log('CLIP model loaded successfully')
  }

  const results = {
    category: '',
    tags: [] as string[],
    lighting: '',
    composition: [] as string[],
    mood: '',
    subjects: [] as string[],
    confidence: {} as Record<string, number>
  }

  try {
    // Category detection (single-label, take top match)
    const categoryScores = await clipClassifier(imagePath, PHOTOGRAPHY_LABELS.categories)
    results.category = extractKeyword(categoryScores[0].label)
    results.confidence.category = categoryScores[0].score

    // Lighting detection (single-label, top match)
    const lightingScores = await clipClassifier(imagePath, PHOTOGRAPHY_LABELS.lighting)
    results.lighting = extractKeyword(lightingScores[0].label)
    results.confidence.lighting = lightingScores[0].score

    // Composition detection (multi-label, threshold > 0.25)
    const compositionScores = await clipClassifier(imagePath, PHOTOGRAPHY_LABELS.composition)
    results.composition = compositionScores
      .filter((s: any) => s.score > 0.25)
      .slice(0, 3) // max 3 composition techniques
      .map((s: any) => extractKeyword(s.label))

    // Mood detection (single-label, top match)
    const moodScores = await clipClassifier(imagePath, PHOTOGRAPHY_LABELS.mood)
    results.mood = extractKeyword(moodScores[0].label)
    results.confidence.mood = moodScores[0].score

    // Subject detection (multi-label, threshold > 0.35)
    const subjectScores = await clipClassifier(imagePath, PHOTOGRAPHY_LABELS.subjects)
    results.subjects = subjectScores
      .filter((s: any) => s.score > 0.35)
      .slice(0, 4) // max 4 subjects
      .map((s: any) => extractKeyword(s.label))

    // Build final tag list
    results.tags = [
      results.category,
      results.lighting,
      results.mood,
      ...results.composition,
      ...results.subjects
    ].filter(Boolean)

    return results
  } catch (error) {
    console.error('CLIP analysis failed:', error)
    // Return minimal fallback
    return {
      category: 'other',
      tags: ['unclassified'],
      lighting: 'unknown',
      composition: [],
      mood: 'neutral',
      subjects: [],
      confidence: {}
    }
  }
}

// Helper: Extract the key photography term from a full label
// "golden hour lighting with warm sunset tones" → "golden-hour"
// "street photography in an urban environment" → "street"
// "dramatic lighting with high contrast shadows" → "dramatic"
function extractKeyword(label: string): string {
  // Split on common descriptor separators
  const parts = label.split(/\s+(?:with|showing|of|in|focusing|documenting|like)\s+/)
  let mainPart = parts[0].trim()

  // Handle compound terms: keep first 1-2 significant words
  const words = mainPart.split(/\s+/)

  // If it's already short (1-2 words), keep as-is
  if (words.length <= 2) {
    mainPart = words.join(' ')
  } else {
    // For longer phrases, intelligently extract the key term
    // Remove filler words at the start
    const filtered = words.filter(w =>
      !['photography', 'composition', 'lighting', 'subject', 'subjects'].includes(
        w.toLowerCase()
      )
    )

    // Take first 1-2 meaningful words
    mainPart = filtered.slice(0, 2).join(' ')

    // If nothing left after filtering, fall back to first 2 words
    if (filtered.length === 0) {
      mainPart = words.slice(0, 2).join(' ')
    }
  }

  // Convert to kebab-case tag and clean up
  return mainPart
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-(and|or)$/, '') // Remove trailing -and or -or
    .replace(/^(and|or)-/, '') // Remove leading and- or or-
}

