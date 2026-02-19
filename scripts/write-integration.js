const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..');

const pi = `import { analyzeWithCLIP } from './clip-tagger'
import { analyzeDepth, getDepthTags } from './depth-analyzer'
import { inferShootingContext, getPrimaryExifTags } from './exif-context-engine'
import { getLocationTags } from '@/lib/location-tags'
import { Photo } from '@/types/photo'

export interface PhotoIntelligenceResult {
  category: string
  tags: string[]
  metadata: {
    lighting: string
    mood: string
    composition: {
      techniques: string[]
      depthOfField: string
      hasLayering: boolean
    }
  }
  confidence: {
    category: number
    lighting: number
    mood: number
  }
}

export async function analyzePhoto(
  imagePath: string,
  photo: Partial<Photo>
): Promise<PhotoIntelligenceResult> {
  console.log('[AI] Starting photo intelligence analysis...')

  try {
    console.log('[AI] Running CLIP and Depth analysis in parallel...')
    const [clipResults, depthResults] = await Promise.all([
      analyzeWithCLIP(imagePath),
      analyzeDepth(imagePath),
    ])

    console.log('[AI] \u2713 CLIP complete: ' + clipResults.category)
    console.log('[AI] \u2713 Depth complete: ' + depthResults.depthOfField)

    let primaryExifTags: string[] = []
    if (photo.exif && photo.exif.focalLength) {
      const exifTags = inferShootingContext(photo as Photo)
      primaryExifTags = getPrimaryExifTags(exifTags)
      console.log('[AI] \u2713 EXIF tags generated: ' + primaryExifTags.length)
    } else {
      console.log('[AI] \u26a0 No EXIF data available, skipping EXIF tags')
    }

    let locationTags: string[] = []
    if (photo.coordinates && photo.coordinates.lat && photo.coordinates.lng) {
      try {
        locationTags = getLocationTags(photo.coordinates.lat, photo.coordinates.lng)
        console.log('[AI] \u2713 Location tags: ' + locationTags.length + ' from GPS')
      } catch (locError) {
        console.log('[AI] \u26a0 Location tag lookup failed:', locError)
      }
    }

    const depthTags = getDepthTags(depthResults)
    console.log('[AI] \u2713 Depth tags: ' + depthTags.length)

    const allTags = [
      clipResults.category,
      clipResults.lighting,
      clipResults.mood,
      ...clipResults.composition,
      ...clipResults.subjects,
      ...depthTags,
      ...primaryExifTags,
      ...locationTags,
    ].filter(Boolean)

    const uniqueTags = [...new Set(allTags)]
    const finalTags = uniqueTags.slice(0, 15)

    console.log('[AI] \u2713 Final tag count: ' + finalTags.length)
    console.log('[AI] Tags: ' + finalTags.join(', '))

    return {
      category: clipResults.category,
      tags: finalTags,
      metadata: {
        lighting: clipResults.lighting,
        mood: clipResults.mood,
        composition: {
          techniques: clipResults.composition,
          depthOfField: depthResults.depthOfField,
          hasLayering: depthResults.hasLayering,
        },
      },
      confidence: {
        category: clipResults.confidence?.category ?? 0,
        lighting: clipResults.confidence?.lighting ?? 0,
        mood: clipResults.confidence?.mood ?? 0,
      },
    }
  } catch (error) {
    console.error('[AI] Photo intelligence analysis failed:', error)
    return {
      category: 'other',
      tags: ['unclassified'],
      metadata: {
        lighting: 'unknown',
        mood: 'neutral',
        composition: { techniques: [], depthOfField: 'medium', hasLayering: false },
      },
      confidence: { category: 0, lighting: 0, mood: 0 },
    }
  }
}
`;

fs.writeFileSync(path.join(BASE, 'lib/ai/photo-intelligence.ts'), pi, 'utf8');
console.log('OK: lib/ai/photo-intelligence.ts');

