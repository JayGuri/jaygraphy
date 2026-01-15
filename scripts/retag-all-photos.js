const fs = require('fs');
const path = require('path');

const photosPath = path.join(process.cwd(), 'data', 'photos.json');
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// Import location tags (simplified inline version)
const locationDatabase = {
  '45.24512777777778,-81.523225': {
    tags: ['grotto', 'bruce peninsula', 'national park', 'cave', 'limestone', 'crystal clear water', 'swimming', 'hiking', 'georgian bay', 'canada', 'ontario'],
    monument: 'The Grotto'
  },
  '45.25769722222222,-81.6676638888889': {
    tags: ['bruce peninsula', 'national park', 'hiking', 'nature', 'forest', 'trails', 'georgian bay', 'canada', 'ontario']
  },
  '43.633158333333334,-79.36565277777777': {
    tags: ['high park', 'toronto', 'park', 'nature', 'cherry blossoms', 'hiking', 'trails', 'ontario', 'canada']
  },
  '43.642313888888886,-79.38742777777779': {
    tags: ['toronto', 'waterfront', 'lake ontario', 'harbour', 'urban', 'city', 'skyline', 'ontario', 'canada']
  },
  '43.68590833333333,-79.364975': {
    tags: ['don valley', 'toronto', 'valley', 'nature', 'trails', 'river', 'hiking', 'ontario', 'canada']
  },
  '45.556774999999995,-73.55973888888889': {
    tags: ['old montreal', 'montreal', 'historic', 'architecture', 'old port', 'cobblestone', 'quebec', 'canada'],
    monument: 'Old Montreal'
  },
  '45.50951111111111,-73.55158333333333': {
    tags: ['botanical garden', 'montreal', 'garden', 'nature', 'plants', 'flowers', 'quebec', 'canada']
  },
  '46.813294444444445,-71.2025': {
    tags: ['old quebec', 'quebec city', 'historic', 'unesco', 'fortress', 'architecture', 'chateau frontenac', 'quebec', 'canada'],
    monument: 'Château Frontenac'
  },
  '43.079175000000006,-79.07813333333333': {
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'horseshoe falls', 'american falls', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls'
  },
  '23.265877777777778,69.67968888888889': {
    tags: ['bhuj', 'gujarat', 'india', 'kutch', 'desert', 'culture', 'heritage']
  },
  '15.584308333333334,73.73748055555555': {
    tags: ['bardez', 'goa', 'india', 'beach', 'coastal', 'tropical']
  },
  '10.032261111111112,76.8667611111111': {
    tags: ['devikulam', 'kerala', 'india', 'munnar', 'hill station', 'tea plantations', 'mountains', 'nature']
  },
  '8.985172222222221,76.61600555555555': {
    tags: ['kollam', 'kerala', 'india', 'backwaters', 'coastal', 'port', 'nature']
  }
};

function getLocationKey(lat, lon) {
  return `${lat},${lon}`;
}

function getLocationTags(latitude, longitude) {
  const key = getLocationKey(latitude, longitude);
  const location = locationDatabase[key];
  
  if (location) {
    return [...location.tags];
  }
  
  // Check for nearby locations
  for (const [locKey, locData] of Object.entries(locationDatabase)) {
    const [locLat, locLon] = locKey.split(',').map(Number);
    const dist = Math.sqrt(
      Math.pow(latitude - locLat, 2) + Math.pow(longitude - locLon, 2)
    );
    if (dist < 0.01) {
      return [...locData.tags];
    }
  }
  
  return [];
}

function getLocationTagsFromName(locationName) {
  const nameLower = locationName.toLowerCase();
  const tags = [];
  
  if (nameLower.includes('toronto') || nameLower.includes('ontario')) {
    tags.push('toronto', 'ontario', 'canada');
  }
  if (nameLower.includes('montreal') || nameLower.includes('quebec')) {
    tags.push('montreal', 'quebec', 'canada');
  }
  if (nameLower.includes('bruce') || nameLower.includes('grotto')) {
    tags.push('bruce peninsula', 'grotto', 'national park', 'ontario', 'canada');
  }
  if (nameLower.includes('niagara')) {
    tags.push('niagara falls', 'waterfall', 'natural wonder', 'ontario', 'canada');
  }
  if (nameLower.includes('india')) {
    tags.push('india');
  }
  if (nameLower.includes('gujarat') || nameLower.includes('ahmedabad') || nameLower.includes('bhuj')) {
    tags.push('gujarat', 'india');
  }
  if (nameLower.includes('kerala') || nameLower.includes('munnar') || nameLower.includes('kollam')) {
    tags.push('kerala', 'india');
  }
  if (nameLower.includes('goa')) {
    tags.push('goa', 'india');
  }
  
  return [...new Set(tags)];
}

