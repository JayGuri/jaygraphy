export interface Photo {
    id: string;
    title: string;
    category: 'street' | 'nature' | 'city' | 'portrait' | 'landscape' | 'minimal' | 'other' | string;
    series?: 'niagara' | 'bruce' | 'montreal' | 'toronto' | 'goa' | 'kerala' | 'bhuj' | 'quebec' | 'etobicoke' | string;
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
    uploadedAt: string;
    takenAt?: string;

    // Derived/UX fields
    cdnSrc?: string;
    displayTitle?: string;

    // AI analysis metadata
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

    exif: {
        make?: string;
        model?: string;
        lens?: string;
        focalLength?: string;
        aperture?: string;
        shutterType?: string;
        exposureTime?: string;
        iso?: string;
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

export type PhotoFormData = Omit<Photo, 'id' | 'src' | 'width' | 'height' | 'uploadedAt' | 'exif'>;
