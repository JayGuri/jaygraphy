import { NextRequest, NextResponse } from "next/server";
import { savePhoto } from "@/lib/photo-storage";
import { Photo } from "@/types/photo";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
import exifr from "exifr";
import { classifyImage } from "@/lib/image-classifier";
import { needsAutoTitle, generateAutoTitle } from "@/lib/title";

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


        // EXIF already parsed above

        // Type assertion or checks would be better here, but for now we map as best we can
        const anyExif = exifData as any;

        const newPhoto: Photo = {
            id: uuidv4(),
            title: file.name.split(".")[0],
            category: "street", // default; refined by classifier below
            location: "Unknown Location",
            src: `/photos/${filename}`,
            width: 0, // Would need image processing lib to get dimensions if exifr doesn't give them nicely, or check exifr output
            height: 0,
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

        // Classify image to derive category and tags
        try {
            const classification = await classifyImage(filePath);
            if (classification.tags?.length) {
                newPhoto.tags = classification.tags;
            }
            if (classification.category) {
                newPhoto.category = classification.category;
            }
        } catch (error) {
            console.warn("Image classification failed; using defaults:", error);
        }

        // Auto-title if it's a default IMG_xxx
        if (needsAutoTitle(newPhoto.title)) {
            newPhoto.title = generateAutoTitle({
                title: newPhoto.title,
                location: newPhoto.location,
                category: newPhoto.category,
                takenAt: newPhoto.takenAt,
            });
        }

        await savePhoto(newPhoto);

        return NextResponse.json({ success: true, photo: newPhoto });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
