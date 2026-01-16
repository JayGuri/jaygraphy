export interface Photo {
    id: string;
    title: string;
    // Flexible category system but keeping some standard ones for type safety suggestion
    category: "street" | "nature" | "city" | "portrait" | "landscape" | "minimal" | "other" | string;
    series?: "niagara" | "bruce" | "montreal" | "toronto" | "goa" | "kerala" | "bhuj" | "quebec" | "etobicoke" | string;
    location: string;
    coordinates?: { lat: number; lng: number };
    dms?: string;
    description?: string;
    behindTheShot?: string;
    exifToggleHidden?: boolean;
    src: string;
    width: number;
    height: number;
    blurDataURL?: string;
    tags: string[];
    uploadedAt: string; // ISO string
    takenAt?: string;   // ISO string from EXIF

    exif: {
        make?: string;      // e.g. "Sony"
        model?: string;     // e.g. "ILCE-6400"
        lens?: string;      // e.g. "E 35mm F1.8 OSS"
        focalLength?: string; // e.g. "35 mm"
        aperture?: string;  // e.g. "f/1.8"
        shutterType?: string;
        exposureTime?: string; // e.g. "1/100"
        iso?: string;       // e.g. "400"
        flash?: string;
        whiteBalance?: string;
        meteringMode?: string;
        orientation?: string;
        gps?: {
            latitude: number;
            longitude: number;
            altitude?: number;
        };
    };
}

export type PhotoFormData = Omit<Photo, "id" | "src" | "width" | "height" | "uploadedAt" | "exif">;
