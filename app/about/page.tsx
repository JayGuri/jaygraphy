import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Camera, MapPin, Coffee, Code } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen pb-20">
            <AnimatedBackground />
            <Navbar />

            <main className="container mx-auto px-4 pt-32">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            Behind the Lens
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            I'm Jay, a photographer and engineer obsessed with the intersection of technology and art.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-8">
                        <GlassCard className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                                <Camera className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">The Philosophy</h3>
                            <p className="text-muted-foreground">
                                I believe photography is more than just capturing light—it's about preserving a feeling.
                                My work focuses on the candid, the quiet moments in chaotic cities, and the vast silence of nature.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                                <Code className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">The Tech</h3>
                            <p className="text-muted-foreground">
                                Shot primarily on Sony Alpha systems. Edited with a focus on color theory and mood.
                                This portfolio itself is an experiment in digital expression, built with Next.js and modern web technologies.
                            </p>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-8 mt-8">
                        <h3 className="text-xl font-bold mb-6">Equipment Bag</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                                <span className="block font-bold text-blue-300">Sony a6400</span>
                                <span className="text-xs text-muted-foreground">Primary Body</span>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                                <span className="block font-bold text-blue-300">Sigma 30mm</span>
                                <span className="text-xs text-muted-foreground">f/1.4 DC DN</span>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                                <span className="block font-bold text-blue-300">Sony 18-135</span>
                                <span className="text-xs text-muted-foreground">OSS Lens</span>
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                                <span className="block font-bold text-blue-300">Lightroom</span>
                                <span className="text-xs text-muted-foreground">Processing</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
}
