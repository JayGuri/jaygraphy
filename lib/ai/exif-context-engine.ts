import { Photo } from '@/types/photo'

// Parse EXIF strings to numbers for comparison
function parseFocalLength(s: string | undefined): number | undefined {
  if (!s) return undefined
  const match = s.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : undefined
}
function parseAperture(s: string | undefined): number | undefined {
  if (!s) return undefined
  const match = s.replace('f/', '').match(/[\d.]+/)
  return match ? parseFloat(match[0]) : undefined
}
function parseIso(s: string | undefined): number | undefined {
  if (!s) return undefined
  const n = parseInt(s, 10)
  return isNaN(n) ? undefined : n
}

export function inferShootingContext(photo: Photo): string[] {
  const tags: string[] = []
  const focalLength = parseFocalLength(photo.exif.focalLength)
  const aperture = parseAperture(photo.exif.aperture)
  const iso = parseIso(photo.exif.iso)
  const { exposureTime, flash } = photo.exif

  // ============================================================
  // LENS TYPE & FOCAL LENGTH ANALYSIS
  // ============================================================
  if (focalLength !== undefined) {
    if (focalLength < 20) {
      tags.push('ultra-wide')
      if (aperture !== undefined) {
        if (aperture < 4) {
          tags.push('environmental', 'immersive')
        } else {
          tags.push('architectural-detail')
        }
      } else {
        tags.push('architectural-detail')
      }
    } else if (focalLength >= 20 && focalLength < 35) {
      tags.push('wide-angle')
      if (aperture !== undefined) {
        if (aperture > 8) {
          tags.push('landscape-style')
        } else {
          tags.push('street-style')
        }
      } else {
        tags.push('street-style')
      }
    } else if (focalLength >= 35 && focalLength <= 85) {
      tags.push('standard-focal-length')
      if (aperture !== undefined) {
        if (aperture < 2.8) {
          tags.push('street-portrait', 'environmental-portrait')
        } else {
          tags.push('documentary-style')
        }
      } else {
        tags.push('documentary-style')
      }
    } else if (focalLength > 85 && focalLength <= 200) {
      tags.push('telephoto')
      if (aperture !== undefined) {
        if (aperture < 4) {
          tags.push('compression-effect', 'subject-isolation')
        } else {
          tags.push('distant-capture')
        }
      } else {
        tags.push('distant-capture')
      }
    } else if (focalLength > 200) {
      tags.push('super-telephoto')
      tags.push('wildlife-or-sports', 'extreme-compression')
    }
  }

  // ============================================================
  // APERTURE ANALYSIS (Depth Control)
  // ============================================================
  if (aperture !== undefined) {
    if (aperture < 1.8) {
      tags.push('ultra-wide-aperture', 'extreme-bokeh')
    } else if (aperture >= 1.8 && aperture < 2.8) {
      tags.push('wide-aperture', 'shallow-dof')
    } else if (aperture >= 2.8 && aperture < 5.6) {
      tags.push('moderate-aperture')
    } else if (aperture >= 5.6 && aperture < 11) {
      tags.push('stopped-down')
    } else if (aperture >= 11) {
      tags.push('deep-dof', 'maximum-sharpness')
    }
  }

  // ============================================================
  // ISO ANALYSIS (Light Sensitivity & Scene Brightness)
  // ============================================================
  if (iso !== undefined) {
    if (iso < 200) {
      tags.push('base-iso', 'bright-conditions')
    } else if (iso >= 200 && iso < 800) {
      tags.push('moderate-iso', 'controlled-light')
    } else if (iso >= 800 && iso < 3200) {
      tags.push('high-iso', 'low-light')
    } else if (iso >= 3200) {
      tags.push('very-high-iso', 'extreme-low-light')
    }
  }

  // ============================================================
  // SHUTTER SPEED ANALYSIS (Motion Handling)
  // ============================================================
  if (exposureTime) {
    const raw = exposureTime.replace(/s$/i, '').trim()
    let shutterSpeed: number
    if (raw.includes('/')) {
      const [num, denom] = raw.split('/').map(Number)
      shutterSpeed = denom ? num / denom : parseFloat(raw)
    } else {
      shutterSpeed = parseFloat(raw)
    }
    if (Number.isNaN(shutterSpeed)) shutterSpeed = 0

    if (shutterSpeed > 0 && shutterSpeed < 1 / 1000) {
      tags.push('ultra-fast-shutter', 'frozen-action')
    } else if (shutterSpeed >= 1 / 1000 && shutterSpeed < 1 / 250) {
      tags.push('fast-shutter', 'freeze-motion')
    } else if (shutterSpeed >= 1 / 250 && shutterSpeed < 1 / 60) {
      tags.push('standard-shutter')
    } else if (shutterSpeed >= 1 / 60 && shutterSpeed < 1 / 15) {
      tags.push('slow-shutter', 'potential-motion-blur')
    } else if (shutterSpeed >= 1 / 15 && shutterSpeed < 1) {
      tags.push('very-slow-shutter', 'motion-blur')
    } else if (shutterSpeed >= 1) {
      tags.push('long-exposure', 'creative-blur')
    }
  }

  // ============================================================
  // FLASH ANALYSIS
  // ============================================================
  if (flash) {
    const f = flash.toLowerCase()
    if (f.includes('fired')) {
      tags.push('flash-used')
      if (iso !== undefined) {
        if (iso < 800) {
          tags.push('fill-flash')
        } else {
          tags.push('flash-main-light')
        }
      } else {
        tags.push('flash-main-light')
      }
    } else if (f.includes('no')) {
      tags.push('natural-light')
    }
  }

  // ============================================================
  // COMBO ANALYSIS (Cross-Signal Patterns)
  // ============================================================
  if (aperture !== undefined && aperture < 2.8 && iso !== undefined && iso < 400) {
    tags.push('controlled-environment', 'studio-style')
  }
  if (aperture !== undefined && aperture < 2.8 && iso !== undefined && iso > 1600) {
    tags.push('available-light', 'low-light-performance')
  }
  if (aperture !== undefined && aperture > 8 && iso !== undefined && iso < 400) {
    tags.push('landscape-optimal', 'maximum-detail')
  }
  if (focalLength !== undefined && focalLength > 200 && exposureTime) {
    const raw = exposureTime.replace(/s$/i, '').trim()
    const denom = raw.includes('/') ? parseFloat(raw.split('/')[1]) : 0
    const ss = denom > 0 ? 1 / denom : parseFloat(raw)
    if (!Number.isNaN(ss) && ss < 1 / 500) {
      tags.push('action-photography', 'fast-moving-subject')
    }
  }

  // ============================================================
  // TIME OF DAY ANALYSIS (requires takenAt + coordinates)
  // ============================================================
  if (photo.takenAt && photo.coordinates) {
    const date = new Date(photo.takenAt)
    const hour = date.getHours()

    if (hour >= 5 && hour <= 7) {
      tags.push('morning-golden-hour', 'sunrise')
    } else if (hour >= 17 && hour <= 19) {
      tags.push('evening-golden-hour', 'sunset')
    } else if (hour >= 19 && hour <= 21) {
      tags.push('blue-hour', 'dusk')
    } else if (hour >= 22 || hour <= 4) {
      tags.push('night-time', 'after-dark')
    } else if (hour >= 11 && hour <= 15) {
      tags.push('midday', 'harsh-light')
    } else {
      tags.push('daytime')
    }
  } else if (photo.takenAt) {
    // No coordinates but we have time
    const date = new Date(photo.takenAt)
    const hour = date.getHours()
    if (hour >= 5 && hour <= 7) {
      tags.push('morning-golden-hour', 'sunrise')
    } else if (hour >= 17 && hour <= 19) {
      tags.push('evening-golden-hour', 'sunset')
    } else if (hour >= 19 && hour <= 21) {
      tags.push('blue-hour', 'dusk')
    } else if (hour >= 22 || hour <= 4) {
      tags.push('night-time', 'after-dark')
    } else if (hour >= 11 && hour <= 15) {
      tags.push('midday', 'harsh-light')
    } else {
      tags.push('daytime')
    }
  }

  // ============================================================
  // CAMERA MAKE ANALYSIS (Gear Style Hints)
  // ============================================================
  if (photo.exif.make) {
    const make = photo.exif.make.toLowerCase()
    if (make.includes('apple') || make.includes('iphone')) {
      tags.push('mobile-photography', 'smartphone')
    } else if (make.includes('sony')) {
      tags.push('mirrorless')
    } else if (make.includes('canon') || make.includes('nikon')) {
      tags.push('dslr')
    } else if (make.includes('fuji')) {
      tags.push('mirrorless', 'film-simulation-style')
    } else if (make.includes('leica')) {
      tags.push('rangefinder-style', 'premium-optics')
    }
  }

  return tags
}

// Helper: Get the most relevant tags (prioritized subset)
export function getPrimaryExifTags(allTags: string[]): string[] {
  const priorities = [
    'golden-hour',
    'blue-hour',
    'bokeh',
    'shallow-dof',
    'deep-dof',
    'long-exposure',
    'low-light',
    'telephoto',
    'wide-angle',
    'studio-style',
  ]

  const primary = allTags.filter((tag) =>
    priorities.some((p) => tag.includes(p))
  )

  return primary.length > 0 ? primary.slice(0, 5) : allTags.slice(0, 5)
}