function generateTagsFromExif(exif) {
  const tags = new Set();
  
  // Camera make/model
  if (exif.make) {
    tags.add(exif.make.toLowerCase().trim());
  }
  if (exif.model) {
    const modelClean = exif.model.toLowerCase().replace(/\s+/g, '');
    tags.add(modelClean);
  }
  if (exif.lens) {
    tags.add(exif.lens.toLowerCase().trim());
  }
  
  // Focal length analysis
  if (exif.focalLength) {
    const focalMatch = exif.focalLength.match(/(\d+\.?\d*)/);
    if (focalMatch) {
      const focal = parseFloat(focalMatch[1]);
      if (focal <= 24) {
        tags.add('wide angle');
        tags.add('landscape');
      } else if (focal <= 50) {
        tags.add('standard');
      } else if (focal <= 85) {
        tags.add('portrait');
      } else {
        tags.add('telephoto');
        tags.add('wildlife');
      }
    }
  }
  
  // ISO analysis
  if (exif.iso) {
    const iso = parseInt(exif.iso);
    if (iso >= 800) {
      tags.add('low light');
      tags.add('night');
    } else if (iso <= 100) {
      tags.add('bright');
      tags.add('daylight');
    }
    tags.add(`iso${iso}`);
  }
  
  // Aperture
  if (exif.aperture) {
    tags.add(exif.aperture.toLowerCase().replace(/\s+/g, ''));
    const fMatch = exif.aperture.match(/f\/(\d+\.?\d*)/);
    if (fMatch) {
      const fNum = parseFloat(fMatch[1]);
      if (fNum <= 2.8) {
        tags.add('shallow depth');
        tags.add('bokeh');
      } else if (fNum >= 8) {
        tags.add('deep focus');
        tags.add('landscape');
      }
    }
  }
  
  // Exposure time
  if (exif.exposureTime) {
    const expMatch = exif.exposureTime.match(/\/(\d+)/);
    if (expMatch) {
      const shutter = parseFloat(expMatch[1]);
      if (shutter >= 1000) {
        tags.add('fast shutter');
        tags.add('action');
      } else if (shutter <= 60) {
        tags.add('long exposure');
        tags.add('motion blur');
      }
    }
  }
  
  return Array.from(tags);
}

function enhancePhoto(photo) {
  const allTags = new Set();
  
  // Get EXIF-based tags
  if (photo.exif) {
    const exifTags = generateTagsFromExif(photo.exif);
    exifTags.forEach(tag => allTags.add(tag));
  }
  
  // Get location-based tags
  if (photo.exif?.gps) {
    const locationTags = getLocationTags(photo.exif.gps.latitude, photo.exif.gps.longitude);
    locationTags.forEach(tag => allTags.add(tag));
  }
  
  // Also check location name
  if (photo.location && photo.location !== 'Unknown Location') {
    const locationNameTags = getLocationTagsFromName(photo.location);
    locationNameTags.forEach(tag => allTags.add(tag));
  }
  
  // Add category as a tag
  if (photo.category) {
    allTags.add(photo.category.toLowerCase());
  }
  
  // Update photo tags
  photo.tags = Array.from(allTags).sort();
  
  return true;
}

console.log(`Processing ${photos.length} photos...`);
let updatedCount = 0;

for (const photo of photos) {
  const beforeTags = photo.tags?.length || 0;
  if (enhancePhoto(photo)) {
    const afterTags = photo.tags?.length || 0;
    if (beforeTags !== afterTags || !photo.tags || photo.tags.length === 0) {
      updatedCount++;
      console.log(`✓ ${photo.title}: ${beforeTags} → ${afterTags} tags`);
    }
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
  console.log(`\n✅ Successfully retagged ${updatedCount} photos!`);
  console.log(`- Added location-based tags (monuments, landmarks, regions)`);
  console.log(`- Enhanced EXIF-based tags`);
  console.log(`- All photos now have comprehensive tagging`);
} else {
  console.log('\n✅ All photos are already properly tagged!');
}
