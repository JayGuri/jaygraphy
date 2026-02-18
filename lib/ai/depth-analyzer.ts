import { pipeline } from '@xenova/transformers'

let depthEstimator: any = null

export async function analyzeDepth(imagePath: string) {
  // Lazy-load the depth estimation model (~100MB)
  if (!depthEstimator) {
    console.log('Loading Depth-Anything model (first run will download ~100MB)...')
    depthEstimator = await pipeline(
      'depth-estimation',
      'Xenova/depth-anything-small-hf'
    )
    console.log('Depth model loaded successfully')
  }

  try {
    // Generate depth map
    const depthMap = await depthEstimator(imagePath)
    
    // Extract depth values (normalized 0-1, where 0=far, 1=near)
    const depthValues = Array.from(depthMap.depth.data as Float32Array)
    
    // Calculate depth statistics
    const mean = depthValues.reduce((sum, val) => sum + val, 0) / depthValues.length
    const variance = depthValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / depthValues.length
    const stdDev = Math.sqrt(variance)
    
    // Classify depth of field based on standard deviation
    // High variance = many depth planes = deep DOF (landscape style)
    // Low variance = single depth plane = shallow DOF (portrait/bokeh style)
    let depthOfField: 'shallow' | 'medium' | 'deep'
    if (stdDev < 0.15) {
      depthOfField = 'shallow' // bokeh, subject isolation
    } else if (stdDev < 0.30) {
      depthOfField = 'medium' // standard street/travel
    } else {
      depthOfField = 'deep' // landscape, architecture
    }
    
    // Detect compositional layering (foreground, midground, background)
    const hasLayering = stdDev > 0.25
    
    // Calculate depth range (useful for understanding scene complexity)
    // Use iterative approach to avoid stack overflow on large arrays
    let minDepth = depthValues[0]
    let maxDepth = depthValues[0]
    for (let i = 1; i < depthValues.length; i++) {
      if (depthValues[i] < minDepth) minDepth = depthValues[i]
      if (depthValues[i] > maxDepth) maxDepth = depthValues[i]
    }
    const depthRange = maxDepth - minDepth
    
    return {
      depthOfField,
      hasLayering,
      depthVariance: parseFloat(stdDev.toFixed(3)),
      depthRange: parseFloat(depthRange.toFixed(3)),
      stats: {
        mean: parseFloat(mean.toFixed(3)),
        stdDev: parseFloat(stdDev.toFixed(3)),
        min: parseFloat(minDepth.toFixed(3)),
        max: parseFloat(maxDepth.toFixed(3))
      }
    }
  } catch (error) {
    console.error('Depth analysis failed:', error)
    // Return neutral fallback
    return {
      depthOfField: 'medium' as const,
      hasLayering: false,
      depthVariance: 0,
      depthRange: 0,
      stats: { mean: 0, stdDev: 0, min: 0, max: 0 }
    }
  }
}

// Helper: Generate depth tags based on analysis
export function getDepthTags(depthResult: Awaited<ReturnType<typeof analyzeDepth>>): string[] {
  const tags: string[] = []
  
  tags.push(depthResult.depthOfField + '-dof')
  
  if (depthResult.depthOfField === 'shallow') {
    tags.push('bokeh', 'subject-isolation')
  } else if (depthResult.depthOfField === 'deep') {
    tags.push('deep-focus', 'full-scene')
  }
  
  if (depthResult.hasLayering) {
    tags.push('layered-composition', 'depth-planes')
  }
  
  return tags
}
