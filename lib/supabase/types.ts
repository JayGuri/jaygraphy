import type { Photo } from "@/types/photo";

// Supabase database types
export interface SupabasePhoto {
  id: string;
  title: string;
  display_title?: string;
  category: string;
  series?: string;
  tags: string[];
  storage_path: string;
  width: number;
  height: number;
  blur_data_url?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  dms?: string;
  exif: Record<string, any>;
  metadata?: {
    lighting?: string;
    mood?: string;
    composition?: {
      techniques: string[];
      depthOfField: string;
      hasLayering: boolean;
    };
  };
  confidence?: {
    category?: number;
    lighting?: number;
    mood?: number;
  };
  description?: string;
  behind_the_shot?: string;
  exif_toggle_hidden: boolean;
  uploaded_at: string;
  taken_at?: string;
}

// Helper to convert Supabase photo to app Photo type
export function toAppPhoto(supabasePhoto: SupabasePhoto): Photo {
  return {
    id: supabasePhoto.id,
    title: supabasePhoto.title,
    displayTitle: supabasePhoto.display_title || supabasePhoto.title,
    category: supabasePhoto.category,
    series: supabasePhoto.series,
    tags: supabasePhoto.tags,

    // Generate CDN URL from storage_path
    src: `/api/photo/${supabasePhoto.id}`, // We'll create this endpoint
    cdnSrc: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${supabasePhoto.storage_path}`,

    width: supabasePhoto.width,
    height: supabasePhoto.height,
    blurDataURL: supabasePhoto.blur_data_url,

    location: supabasePhoto.location ?? "Unknown Location",
    coordinates: supabasePhoto.coordinates,
    dms: supabasePhoto.dms,

    exif: supabasePhoto.exif,
    metadata: supabasePhoto.metadata,
    confidence: supabasePhoto.confidence,

    description: supabasePhoto.description,
    behindTheShot: supabasePhoto.behind_the_shot,
    exifToggleHidden: supabasePhoto.exif_toggle_hidden,

    uploadedAt: supabasePhoto.uploaded_at,
    takenAt: supabasePhoto.taken_at,
  };
}

