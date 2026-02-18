import { analyzeWithCLIP } from '../lib/ai/clip-tagger'
import path from 'path'
import fs from 'fs'

async function testCLIP() {
  // Find a test photo from your existing collection
  const photosDir = path.join(process.cwd(), 'public', 'photos')
  const photoFiles = fs.readdirSync(photosDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i))
  
  if (photoFiles.length === 0) {
    console.log('No photos found in public/photos/')
    return
  }

  // Test the first 3 photos
  const testPhotos = photoFiles.slice(0, 3)
  
  console.log(`\n🧪 Testing CLIP on ${testPhotos.length} photos...\n`)
  
  for (const photoFile of testPhotos) {
    const photoPath = path.join(photosDir, photoFile)
    console.log(`\n📸 Analyzing: ${photoFile}`)
    console.log('─'.repeat(60))
    
    const result = await analyzeWithCLIP(photoPath)
    
    console.log('Category:', result.category)
    console.log('Lighting:', result.lighting)
    console.log('Mood:', result.mood)
    console.log('Composition:', result.composition.join(', ') || 'none detected')
    console.log('Subjects:', result.subjects.join(', ') || 'none detected')
    console.log('All Tags:', result.tags.join(', '))
    console.log('Confidence Scores:', JSON.stringify(result.confidence, null, 2))
  }
  
  console.log('\n✅ CLIP test complete!\n')
}

testCLIP().catch(console.error)

