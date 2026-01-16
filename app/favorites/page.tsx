import { getAllPhotos } from "@/lib/photo-storage";
import { Navbar } from "@/components/layout/navbar";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { FavoritesGrid } from "@/components/favorites/favorites-grid";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const photos = await getAllPhotos();

  return (
    <div className="min-h-screen pb-16 bg-background text-foreground">
      <AnimatedBackground />
      <Navbar />
      <main className="container mx-auto px-4 pt-28 space-y-8">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Favorites</p>
          <h1 className="text-4xl font-bold">Your shortlist</h1>
          <p className="text-muted-foreground">Heart photos to build a shortlist across sessions. You can clear or share the selection.</p>
        </div>
        <FavoritesGrid photos={photos} />
      </main>
    </div>
  );
}

