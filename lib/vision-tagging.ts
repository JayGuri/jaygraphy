import type { Photo } from "@/types/photo";
import { getLocationTags, getLocationTagsFromName } from "./location-tags";

export interface TaggingResult {
  tags: string[];
  category?: Photo["category"];
}

function addTag(tags: Set<string>, value?: string) {
  if (!value) return;
  tags.add(value.toLowerCase().trim());
}

/**
 * Analyze photo using EXIF data and intelligent heuristics.
 * This works without OpenCV and is production-ready for serverless environments.
 */
export async function analyzePhotoWithOpenCV(
  _imagePath: string,
  exif: Photo["exif"],
  location?: string
): Promise<TaggingResult> {
  const tags = new Set<string>();

  // Add location-based tags first (monuments, landmarks, regions)
  if (exif.gps) {
    const locationTags = getLocationTags(exif.gps.latitude, exif.gps.longitude);
    locationTags.forEach(tag => tags.add(tag));
  }
  
  if (location && location !== "Unknown Location") {
    const locationNameTags = getLocationTagsFromName(location);
    locationNameTags.forEach(tag => tags.add(tag));
  }

  // Add EXIF-based tags
  addExifBasedTags(tags, exif);

  // Determine category and additional tags based on EXIF heuristics
  let suggestedCategory: Photo["category"] | undefined;

  // Analyze focal length for composition hints
  if (exif.focalLength) {
    const focalNum = parseFloat(exif.focalLength.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(focalNum)) {
      if (focalNum <= 24) {
        tags.add("wide angle");
        tags.add("landscape");
        suggestedCategory = suggestedCategory || "landscape";
      } else if (focalNum <= 50) {
        tags.add("standard");
        suggestedCategory = suggestedCategory || "street";
      } else {
        tags.add("telephoto");
        tags.add("wildlife");
        suggestedCategory = suggestedCategory || "wildlife";
      }
    }
  }

  // Analyze ISO for lighting conditions
  if (exif.iso) {
    const isoNum = parseInt(exif.iso);
    if (!Number.isNaN(isoNum)) {
      if (isoNum >= 800) {
        tags.add("low light");
        tags.add("night");
      } else if (isoNum <= 100) {
        tags.add("bright");
        tags.add("daylight");
      }
    }
  }

  // Analyze aperture for depth of field
  if (exif.aperture) {
    const apertureMatch = exif.aperture.match(/f\/(\d+\.?\d*)/);
    if (apertureMatch) {
      const fNum = parseFloat(apertureMatch[1]);
      if (!Number.isNaN(fNum)) {
        if (fNum <= 2.8) {
          tags.add("shallow depth");
          tags.add("bokeh");
        } else if (fNum >= 8) {
          tags.add("deep focus");
          tags.add("landscape");
        }
      }
    }
  }

  // Analyze exposure time for motion
  if (exif.exposureTime) {
    const expMatch = exif.exposureTime.match(/\/(\d+)/);
    if (expMatch) {
      const shutterSpeed = parseFloat(expMatch[1]);
      if (!Number.isNaN(shutterSpeed)) {
        if (shutterSpeed >= 1000) {
          tags.add("fast shutter");
          tags.add("action");
        } else if (shutterSpeed <= 60) {
          tags.add("long exposure");
          tags.add("motion blur");
        }
      }
    }
  }

  // Camera brand/model tags
  if (exif.make) {
    const makeLower = exif.make.toLowerCase();
    if (makeLower.includes("apple") || makeLower.includes("iphone")) {
      tags.add("mobile");
      tags.add("iphone");
    } else if (makeLower.includes("sony")) {
      tags.add("sony");
      tags.add("mirrorless");
    } else if (makeLower.includes("canon") || makeLower.includes("nikon")) {
      tags.add("dslr");
    }
  }

  // If no category suggested yet, use a sensible default
  if (!suggestedCategory) {
    // Check if location suggests nature/wildlife
    if (tags.has("wildlife") || tags.has("telephoto")) {
      suggestedCategory = "wildlife";
    } else if (tags.has("landscape") || tags.has("wide angle")) {
      suggestedCategory = "landscape";
    } else {
      suggestedCategory = "street";
    }
  }

  return {
    tags: Array.from(tags),
    category: suggestedCategory,
  };
}

function addExifBasedTags(tags: Set<string>, exif: Photo["exif"]) {
  // Camera make/model
  if (exif.make) {
    addTag(tags, exif.make);
  }
  if (exif.model) {
    addTag(tags, exif.model);
  }
  if (exif.lens) {
    addTag(tags, exif.lens);
  }

  // Aperture
  if (exif.aperture) {
    tags.add(exif.aperture.toLowerCase().replace(/\s+/g, ""));
  }

  // ISO
  if (exif.iso) {
    tags.add(`iso${exif.iso.toLowerCase().replace(/\s+/g, "")}`);
  }

  // Focal length analysis
  if (exif.focalLength) {
    const num = parseFloat(exif.focalLength.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(num)) {
      if (num <= 24) {
        tags.add("wide");
      } else if (num <= 50) {
        tags.add("normal");
      } else if (num <= 85) {
        tags.add("portrait");
      } else {
        tags.add("telephoto");
      }
    }
  }
}


