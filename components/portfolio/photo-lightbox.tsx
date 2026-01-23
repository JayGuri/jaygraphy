"use client";

import { Photo } from "@/types/photo";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, MapPin, Calendar, Share2, Download, Maximize2, Heart, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { buildGoogleMapsUrlFromGps, buildGoogleMapsUrlFromLocation, formatDMS } from "@/lib/location";
import { useFavorites } from "@/components/favorites/use-favorites";

interface PhotoLightboxProps {
    photo: Photo;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function PhotoLightbox({ photo, onClose, onNext, onPrev }: PhotoLightboxProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const fav = isFavorite(photo.id);
    const [showStory, setShowStory] = useState(false);
    const imageSrc = photo.cdnSrc || photo.src;
    const displayTitle = photo.displayTitle || photo.title;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight" && onNext) onNext();
            if (e.key === "ArrowLeft" && onPrev) onPrev();
            if (e.key.toLowerCase() === "f") {
                const el = document.querySelector("#lightbox-img") as HTMLElement | null;
                if (el && el.requestFullscreen) {
                    el.requestFullscreen().catch(() => { });
                }
            }
            if (e.key.toLowerCase() === "h") {
                toggleFavorite(photo.id);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, onNext, onPrev, toggleFavorite, photo.id]);

    const mapsUrl = photo.exif?.gps
        ? buildGoogleMapsUrlFromGps(photo.exif.gps.latitude, photo.exif.gps.longitude)
        : buildGoogleMapsUrlFromLocation(photo.location);

    const dms =
        photo.exif?.gps && formatDMS(photo.exif.gps.latitude, photo.exif.gps.longitude);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8"
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-50 rounded-full hover:bg-white/10"
            >
                <X className="w-8 h-8" />
            </button>

            {onPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 pointer-events-auto"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {onNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-50 pointer-events-auto"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl h-full items-center justify-center">
                {/* Main Image */}
                <div className="flex-1 relative w-full h-full flex items-center justify-center">
                    <button
                        onClick={() => toggleFavorite(photo.id)}
                        className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/80 transition z-50"
                        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart className="w-5 h-5" fill={fav ? "currentColor" : "none"} />
                    </button>
                    <motion.img
                        id="lightbox-img"
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={imageSrc}
                        alt={displayTitle}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                </div>

                {/* Info Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-[500px] flex-shrink-0"
                >
                    <GlassCard className="h-full max-h-[85vh] overflow-y-auto w-full bg-black/40 border-white/10 p-6">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{displayTitle}</h2>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-2 text-blue-400 font-medium">
                                        <span className="uppercase tracking-widest">{photo.category}</span>
                                        {photo.location && (
                                            <>
                                                <span>•</span>
                                                <a
                                                    href={mapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 hover:underline underline-offset-2"
                                                >
                                                    <MapPin className="w-3 h-3" /> {photo.location}
                                                </a>
                                            </>
                                        )}
                                    </div>
                                    {dms && (
                                        <a
                                            href={mapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-muted-foreground hover:text-blue-300 hover:underline underline-offset-2 flex items-center gap-1"
                                        >
                                            <MapPin className="w-3 h-3" />
                                            <span>{dms}</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <p className="text-muted-foreground leading-relaxed">
                                {photo.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center min-h-[100px] space-y-2 hover:bg-white/10 transition-colors">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Camera</span>
                                    <span className="text-base font-medium flex items-center gap-2 text-white">
                                        <Camera className="w-4 h-4 text-blue-400" />
                                        {photo.exif.model || "Unknown"}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center min-h-[100px] space-y-2 hover:bg-white/10 transition-colors">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Lens</span>
                                    <span className="text-base font-medium text-white leading-snug">
                                        {photo.exif.lens || "Unknown"}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center min-h-[100px] space-y-2 hover:bg-white/10 transition-colors">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Settings</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-base font-medium text-white/90">
                                        <span>{photo.exif.aperture}</span>
                                        <span>{photo.exif.exposureTime}</span>
                                        <span>ISO {photo.exif.iso}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-center min-h-[100px] space-y-2 hover:bg-white/10 transition-colors">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest">Focal Length</span>
                                    <span className="text-base font-medium text-white">
                                        {photo.exif.focalLength || "--"}
                                    </span>
                                </div>
                            </div>

                            {photo.tags && photo.tags.length > 0 && (
                                <div className="pt-4 border-t border-white/5">
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block">Tags</span>
                                    <div className="flex flex-wrap gap-2">
                                        {photo.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-wide text-muted-foreground border border-white/5"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {photo.takenAt && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-white/5">
                                    <Calendar className="w-3 h-3" />
                                    TAKEN ON {new Date(photo.takenAt).toLocaleDateString()}
                                </div>
                            )}

                            {photo.behindTheShot && (
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <button
                                        onClick={() => setShowStory((v) => !v)}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition ${showStory ? "rotate-180" : ""}`} />
                                        Behind the shot
                                    </button>
                                    {showStory && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {photo.behindTheShot}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <a
                                    href={imageSrc}
                                    download
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </a>
                                <button
                                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm transition-colors"
                                >
                                    <Share2 className="w-4 h-4" /> Copy Link
                                </button>
                                <button
                                    onClick={() => {
                                        const el = document.querySelector("#lightbox-img") as HTMLElement | null;
                                        if (el && el.requestFullscreen) el.requestFullscreen().catch(() => { });
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm transition-colors"
                                >
                                    <Maximize2 className="w-4 h-4" /> Fullscreen (F)
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
