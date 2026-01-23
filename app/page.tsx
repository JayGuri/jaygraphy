import { HeroSection } from "@/components/home/hero-section";
import { FeaturedStories } from "@/components/home/featured-stories";
import { LocationPins } from "@/components/home/location-pins";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { getAllPhotos } from "@/lib/photo-storage";
import { TripTimeline } from "@/components/home/trip-timeline";
import { MagicBento } from "@/components/ui/magic-bento";
import { RecentlyAdded } from "@/components/home/recently-added";
import { CameraLoader } from "@/components/ui/camera-loader";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const photos = await getAllPhotos();
  const featuredPhotos = [...photos].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 10);
  const heroBentoPhotos = photos.slice(0, 6);

  return (
    <div className="min-h-screen relative overflow-hidden no-scrollbar bg-background text-foreground transition-colors duration-300">
      <CameraLoader />
      <AnimatedBackground />

      <main className="relative z-10 overflow-hidden bg-background text-foreground">
        <HeroSection />
        <section className="flex justify-center py-8">
          <MagicBento photos={heroBentoPhotos} enableTilt enableSpotlight enableStars enableBorderGlow glowColor="132, 0, 255" />
        </section>
        <RecentlyAdded photos={photos} />
        <FeaturedStories photos={featuredPhotos} />
        <LocationPins />
        <TripTimeline />
      </main>
    </div>
  );
}
