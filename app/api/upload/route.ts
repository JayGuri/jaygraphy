import { NextRequest, NextResponse } from "next/server";
import { savePhoto } from "@/lib/photo-storage";
import { Photo } from "@/types/photo";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import exifr from "exifr";
import { needsAutoTitle, generateAutoTitle, cleanPhotoTitle } from "@/lib/title";
import { inferSeries } from "@/lib/series";
import { withCdn } from "@/lib/cdn";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        let buffer = Buffer.from(await file.arrayBuffer());
        let filename = `${uuidv4()}-${file.name.replace(/\s+/g, "-")}`;

        // Extract EXIF from original buffer (HEIC or otherwise) before any conversion
        let exifData = {};
        try {
            exifData = await exifr.parse(buffer, {
                tiff: true,
                xmp: true,
                icc: false,
                ifd0: true as any,
                ifd1: false,
                exif: true,
                gps: true,
                interop: false,
            });
        } catch (e) {
            console.warn("Could not parse EXIF data", e);
        }

        // Handle HEIC Conversion
        if (file.name.toLowerCase().endsWith('.heic')) {
            try {
                const heicConvert = require('heic-convert');
                const outputBuffer = await heicConvert({
                    buffer: buffer,
                    format: 'JPEG',
                    quality: 0.9
                });
                buffer = Buffer.from(outputBuffer);
                filename = filename.replace(/\.heic$/i, ".jpg");
            } catch (error) {
                console.error("HEIC conversion failed:", error);
            }
        }

        const publicPath = path.join(process.cwd(), "public", "photos");
        const filePath = path.join(publicPath, filename);

        // Ensure directory exists
        try {
            await fs.access(publicPath);
        } catch {
            await fs.mkdir(publicPath, { recursive: true });
        }

        // Save file (converted or original)
        await fs.writeFile(filePath, buffer);

        // Extract dimensions and generate blur placeholder with sharp
        let width = 0;
        let height = 0;
        let blurDataURL: string | undefined;
        try {
            const metadata = await sharp(filePath).metadata();
            width = metadata.width ?? 0;
            height = metadata.height ?? 0;
        } catch (e) {
            console.warn("Could not read image dimensions", e);
        }
        try {
            const thumbBuffer = await sharp(filePath).resize(20).jpeg({ quality: 40 }).toBuffer();
            blurDataURL = `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
        } catch (e) {
            console.warn("Could not generate blur placeholder", e);
        }

        // EXIF already parsed above

        // Type assertion or checks would be better here, but for now we map as best we can
        const anyExif = exifData as any;

        const newPhoto: Photo = {
            id: uuidv4(),
            title: file.name.split(".")[0],
            category: "street", // default; refined by classifier below
            location: "Unknown Location",
            src: `/photos/${filename}`,
            width,
            height,
            ...(blurDataURL && { blurDataURL }),
            tags: [],
            uploadedAt: new Date().toISOString(),
            takenAt: anyExif?.DateTimeOriginal?.toISOString() || new Date().toISOString(),
            exif: {
                make: anyExif?.Make,
                model: anyExif?.Model,
                lens: anyExif?.LensModel,
                focalLength: anyExif?.FocalLength ? `${anyExif.FocalLength}mm` : undefined,
                aperture: anyExif?.FNumber ? `f/${anyExif.FNumber}` : undefined,
                exposureTime: anyExif?.ExposureTime ? `1/${Math.round(1 / anyExif.ExposureTime)}s` : undefined,
                iso: anyExif?.ISO ? String(anyExif.ISO) : undefined,
                gps: anyExif?.latitude && anyExif?.longitude ? {
                    latitude: anyExif.latitude,
                    longitude: anyExif.longitude,
                    altitude: anyExif.altitude
                } : undefined
            }
        };

        // Try to refine location using reverse geocoding if we had an API key, 
        // but for now we'll rely on the user or raw GPS.
        if (newPhoto.exif.gps) {
            try {
                const { latitude, longitude } = newPhoto.exif.gps;
                // Add a small delay/timeout to avoid spamming the API if uploading multiple
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                    {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.address) {
                        const address = data.address;
                        // Extract detailed parts (Road > Suburb > City)
                        const specific = address.road || address.pedestrian || address.suburb || address.neighbourhood || address.residential || address.park || address.tourism || address.amenity;
                        const city = address.city || address.town || address.village || address.city_district || address.county;
                        const country = address.country;

                        if (specific && city && country) {
                            newPhoto.location = `${specific}, ${city}, ${country}`;
                        } else if (city && country) {
                            newPhoto.location = `${city}, ${country}`;
                        } else if (country) {
                            newPhoto.location = country;
                        } else {
                            newPhoto.location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                        }
                    } else {
                        newPhoto.location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    }
                } else {
                    newPhoto.location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                }
            } catch (error) {
                console.warn("Reverse geocoding failed:", error);
                newPhoto.location = `${newPhoto.exif.gps.latitude.toFixed(4)}, ${newPhoto.exif.gps.longitude.toFixed(4)}`;
            }
        }

        // AI classification pipeline (CLIP + Depth + EXIF)
        try {
            console.log('[Upload] Starting AI analysis pipeline...')
            const { analyzePhoto } = await import('@/lib/ai/photo-intelligence')
            const aiAnalysis = await analyzePhoto(filePath, newPhoto)
            newPhoto.category = aiAnalysis.category
            newPhoto.tags = aiAnalysis.tags
            newPhoto.metadata = aiAnalysis.metadata
            newPhoto.confidence = aiAnalysis.confidence
            console.log('[Upload] ✅ AI analysis complete (CLIP-based)')
            console.log('[Upload] Category:', newPhoto.category)
            console.log('[Upload] Tag count:', newPhoto.tags.length)
            console.log('[Upload] Lighting:', newPhoto.metadata.lighting)
            console.log('[Upload] Mood:', newPhoto.metadata.mood)
            console.log('[Upload] DOF:', newPhoto.metadata.composition?.depthOfField)
        } catch (aiError) {
            console.error('[Upload] ⚠️ AI analysis failed, falling back to ViT:', aiError)
            try {
                const { classifyImage } = await import('@/lib/image-classifier')
                const classifyResult = await classifyImage(filePath)
                newPhoto.tags = classifyResult.tags || []
                newPhoto.category = classifyResult.category || 'other'
                console.log('[Upload] ✅ Fallback classifier used')
            } catch (fallbackError) {
                console.error('[Upload] ❌ Both classifiers failed:', fallbackError)
                newPhoto.tags = ['unclassified']
                newPhoto.category = 'other'
            }
        }

        // Auto-title if it's a default IMG_xxx
        if (needsAutoTitle(newPhoto.title)) {
            newPhoto.title = generateAutoTitle({
                title: newPhoto.title,
                location: newPhoto.location,
                category: newPhoto.category,
            });
        } else {
            newPhoto.title = cleanPhotoTitle(newPhoto.title, {
                location: newPhoto.location,
                category: newPhoto.category,
            });
        }

        await savePhoto(newPhoto);

        // Send enriched payload back to client
        const series = inferSeries(newPhoto);
        return NextResponse.json({
            success: true,
            photo: {
                ...newPhoto,
                series,
                cdnSrc: withCdn(newPhoto.src),
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
