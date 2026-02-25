import { supabase } from "./client";
import { supabaseAdmin } from "./server";
import type { SupabasePhoto } from "./types";
import { toAppPhoto } from "./types";
import type { Photo } from "@/types/photo";
import { inferSeries } from "@/lib/series";
import { cleanPhotoTitle } from "@/lib/title";

// Get all photos (replaces old getAllPhotos from lib/photo-storage.ts)
export async function getAllPhotos(): Promise<Photo[]> {
  console.log("[Supabase] Fetching all photos...");

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch photos:", error);
    return [];
  }

  console.log(`[Supabase] Fetched ${data?.length || 0} photos`);

  // Convert to app format and enrich
  return (data as SupabasePhoto[]).map((photo) => {
    const appPhoto = toAppPhoto(photo);

    // Enrich with inferred series if not set
    if (!appPhoto.series) {
      appPhoto.series = inferSeries(appPhoto);
    }

    // Clean display title
    appPhoto.displayTitle = cleanPhotoTitle(appPhoto.title);

    return appPhoto;
  });
}

// Get single photo by ID
export async function getPhotoById(id: string): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("[Supabase] Photo not found:", id);
    return null;
  }

  const appPhoto = toAppPhoto(data as SupabasePhoto);

  // Enrich
  if (!appPhoto.series) {
    appPhoto.series = inferSeries(appPhoto);
  }
  appPhoto.displayTitle = cleanPhotoTitle(appPhoto.title);

  return appPhoto;
}

// Save photo (insert or update)
export async function savePhoto(
  photo: Partial<SupabasePhoto>
): Promise<SupabasePhoto | null> {
  console.log("[Supabase] Saving photo:", photo.title);

  // Clean the title before saving
  const cleanedTitle = photo.title ? cleanPhotoTitle(photo.title) : undefined;

  // Use admin client for server-side operations
  const { data, error } = await supabaseAdmin
    .from("photos")
    .upsert({
      ...photo,
      display_title: cleanedTitle,
    })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Failed to save photo:", error);
    return null;
  }

  console.log("[Supabase] Photo saved successfully:", (data as SupabasePhoto).id);
  return data as SupabasePhoto;
}

// Delete photo
export async function deletePhoto(id: string): Promise<boolean> {
  console.log("[Supabase] Deleting photo:", id);

  // First, get the storage path so we can delete the file
  const { data: photo } = await supabaseAdmin
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (photo?.storage_path) {
    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("photos")
      .remove([photo.storage_path]);

    if (storageError) {
      console.error("[Supabase] Failed to delete from storage:", storageError);
    }
  }

  // Delete from database
  const { error } = await supabaseAdmin
    .from("photos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Supabase] Failed to delete photo from database:", error);
    return false;
  }

  console.log("[Supabase] Photo deleted successfully");
  return true;
}

// Upload image to Supabase Storage
export async function uploadImageToStorage(
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  console.log("[Supabase] Uploading image to storage:", filename);

  const { data, error } = await supabaseAdmin.storage
    .from("photos")
    .upload(filename, buffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    console.error("[Supabase] Failed to upload image:", error);
    return null;
  }

  console.log("[Supabase] Image uploaded successfully:", data.path);
  return data.path;
}

