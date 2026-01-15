const fs = require('fs');
const path = require('path');

const photosPath = path.join(process.cwd(), 'data', 'photos.json');
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

// Enhanced location mapping for known places
const knownLocations = {
  // Bruce Peninsula / Grotto area
  '45.24512777777778,-81.523225': { 
    name: 'The Grotto, Bruce Peninsula National Park',
    dms: "45°14'42.5\"N 81°31'23.6\"W"
  },
  '45.25769722222222,-81.6676638888889': {
    name: 'Bruce Peninsula National Park',
    dms: "45°15'27.7\"N 81°40'3.6\"W"
  },
  '45.001488888888886,-81.23088055555556': {
    name: 'Bruce Peninsula',
    dms: "45°0'5.4\"N 81°13'51.2\"W"
  },
  // Toronto locations
  '43.633158333333334,-79.36565277777777': {
    name: 'High Park, Toronto',
    dms: "43°37'59.4\"N 79°21'56.4\"W"
  },
  '43.642313888888886,-79.38742777777779': {
    name: 'Toronto Waterfront',
    dms: "43°38'32.3\"N 79°23'14.7\"W"
  },
  '43.68590833333333,-79.364975': {
    name: 'Don Valley, Toronto',
    dms: "43°41'9.3\"N 79°21'53.9\"W"
  },
  // Montreal
  '45.556774999999995,-73.55973888888889': {
    name: 'Old Montreal',
    dms: "45°33'24.4\"N 73°33'35.1\"W"
  },
  '45.50951111111111,-73.55158333333333': {
    name: 'Montreal Botanical Garden',
    dms: "45°30'34.2\"N 73°33'5.7\"W"
  },
  // Niagara Falls
  '43.079175000000006,-79.07813333333333': {
    name: 'Niagara Falls',
    dms: "43°4'45.0\"N 79°4'41.3\"W"
  },
  // Quebec City
  '46.813294444444445,-71.2025': {
    name: 'Old Quebec',
    dms: "46°48'47.9\"N 71°12'9.0\"W"
  },
  '46.812263888888886,-71.20340833333334': {
    name: 'Quebec City',
    dms: "46°48'44.2\"N 71°12'12.3\"W"
  }
};

function getLocationKey(lat, lon) {
  return `${lat},${lon}`;
}

function enhancePhoto(photo) {
  let updated = false;
  
  // Enhance location if GPS exists
  if (photo.exif?.gps) {
    const { latitude, longitude } = photo.exif.gps;
    const key = getLocationKey(latitude, longitude);
    
    // Check for exact match
    if (knownLocations[key]) {
      if (photo.location !== knownLocations[key].name) {
        photo.location = knownLocations[key].name;
        updated = true;
      }
    } else {
      // Check for nearby matches (within ~100m)
      for (const [locKey, locData] of Object.entries(knownLocations)) {
        const [locLat, locLon] = locKey.split(',').map(Number);
        const dist = Math.sqrt(
          Math.pow(latitude - locLat, 2) + Math.pow(longitude - locLon, 2)
        );
        if (dist < 0.001) { // ~100m
          photo.location = locData.name;
          updated = true;
          break;
        }
      }
    }
  }

  // Generate intelligent tags from EXIF if missing
  if (!photo.tags || photo.tags.length === 0) {
    photo.tags = [];
    
    // Camera make/model
    if (photo.exif?.make) {
      photo.tags.push(photo.exif.make.toLowerCase());
    }
    if (photo.exif?.model) {
      photo.tags.push(photo.exif.model.toLowerCase().replace(/\s+/g, ''));
    }
    
    // Focal length analysis
    if (photo.exif?.focalLength) {
      const focalMatch = photo.exif.focalLength.match(/(\d+\.?\d*)/);
      if (focalMatch) {
        const focal = parseFloat(focalMatch[1]);
        if (focal <= 24) {
          photo.tags.push('wide angle', 'landscape');
        } else if (focal <= 50) {
          photo.tags.push('standard');
        } else {
          photo.tags.push('telephoto', 'wildlife');
        }
      }
    }
    
    // ISO analysis
    if (photo.exif?.iso) {
      const iso = parseInt(photo.exif.iso);
      if (iso >= 800) {
        photo.tags.push('low light', 'night');
      } else if (iso <= 100) {
        photo.tags.push('bright', 'daylight');
      }
      photo.tags.push(`iso${iso}`);
    }
    
    // Aperture
    if (photo.exif?.aperture) {
      photo.tags.push(photo.exif.aperture.toLowerCase().replace(/\s+/g, ''));
      const fMatch = photo.exif.aperture.match(/f\/(\d+\.?\d*)/);
      if (fMatch) {
        const fNum = parseFloat(fMatch[1]);
        if (fNum <= 2.8) {
          photo.tags.push('shallow depth', 'bokeh');
        } else if (fNum >= 8) {
          photo.tags.push('deep focus');
        }
      }
    }
    
    // Exposure time
    if (photo.exif?.exposureTime) {
      const expMatch = photo.exif.exposureTime.match(/\/(\d+)/);
      if (expMatch) {
        const shutter = parseFloat(expMatch[1]);
        if (shutter >= 1000) {
          photo.tags.push('fast shutter', 'action');
        } else if (shutter <= 60) {
          photo.tags.push('long exposure');
        }
      }
    }
    
    updated = true;
  }

  // Fix category casing inconsistencies
  if (photo.category) {
    const normalized = photo.category.toLowerCase();
    const categoryMap = {
      'street': 'Street',
      'nature': 'Nature',
      'wildlife': 'Wildlife',
      'portrait': 'Portrait',
      'landscape': 'Landscape',
      'travel': 'Travel'
    };
    if (categoryMap[normalized] && photo.category !== categoryMap[normalized]) {
      photo.category = categoryMap[normalized];
      updated = true;
    }
  }

  return updated;
}

console.log(`Processing ${photos.length} photos...`);
let updatedCount = 0;

for (const photo of photos) {
  if (enhancePhoto(photo)) {
    updatedCount++;
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
  console.log(`\n✅ Successfully enhanced ${updatedCount} photos!`);
  console.log(`- Updated locations with specific place names`);
  console.log(`- Generated intelligent tags from EXIF data`);
  console.log(`- Fixed category naming inconsistencies`);
} else {
  console.log('\n✅ All photos are already up to date!');
}
