import { Photo } from "@/types/photo";
import fs from "fs/promises";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "photos.json");
const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

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
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data) as Photo[];
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
    const photos = await getAllPhotos();
    return photos.find((p) => p.id === id);
}

export async function savePhoto(photo: Photo): Promise<void> {
    const photos = await getAllPhotos();
    const existsIndex = photos.findIndex((p) => p.id === photo.id);

    if (existsIndex >= 0) {
        photos[existsIndex] = photo;
    } else {
        // Add new photo at the beginning
        photos.unshift(photo);
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(photos, null, 2));
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
}
