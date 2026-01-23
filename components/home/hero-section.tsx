"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Globe, Aperture, ScanLine } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    const { scrollY } = useScroll();
    const blobY = useTransform(scrollY, [0, 400], [0, -60]);
    const blobY2 = useTransform(scrollY, [0, 400], [0, 40]);

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center -mt-8 pt-12 transition-colors duration-300 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div style={{ y: blobY }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
                <motion.div style={{ y: blobY2 }} className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-purple-500/15 rounded-full blur-[140px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(6,182,212,0.12),transparent_45%)]" />
                <div className="absolute inset-0 opacity-[0.15] mix-blend-soft-light bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_30%,transparent_60%)]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-foreground max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 font-medium font-mono backdrop-blur">
                        <Globe className="w-4 h-4" />
                        <span>GLOBAL PERSPECTIVE</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] drop-shadow-lg">
                        <span className="text-foreground dark:text-white transition-colors">Jaygraphy:</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-glow">
                            Frames with intent
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Engineering student by day, photographer by choice. From the Grotto’s blue caves to late-night city light trails—every set is sequenced, color-managed, and treated like a finished series.
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/portfolio">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 overflow-hidden shimmer"
                            >
                                <span className="relative z-10">View Portfolio</span>
                                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </motion.button>
                        </Link>

                        <Link href="/about">
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-full border border-white/10 text-white font-medium backdrop-blur-sm transition-colors"
                            >
                                About Me
                            </motion.button>
                        </Link>
                        <div className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-sm text-muted-foreground/80">
                            <Aperture className="w-4 h-4 text-primary" />
                            <div>
                                <p className="font-semibold text-foreground">Color + clarity</p>
                                <p className="text-xs">Intentional grading, clean delivery, zero clutter.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-10 border border-white/5 rounded-[32px] backdrop-blur-[1px] opacity-50" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-white/40 flex items-center gap-2">
                    <ScanLine className="w-4 h-4" />
                    VIEWFINDER
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            </motion.div>
        </section>
    );
}
