"use client";

import { Photo } from "@/types/photo";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { buildGoogleMapsUrlFromGps, buildGoogleMapsUrlFromLocation } from "@/lib/location";

interface FeaturedStripProps {
    photos: Photo[];
}

export function FeaturedStrip({ photos }: FeaturedStripProps) {
    if (photos.length === 0) {
        return (
            <section className="py-20 relative z-10 transition-colors duration-300 text-foreground">
                <div className="container mx-auto px-4 text-center">
                    <GlassCard className="p-12 mb-8">
                        <h3 className="text-2xl font-bold mb-4">No Photos Yet</h3>
                        <p className="text-muted-foreground mb-8">Upload your shots to populate the featured section.</p>
                        <Link href="/upload" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
                            Upload Photos
                        </Link>
                    </GlassCard>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 relative z-10 bg-background/60 backdrop-blur-sm border-y border-border transition-colors duration-300 text-foreground">
            <div className="container mx-auto px-4 mb-10 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Captures</h2>
                    <p className="text-muted-foreground">Recent additions to the gallery</p>
                </div>
                <Link href="/portfolio" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm font-medium">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div 
                className="flex overflow-x-auto pb-8 gap-6 px-4 snap-x snap-mandatory -mx-4 md:container md:mx-auto md:px-4" 
                style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {photos.map((photo, index) => {
                    const mapsUrl = photo.exif?.gps
                        ? buildGoogleMapsUrlFromGps(photo.exif.gps.latitude, photo.exif.gps.longitude)
                        : buildGoogleMapsUrlFromLocation(photo.location);

                    return (
                    <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-80 md:w-96 snap-center"
                    >
                        <Link href={`/portfolio?photo=${photo.id}`}>
                            <GlassCard hoverEffect className="h-full p-2 group relative overflow-hidden">
                                <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-3">
                                    <img
                                        src={photo.src}
                                        alt={photo.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            {photo.exif.model && (
                                                <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                                                    <Camera className="w-3 h-3" />
                                                    <span>{photo.exif.model}</span>
                                                </div>
                                            )}
                                            {photo.exif.lens && (
                                                <p className="text-[10px] text-white/60 mb-2">{photo.exif.lens}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="px-2 pb-2 space-y-1">
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                                        {photo.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <a
                                            href={mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:text-blue-300 hover:underline underline-offset-2"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate max-w-[11rem] md:max-w-[14rem]">
                                                {photo.location}
                                            </span>
                                        </a>
                                        <span className="uppercase tracking-wider opacity-60">
                                            {photo.category}
                                        </span>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>
                    );
                })}

                {/* View All Card */}
                <div className="flex-shrink-0 w-40 flex items-center justify-center snap-center">
                    <Link href="/portfolio" className="group flex flex-col items-center gap-4 text-muted-foreground hover:text-white transition-colors">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium">View All</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
