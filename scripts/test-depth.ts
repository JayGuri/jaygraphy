import { analyzeDepth, getDepthTags } from '../lib/ai/depth-analyzer'
import path from 'path'
import fs from 'fs'

async function testDepth() {
  const photosDir = path.join(process.cwd(), 'public', 'photos')
  const photoFiles = fs.readdirSync(photosDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i))
  
  if (photoFiles.length === 0) {
    console.log('No photos found in public/photos/')
    return
  }

  const testPhotos = photoFiles.slice(0, 3)
  
  console.log(`\n🧪 Testing Depth Analysis on ${testPhotos.length} photos...\n`)
  
  for (const photoFile of testPhotos) {
    const photoPath = path.join(photosDir, photoFile)
    console.log(`\n📸 Analyzing: ${photoFile}`)
    console.log('─'.repeat(60))
    
    const result = await analyzeDepth(photoPath)
    const tags = getDepthTags(result)
    
    console.log('Depth of Field:', result.depthOfField)
    console.log('Has Layering:', result.hasLayering ? 'Yes' : 'No')
    console.log('Depth Variance:', result.depthVariance)
    console.log('Depth Range:', result.depthRange)
    console.log('Generated Tags:', tags.join(', '))
    console.log('Statistics:', JSON.stringify(result.stats, null, 2))
  }
  
  console.log('\n✅ Depth test complete!\n')
}

testDepth().catch(console.error)
