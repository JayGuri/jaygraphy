/**
 * Comprehensive location-based tagging system
 * Maps GPS coordinates and location names to relevant tags including monuments, landmarks, and features
 */

interface LocationTag {
  name: string;
  tags: string[];
  monument?: string;
  landmark?: string;
  type?: 'nature' | 'urban' | 'monument' | 'park' | 'water' | 'wildlife';
}

// Known locations with their tags
const locationDatabase: Record<string, LocationTag> = {
  // Bruce Peninsula / Grotto
  '45.24512777777778,-81.523225': {
    name: 'The Grotto, Bruce Peninsula National Park',
    tags: ['grotto', 'bruce peninsula', 'national park', 'cave', 'limestone', 'crystal clear water', 'swimming', 'hiking', 'georgian bay', 'canada', 'ontario'],
    monument: 'The Grotto',
    landmark: 'Bruce Peninsula National Park',
    type: 'nature'
  },
  '45.25769722222222,-81.6676638888889': {
    name: 'Bruce Peninsula National Park',
    tags: ['bruce peninsula', 'national park', 'hiking', 'nature', 'forest', 'trails', 'georgian bay', 'canada', 'ontario'],
    landmark: 'Bruce Peninsula National Park',
    type: 'nature'
  },
  '45.001488888888886,-81.23088055555556': {
    name: 'Bruce Peninsula',
    tags: ['bruce peninsula', 'nature', 'hiking', 'georgian bay', 'canada', 'ontario'],
    type: 'nature'
  },
  
  // Toronto locations
  '43.633158333333334,-79.36565277777777': {
    name: 'High Park, Toronto',
    tags: ['high park', 'toronto', 'park', 'nature', 'cherry blossoms', 'hiking', 'trails', 'ontario', 'canada'],
    landmark: 'High Park',
    type: 'park'
  },
  '43.642313888888886,-79.38742777777779': {
    name: 'Toronto Waterfront',
    tags: ['toronto', 'waterfront', 'lake ontario', 'harbour', 'urban', 'city', 'skyline', 'ontario', 'canada'],
    landmark: 'Toronto Waterfront',
    type: 'urban'
  },
  '43.68590833333333,-79.364975': {
    name: 'Don Valley, Toronto',
    tags: ['don valley', 'toronto', 'valley', 'nature', 'trails', 'river', 'hiking', 'ontario', 'canada'],
    type: 'nature'
  },
  '43.64642222222222,-79.379075': {
    name: 'Toronto',
    tags: ['toronto', 'city', 'urban', 'ontario', 'canada'],
    type: 'urban'
  },
  '43.66728611111111,-79.4040138888889': {
    name: 'Toronto',
    tags: ['toronto', 'city', 'urban', 'ontario', 'canada'],
    type: 'urban'
  },
  '43.630877777777776,-79.47148888888889': {
    name: 'Etobicoke, Toronto',
    tags: ['etobicoke', 'toronto', 'suburb', 'urban', 'ontario', 'canada'],
    type: 'urban'
  },
  
  // Montreal
  '45.556774999999995,-73.55973888888889': {
    name: 'Old Montreal',
    tags: ['old montreal', 'montreal', 'historic', 'architecture', 'old port', 'cobblestone', 'quebec', 'canada'],
    landmark: 'Old Montreal',
    type: 'monument'
  },
  '45.50951111111111,-73.55158333333333': {
    name: 'Montreal Botanical Garden',
    tags: ['botanical garden', 'montreal', 'garden', 'nature', 'plants', 'flowers', 'quebec', 'canada'],
    landmark: 'Montreal Botanical Garden',
    type: 'park'
  },
  '45.498536111111115,-73.59810555555555': {
    name: 'Montreal',
    tags: ['montreal', 'city', 'urban', 'quebec', 'canada'],
    type: 'urban'
  },
  '45.492336111111115,-73.6174861111111': {
    name: 'Montreal',
    tags: ['montreal', 'city', 'urban', 'quebec', 'canada'],
    type: 'urban'
  },
  '45.5047,-73.55667777777778': {
    name: 'Montreal',
    tags: ['montreal', 'city', 'urban', 'quebec', 'canada'],
    type: 'urban'
  },
  
  // Quebec City
  '46.813294444444445,-71.2025': {
    name: 'Old Quebec',
    tags: ['old quebec', 'quebec city', 'historic', 'unesco', 'fortress', 'architecture', 'chateau frontenac', 'quebec', 'canada'],
    monument: 'Château Frontenac',
    landmark: 'Old Quebec',
    type: 'monument'
  },
  '46.812263888888886,-71.20340833333334': {
    name: 'Quebec City',
    tags: ['quebec city', 'historic', 'old town', 'architecture', 'fortress', 'quebec', 'canada'],
    landmark: 'Old Quebec',
    type: 'monument'
  },
  '46.81469722222222,-71.20813055555556': {
    name: 'Quebec City',
    tags: ['quebec city', 'historic', 'old town', 'architecture', 'quebec', 'canada'],
    type: 'monument'
  },
  '46.81625277777778,-71.20764166666667': {
    name: 'Quebec City',
    tags: ['quebec city', 'historic', 'old town', 'architecture', 'quebec', 'canada'],
    type: 'monument'
  },
  '46.81296944444444,-71.20716944444445': {
    name: 'Quebec City',
    tags: ['quebec city', 'historic', 'old town', 'architecture', 'quebec', 'canada'],
    type: 'monument'
  },
  '46.8861,-71.14508055555557': {
    name: 'Quebec City',
    tags: ['quebec city', 'historic', 'old town', 'architecture', 'quebec', 'canada'],
    type: 'monument'
  },
  
  // Niagara Falls
  '43.079175000000006,-79.07813333333333': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'horseshoe falls', 'american falls', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    landmark: 'Niagara Falls',
    type: 'monument'
  },
  '43.07926944444445,-79.07815555555555': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'horseshoe falls', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.081725000000006,-79.07792777777777': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.08051944444445,-79.07829166666666': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.08038611111112,-79.07779722222222': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.07509166666667,-79.07940555555555': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.137702777777776,-79.0545361111111': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  '43.11833611111111,-79.06871111111111': {
    name: 'Niagara Falls',
    tags: ['niagara falls', 'waterfall', 'natural wonder', 'tourist attraction', 'ontario', 'canada'],
    monument: 'Niagara Falls',
    type: 'monument'
  },
  
  // India locations
  '23.265877777777778,69.67968888888889': {
    name: 'Bhuj, India',
    tags: ['bhuj', 'gujarat', 'india', 'kutch', 'desert', 'culture', 'heritage'],
    type: 'urban'
  },
  '23.091102777777778,72.59632222222221': {
    name: 'Asarva Taluka, India',
    tags: ['asarva', 'ahmedabad', 'gujarat', 'india', 'urban'],
    type: 'urban'
  },
  '23.091116666666665,72.59634444444444': {
    name: 'Asarva Taluka, India',
    tags: ['asarva', 'ahmedabad', 'gujarat', 'india', 'urban'],
    type: 'urban'
  },
  '23.09113611111111,72.59626944444445': {
    name: 'Asarva Taluka, India',
    tags: ['asarva', 'ahmedabad', 'gujarat', 'india', 'urban'],
    type: 'urban'
  },
  '15.584308333333334,73.73748055555555': {
    name: 'Bardez, India',
    tags: ['bardez', 'goa', 'india', 'beach', 'coastal', 'tropical'],
    type: 'nature'
  },
  '15.58431388888889,73.73749444444445': {
    name: 'Bardez, India',
    tags: ['bardez', 'goa', 'india', 'beach', 'coastal', 'tropical'],
    type: 'nature'
  },
  '10.032261111111112,76.8667611111111': {
    name: 'Devikulam, India',
    tags: ['devikulam', 'kerala', 'india', 'munnar', 'hill station', 'tea plantations', 'mountains', 'nature'],
    type: 'nature'
  },
  '10.032366666666668,76.86667499999999': {
    name: 'Devikulam, India',
    tags: ['devikulam', 'kerala', 'india', 'munnar', 'hill station', 'tea plantations', 'mountains', 'nature'],
    type: 'nature'
  },
  '10.032322222222223,76.86615833333333': {
    name: 'Devikulam, India',
    tags: ['devikulam', 'kerala', 'india', 'munnar', 'hill station', 'tea plantations', 'mountains', 'nature'],
    type: 'nature'
  },
  '10.108077777777778,77.122125': {
    name: 'Devikulam, India',
    tags: ['devikulam', 'kerala', 'india', 'munnar', 'hill station', 'tea plantations', 'mountains', 'nature'],
    type: 'nature'
  },
  '8.985172222222221,76.61600555555555': {
    name: 'Kollam, India',
    tags: ['kollam', 'kerala', 'india', 'backwaters', 'coastal', 'port', 'nature'],
    type: 'nature'
  }
};

