import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { getAllPhotos } from "@/lib/photo-storage";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const dynamic = 'force-dynamic';

export default async function Portfolio() {
    const photos = await getAllPhotos();

    return (
        <div className="min-h-screen pb-20 bg-background text-foreground transition-colors duration-300">
            <AnimatedBackground />

            <main className="container mx-auto px-4 pt-28 bg-background text-foreground transition-colors duration-300">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">My Work</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        From the crystal-clear waters of the Grotto to the vibrant streets of Montreal and Toronto. Each photo tells a story—filter, search, and explore.
                    </p>
                </div>

                <PortfolioGrid initialPhotos={photos} />
            </main>
        </div>
    );
}
