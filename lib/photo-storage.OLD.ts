import { Photo } from "@/types/photo";
import fs from "fs/promises";
import path from "path";
import { withCdn } from "./cdn";
import { inferSeries } from "./series";
import { cleanPhotoTitle } from "./title";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "photos.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

let cachedPhotos: Photo[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;

export async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE_PATH);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }

    try {
        await fs.access(PHOTOS_DIR);
    } catch {
        await fs.mkdir(PHOTOS_DIR, { recursive: true });
    }

    try {
        await fs.access(DATA_FILE_PATH);
    } catch {
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2));
    }
}

export async function getAllPhotos(): Promise<Photo[]> {
    if (cachedPhotos !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
        return cachedPhotos;
    }

    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const photos = JSON.parse(data) as Photo[];

    const result = photos.map((photo) => {
        const series = inferSeries(photo);
        const displayTitle = cleanPhotoTitle(photo.title, {
            location: photo.location,
            category: photo.category,
        });

        return {
            ...photo,
            series: series ?? photo.series,
            displayTitle,
            cdnSrc: withCdn(photo.src),
        };
    });

    cachedPhotos = result;
    cacheTimestamp = Date.now();
    return result;
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
    const photos = await getAllPhotos();
    return photos.find((p) => p.id === id);
}

export async function savePhoto(photo: Photo): Promise<void> {
    const photos = await getAllPhotos();
    const existsIndex = photos.findIndex((p) => p.id === photo.id);

    const { cdnSrc: _cdn, displayTitle: _displayTitle, ...rest } = photo;

    const series = inferSeries(rest);
    const normalizedTitle = cleanPhotoTitle(photo.title, {
        location: rest.location,
        category: rest.category,
    });

    const persistable: Photo = {
        ...rest,
        series: series ?? rest.series,
        title: normalizedTitle,
    };

    if (existsIndex >= 0) {
        photos[existsIndex] = persistable;
    } else {
        // Add new photo at the beginning
        photos.unshift(persistable);
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(photos, null, 2));
    cachedPhotos = null;
}

export async function deletePhoto(id: string): Promise<void> {
    const photos = await getAllPhotos();
    const photo = photos.find((p) => p.id === id);

    if (!photo) return;

    // Remove file
    try {
        // Determine file path from src (assuming src is like /photos/filename.jpg)
        const filename = photo.src.split("/").pop();
        if (filename) {
            const filePath = path.join(PHOTOS_DIR, filename);
            await fs.unlink(filePath);
        }
    } catch (error) {
        console.error("Error deleting image file:", error);
    }

    const newPhotos = photos.filter((p) => p.id !== id);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(newPhotos, null, 2));
    cachedPhotos = null;
}