/**
 * Get location-based tags from GPS coordinates
 */
export function getLocationTags(latitude: number, longitude: number): string[] {
  const key = `${latitude},${longitude}`;
  const location = locationDatabase[key];
  
  if (location) {
    return [...location.tags];
  }
  
  // Check for nearby locations (within ~1km)
  for (const [locKey, locData] of Object.entries(locationDatabase)) {
    const [locLat, locLon] = locKey.split(',').map(Number);
    const dist = Math.sqrt(
      Math.pow(latitude - locLat, 2) + Math.pow(longitude - locLon, 2)
    );
    if (dist < 0.01) { // ~1km
      return [...locData.tags];
    }
  }
  
  return [];
}

/**
 * Get location-based tags from location name string
 */
export function getLocationTagsFromName(locationName: string): string[] {
  const nameLower = locationName.toLowerCase();
  const tags: string[] = [];
  
  // Check for exact matches
  for (const locData of Object.values(locationDatabase)) {
    if (locData.name.toLowerCase() === nameLower) {
      return [...locData.tags];
    }
  }
  
  // Check for partial matches
  for (const locData of Object.values(locationDatabase)) {
    if (nameLower.includes(locData.name.toLowerCase()) || locData.name.toLowerCase().includes(nameLower)) {
      tags.push(...locData.tags);
    }
  }
  
  // Add country/region tags based on location name
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
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Get monument/landmark name if available
 */
export function getMonument(latitude: number, longitude: number): string | undefined {
  const key = `${latitude},${longitude}`;
  const location = locationDatabase[key];
  return location?.monument;
}

export function getLandmark(latitude: number, longitude: number): string | undefined {
  const key = `${latitude},${longitude}`;
  const location = locationDatabase[key];
  return location?.landmark;
}
