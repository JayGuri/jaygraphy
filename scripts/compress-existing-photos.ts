import fs from "fs"
import path from "path"
import sharp from "sharp"

async function compressPhotos() {
  const photosDir = path.join(process.cwd(), "public", "photos")
  const files = fs.readdirSync(photosDir).filter((f: string) => f.match(/.(jpg|jpeg|png)$/i))
  console.log("Found " + files.length + " photos")
  let saved = 0; let skipped = 0; let totalSaved = 0
  for (const file of files) {
    const filePath = path.join(photosDir, file)
    const stats = fs.statSync(filePath)
    if (stats.size < 500000) { process.stdout.write("."); skipped++; continue }
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    try {
      const compressed = await sharp(filePath)
        .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toBuffer()
      const outPath = filePath.replace(/.png$/i, ".jpg")
      const tmpPath = outPath + ".tmp"
      fs.writeFileSync(tmpPath, compressed)
      fs.renameSync(tmpPath, outPath)
      if (/.png$/i.test(file)) fs.unlinkSync(filePath)
      const newMB = (compressed.length / 1024 / 1024).toFixed(2)
      totalSaved += stats.size - compressed.length
      console.log(file + ": " + sizeMB + " MB -> " + newMB + " MB")
      saved++
    } catch (e) { console.error("FAILED:", file, (e as Error).message) }
  }
  const savedMB = (totalSaved / 1024 / 1024).toFixed(1)
  console.log("Done. Compressed: " + saved + "  Skipped: " + skipped + "  Saved: " + savedMB + " MB")
}
compressPhotos().catch(console.error)