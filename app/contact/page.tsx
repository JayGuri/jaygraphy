"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { Mail, Instagram, Github, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });

            if (res.ok) {
                setSubmitStatus('success');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setSubmitStatus('error');
            }
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                        placeholder="Tell me about your project..."
                                    />
                                </div>

                                {submitStatus === 'success' && (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-4 rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Message sent! I'll get back to you soon.</span>
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-lg">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>Something went wrong. Please try again.</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </GlassCard>

                        <div className="space-y-6">
                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer" onClick={() => window.open('mailto:jaymanishguri@gmail.com')}>
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Email</h3>
                                    <p className="text-muted-foreground text-sm">jaymanishguri@gmail.com</p>
                                </div>
                            </GlassCard>

                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer" onClick={() => window.open('https://instagram.com/jaymanishguri', '_blank')}>
                                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                                    <Instagram className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Instagram</h3>
                                    <p className="text-muted-foreground text-sm">@jaymanishguri</p>
                                </div>
                            </GlassCard>

                            <GlassCard hoverEffect className="p-6 flex items-center gap-4 cursor-pointer" onClick={() => window.open('https://github.com/JayGuri', '_blank')}>
                                <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-400">
                                    <Github className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">GitHub</h3>
                                    <p className="text-muted-foreground text-sm">@JayGuri</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
