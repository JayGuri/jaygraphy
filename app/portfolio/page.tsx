import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { getAllPhotos } from "@/lib/photo-storage";
import { AnimatedBackground } from "@/components/ui/animated-background";

export const dynamic = 'force-dynamic';

export default async function Portfolio() {
    const photos = await getAllPhotos();

    return (
        <div className="min-h-screen pb-20 bg-background text-foreground transition-colors duration-300">
            <AnimatedBackground />

            <main className="container mx-auto max-w-7xl px-4 pt-28 bg-background text-foreground transition-colors duration-300">
                <div className="mb-6 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary/5 p-5 lg:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
                    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="relative z-10 space-y-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Portfolio</p>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Bodies of work, tightly curated</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Shot across coastlines, cities, and hills. Filter by series, search by title, and dive into the details without losing the flow.
                        </p>
                    </div>
                </div>

                <PortfolioGrid initialPhotos={photos} />
            </main>
        </div>
    );
}
