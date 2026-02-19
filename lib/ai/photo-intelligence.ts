import { analyzeWithCLIP } from './clip-tagger'
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

    console.log('[AI] ✓ CLIP complete: ' + clipResults.category)
    console.log('[AI] ✓ Depth complete: ' + depthResults.depthOfField)

    let primaryExifTags: string[] = []
    if (photo.exif && photo.exif.focalLength) {
      const exifTags = inferShootingContext(photo as Photo)
      primaryExifTags = getPrimaryExifTags(exifTags)
      console.log('[AI] ✓ EXIF tags generated: ' + primaryExifTags.length)
    } else {
      console.log('[AI] ⚠ No EXIF data available, skipping EXIF tags')
    }

    let locationTags: string[] = []
    if (photo.coordinates && photo.coordinates.lat && photo.coordinates.lng) {
      try {
        locationTags = getLocationTags(photo.coordinates.lat, photo.coordinates.lng)
        console.log('[AI] ✓ Location tags: ' + locationTags.length + ' from GPS')
      } catch (locError) {
        console.log('[AI] ⚠ Location tag lookup failed:', locError)
      }
    }

    const depthTags = getDepthTags(depthResults)
    console.log('[AI] ✓ Depth tags: ' + depthTags.length)

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

    console.log('[AI] ✓ Final tag count: ' + finalTags.length)
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
