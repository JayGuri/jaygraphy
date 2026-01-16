import { Navbar } from "@/components/layout/navbar";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Camera, MapPin, Coffee, Code, Sparkles, Compass } from "lucide-react";

export default function About() {
    return (
        <div className="min-h-screen pb-20 bg-background text-foreground transition-colors duration-300">
            <AnimatedBackground />
            <Navbar />

            <main className="container mx-auto px-4 pt-32">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            About Jaygraphy
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            I’m Jay, an engineering student and photographer blending tech discipline with storytelling.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-8">
                        <GlassCard className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                                <Camera className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">The Philosophy</h3>
                            <p className="text-muted-foreground">
                                Photography is how I preserve feeling. I chase candid light in chaotic cities and the vast silence of nature, aiming for frames that feel lived-in, not staged.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                                <Code className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">The Tech</h3>
                            <p className="text-muted-foreground">
                                Sony-first, mobile-second. I edit with restraint—color theory, clean contrast, zero gimmicks. This portfolio is a live lab built with Next.js to ship ideas fast.
                            </p>
                        </GlassCard>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <GlassCard className="p-6 space-y-3">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Signature</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Moody blues, clean lines, and human scale—balancing softness in nature with structure in cities.
                            </p>
                        </GlassCard>
                        <GlassCard className="p-6 space-y-3">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <Compass className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Destinations</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Bruce Peninsula, Niagara Falls, Montreal nights, Toronto streets, Kerala tea hills, Goa coasts.
                            </p>
                        </GlassCard>
                        <GlassCard className="p-6 space-y-3">
                            <div className="flex items-center gap-3 text-amber-400">
                                <Coffee className="w-5 h-5" />
                                <h3 className="text-lg font-bold">Workflow</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Shoot → Cull → Color in Lightroom → Ship. No over-processing; let the light breathe.
                            </p>
                        </GlassCard>
                    </div>

                    <GlassCard className="p-8 mt-6">
                        <h3 className="text-xl font-bold mb-6">Gear & Toolkit</h3>
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
