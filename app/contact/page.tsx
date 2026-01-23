"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Mail, Instagram, Twitter, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
    return (
        <div className="min-h-screen pb-20">
            <AnimatedBackground />

            <main className="container mx-auto px-4 pt-32">
                <div className="max-w-5xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-primary/5 p-8 lg:p-12 shadow-[0_30px_120px_rgba(0,0,0,0.35)] mb-12">
                        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
                        <div className="relative z-10 space-y-3 text-center">
                            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Contact</p>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                Get in Touch
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Available for commissions, collaborations, or just a coffee chat.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <GlassCard className="p-8">
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Name</label>
                                    <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Email</label>
                                    <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Message</label>
                                    <textarea rows={4} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Tell me about your project..." />
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Send Message <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </GlassCard>

                        <div className="space-y-6">
                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Email</h3>
                                    <p className="text-muted-foreground text-sm">hello@jayguri.com</p>
                                </div>
                            </GlassCard>

                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                                    <Instagram className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Instagram</h3>
                                    <p className="text-muted-foreground text-sm">@jay.guri_</p>
                                </div>
                            </GlassCard>

                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                                    <Twitter className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Twitter/X</h3>
                                    <p className="text-muted-foreground text-sm">@jayguri</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
