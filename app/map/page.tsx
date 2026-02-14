import { getAllPhotos } from "@/lib/photo-storage";
import { Navbar } from "@/components/layout/navbar";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { MapView } from "@/components/map/map-view";

export const dynamic = "force-dynamic";

function toCoordinates(photo: any) {
  if (photo.coordinates) return photo;
  if (photo.exif?.gps) {
    return {
      ...photo,
      coordinates: { lat: photo.exif.gps.latitude, lng: photo.exif.gps.longitude },
    };
  }
  return photo;
}

export default async function MapPage() {
  const photosRaw = await getAllPhotos();
  const photos = photosRaw.map(toCoordinates);
  const hasCoords = photos.some((p) => p.coordinates);

  return (
    <div className="min-h-screen pb-16 bg-background text-foreground">
      <AnimatedBackground />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Map View</p>
          <h1 className="text-4xl font-bold">Where these frames were captured</h1>
          <p className="text-muted-foreground">
            Filter by series and tap pins to preview each shot. Zoom out to see clusters across Canada and India.
          </p>
        </div>

        {hasCoords ? (
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <p>Could not load the 3D map. Please refresh the page.</p>
              </div>
            }
          >
            <MapView photos={photos} />
          </ErrorBoundary>
        ) : (
          <p className="text-muted-foreground">No GPS data found for your photos yet.</p>
        )}
      </main>
    </div>
  );
}

