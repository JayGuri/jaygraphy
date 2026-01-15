const fs = require('fs');
const path = require('path');

const photosPath = path.join(process.cwd(), 'data', 'photos.json');
const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

let updatedCount = 0;

for (const photo of photos) {
  if (photo.tags && photo.tags.length > 0) {
    photo.tags = [];
    updatedCount++;
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2));
  console.log(`✅ Cleared tags on ${updatedCount} photos. Categories (Nature, Wildlife, etc.) remain untouched.`);
} else {
  console.log('✅ No tags to clear – all photos already had empty tags.');
}