const pt = `export interface Photo {
    id: string;
    title: string;
    category: 'street' | 'nature' | 'city' | 'portrait' | 'landscape' | 'minimal' | 'other' | string;
    series?: 'niagara' | 'bruce' | 'montreal' | 'toronto' | 'goa' | 'kerala' | 'bhuj' | 'quebec' | 'etobicoke' | string;
    location: string;
    coordinates?: { lat: number; lng: number };
    dms?: string;
    description?: string;
    behindTheShot?: string;
    exifToggleHidden?: boolean;
    src: string;
    width: number;
    height: number;
    blurDataURL?: string;
    tags: string[];
    uploadedAt: string;
    takenAt?: string;

    // Derived/UX fields
    cdnSrc?: string;
    displayTitle?: string;

    // AI analysis metadata
    metadata?: {
        lighting?: string;
        mood?: string;
        composition?: {
            techniques: string[];
            depthOfField: string;
            hasLayering: boolean;
        };
    };

    confidence?: {
        category?: number;
        lighting?: number;
        mood?: number;
    };

    exif: {
        make?: string;
        model?: string;
        lens?: string;
        focalLength?: string;
        aperture?: string;
        shutterType?: string;
        exposureTime?: string;
        iso?: string;
        flash?: string;
        whiteBalance?: string;
        meteringMode?: string;
        orientation?: string;
        gps?: {
            latitude: number;
            longitude: number;
            altitude?: number;
        };
    };
}

export type PhotoFormData = Omit<Photo, 'id' | 'src' | 'width' | 'height' | 'uploadedAt' | 'exif'>;
`;
fs.mkdirSync(path.join(BASE, 'types'), { recursive: true });
fs.writeFileSync(path.join(BASE, 'types/photo.ts'), pt, 'utf8');
console.log('OK: types/photo.ts');

const routePath = path.join(BASE, 'app/api/upload/route.ts');
let route = fs.readFileSync(routePath, 'utf8');
const OLD = `        // Classify image to derive category and tags (lazy import to avoid ONNX cold-start on every request)
        try {
            const { classifyImage } = await import("@/lib/image-classifier");
            const classification = await classifyImage(filePath);
            if (classification.tags?.length) {
                newPhoto.tags = classification.tags;
            }
            if (classification.category) {
                newPhoto.category = classification.category;
            }
        } catch (error) {
            console.warn("Image classification failed; using defaults:", error);
        }`;
const NEW = `        // AI classification pipeline (CLIP + Depth + EXIF)
        try {
            console.log('[Upload] Starting AI analysis pipeline...')
            const { analyzePhoto } = await import('@/lib/ai/photo-intelligence')
            const aiAnalysis = await analyzePhoto(filePath, newPhoto)
            newPhoto.category = aiAnalysis.category
            newPhoto.tags = aiAnalysis.tags
            newPhoto.metadata = aiAnalysis.metadata
            newPhoto.confidence = aiAnalysis.confidence
            console.log('[Upload] \u2705 AI analysis complete (CLIP-based)')
            console.log('[Upload] Category:', newPhoto.category)
            console.log('[Upload] Tag count:', newPhoto.tags.length)
            console.log('[Upload] Lighting:', newPhoto.metadata.lighting)
            console.log('[Upload] Mood:', newPhoto.metadata.mood)
            console.log('[Upload] DOF:', newPhoto.metadata.composition?.depthOfField)
        } catch (aiError) {
            console.error('[Upload] \u26a0\ufe0f AI analysis failed, falling back to ViT:', aiError)
            try {
                const { classifyImage } = await import('@/lib/image-classifier')
                const classifyResult = await classifyImage(filePath)
                newPhoto.tags = classifyResult.tags || []
                newPhoto.category = classifyResult.category || 'other'
                console.log('[Upload] \u2705 Fallback classifier used')
            } catch (fallbackError) {
                console.error('[Upload] \u274c Both classifiers failed:', fallbackError)
                newPhoto.tags = ['unclassified']
                newPhoto.category = 'other'
            }
        }`;
if (route.includes(OLD)) {
  fs.writeFileSync(routePath, route.replace(OLD, NEW), 'utf8');
  console.log('OK: app/api/upload/route.ts patched');
} else {
