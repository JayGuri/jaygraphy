import { HeroSection } from "@/components/home/hero-section";
import { FeaturedStrip } from "@/components/home/featured-strip";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Navbar } from "@/components/layout/navbar";
import { getAllPhotos } from "@/lib/photo-storage";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const photos = await getAllPhotos();
  const featuredPhotos = photos.slice(0, 10); // Get latest 10

  return (
    <div className="min-h-screen relative overflow-hidden no-scrollbar bg-background text-foreground transition-colors duration-300">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 overflow-hidden bg-background text-foreground">
        <HeroSection />
        <FeaturedStrip photos={featuredPhotos} />
      </main>
    </div>
  );
}
