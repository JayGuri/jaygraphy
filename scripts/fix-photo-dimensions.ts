import fs from "fs"
import path from "path"
import sharp from "sharp"

interface Photo { id: string; src: string; width: number; height: number; [key: string]: unknown }

async function fixDimensions() {
  const photosPath = path.join(process.cwd(), "data", "photos.json")
  const photos: Photo[] = JSON.parse(fs.readFileSync(photosPath, "utf-8"))
  let fixedCount = 0
  for (const photo of photos) {
    if (photo.width > 0 && photo.height > 0) { process.stdout.write("."); continue }
    const filePath = path.join(process.cwd(), "public", photo.src)
    if (!fs.existsSync(filePath)) { console.log("File not found:", filePath); continue }
    try {
      const m = await sharp(filePath).metadata()
      photo.width = m.width || 0
      photo.height = m.height || 0
      console.log("Fixed:", photo.id, photo.width + "x" + photo.height)
      fixedCount++
    } catch (e) { console.error("Failed:", photo.id, e) }
  }
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2))
  console.log("Fixed " + fixedCount + " photos")
}
fixDimensions().catch(console.error)