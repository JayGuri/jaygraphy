"use client";

import { motion } from "framer-motion";
import { ArrowRight, Camera, Globe } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center -mt-20 pt-20 transition-colors duration-300">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10 text-foreground">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 font-medium font-mono"
                        >
                            <Globe className="w-4 h-4" />
                            <span>GLOBAL PERSPECTIVE</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                            <span className="text-white">Capturing</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-glow">
                                The Unseen
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                            Engineering student by day, photographer by passion. Capturing moments from the Grotto to city streets, documenting the world through my lens—one frame at a time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/portfolio">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 overflow-hidden"
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
                    </div>

                    <div className="flex items-center gap-8 pt-4 border-t border-white/10">
                        <div>
                            <p className="text-3xl font-bold text-white">Canada</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest">To India</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">Bruce</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest">Peninsula</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">iPhone</p>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest">14 Pro</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative hidden lg:block"
                >
                    <div className="relative z-10 grid grid-cols-2 gap-4">
                        <GlassCard className="col-span-2 aspect-video bg-muted/20 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 group-hover:opacity-100 transition-opacity opacity-50" />
                            <div className="absolute bottom-4 left-4">
                                <p className="text-xs font-mono text-blue-200">LATEST CAPTURE</p>
                                <p className="font-bold">Tokyo Nights</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="aspect-square bg-muted/20 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                <Camera className="w-12 h-12" />
                            </div>
                        </GlassCard>
                        <GlassCard className="aspect-square bg-blue-600/10 border-blue-500/30 overflow-hidden relative flex items-center justify-center">
                            <div className="text-center p-4">
                                <p className="text-6xl font-bold text-blue-400">Sony</p>
                                <p className="font-mono text-sm text-blue-200/70">ALPHA 6400</p>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-blue-500 to-transparent opacity-20 blur-3xl rounded-full" />
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-cyan-500 to-transparent opacity-20 blur-3xl rounded-full" />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            </motion.div>
        </section>
    );
}
