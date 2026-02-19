import fs from "fs"
import path from "path"
import sharp from "sharp"

interface Photo { id: string; src: string; width: number; height: number; [key: string]: unknown }

async function fixDimensions() {
  const photosPath = path.join(process.cwd(), "data", "photos.json")
  const photos: Photo[] = JSON.parse(fs.readFileSync(photosPath, "utf-8"))
  let updated = 0
  for (const photo of photos) {
    const filePath = path.join(process.cwd(), "public", photo.src)
    if (!fs.existsSync(filePath)) { console.log("Missing:", photo.src); continue }
    try {
      const m = await sharp(filePath).metadata()
      const newW = m.width || 0
      const newH = m.height || 0
      if (newW !== photo.width || newH !== photo.height) {
        console.log("Updated:", photo.src, photo.width + "x" + photo.height, "->", newW + "x" + newH)
        photo.width = newW
        photo.height = newH
        updated++
      }
    } catch (e) { console.error("Failed:", photo.id, e) }
  }
  fs.writeFileSync(photosPath, JSON.stringify(photos, null, 2))
  console.log("Updated " + updated + " photo dimensions")
}
fixDimensions().catch(console.error)