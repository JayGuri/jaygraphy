"use client";

import { Photo } from "@/types/photo";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoLightbox } from "@/components/portfolio/photo-lightbox";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Filter, MapPin, SlidersHorizontal, Search, Tag, ChevronLeft, ChevronRight, Camera, Aperture, Zap, GaugeCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildGoogleMapsUrlFromGps, buildGoogleMapsUrlFromLocation } from "@/lib/location";

interface PortfolioGridProps {
    initialPhotos: Photo[];
}

export function PortfolioGrid({ initialPhotos }: PortfolioGridProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [filter, setFilter] = useState(() => searchParams.get("category") || "all");
    const [seriesFilter, setSeriesFilter] = useState(() => searchParams.get("series") || "all");
    const [query, setQuery] = useState(() => searchParams.get("q") || "");
    const [showExif, setShowExif] = useState<boolean>(() => {
        if (typeof window === "undefined") return true;
        const stored = typeof localStorage !== "undefined" ? localStorage.getItem("jaygraphy-show-exif") : null;
        return stored ? stored === "1" : true;
    });
    const [page, setPage] = useState(1);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    const gridTopRef = useRef<HTMLDivElement | null>(null);

    const PAGE_SIZE = 12;

    // Derive unique categories from photos
    const categories = useMemo(() => {
        const cats = new Set(initialPhotos.map((p) => p.category.toString().toLowerCase()));
        return ["all", ...Array.from(cats)];
    }, [initialPhotos]);

    const filteredPhotos = useMemo(() => {
        let result = [...initialPhotos];

        if (filter !== "all") {
            result = result.filter((p) => p.category.toString().toLowerCase() === filter);
        }

        if (seriesFilter !== "all") {
            const key = seriesFilter.toLowerCase();
            result = result.filter((p) => p.location.toLowerCase().includes(key));
        }

        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter((p) => {
                return (
                    p.title.toLowerCase().includes(q)
                );
            });
        }

        return result;
    }, [initialPhotos, filter, query, seriesFilter]);

    // Reset page when filters change
    useEffect(() => {
        const newTotalPages = Math.ceil(filteredPhotos.length / PAGE_SIZE);
        if (page > newTotalPages && newTotalPages > 0) {
            setPage(1);
        }
    }, [filteredPhotos.length, page, PAGE_SIZE]);

    // Persist EXIF toggle
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("jaygraphy-show-exif", showExif ? "1" : "0");
        }
    }, [showExif]);

    // Sync URL with current filters
    useEffect(() => {
        const params = new URLSearchParams();
        if (filter !== "all") params.set("category", filter);
        if (seriesFilter !== "all") params.set("series", seriesFilter);
        if (query.trim()) params.set("q", query.trim());
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [filter, seriesFilter, query, pathname, router]);

    // Scroll to top of grid when page changes
    useEffect(() => {
        if (gridTopRef.current) {
            const top = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top, behavior: "smooth" });
        }
    }, [page]);

    const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    const paginatedPhotos = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredPhotos.slice(start, start + PAGE_SIZE);
    }, [filteredPhotos, currentPage]);

    const selectedPhoto = useMemo(
        () => initialPhotos.find((p) => p.id === selectedPhotoId),
        [initialPhotos, selectedPhotoId]
    );

    const getMapsUrl = (photo: Photo) => {
        if (photo.exif?.gps) {
            return buildGoogleMapsUrlFromGps(photo.exif.gps.latitude, photo.exif.gps.longitude);
        }
        return buildGoogleMapsUrlFromLocation(photo.location);
    };

    const handleNext = () => {
        if (!selectedPhotoId) return;
        const idx = filteredPhotos.findIndex(p => p.id === selectedPhotoId);
        if (idx < filteredPhotos.length - 1) setSelectedPhotoId(filteredPhotos[idx + 1].id);
    };

    const handlePrev = () => {
        if (!selectedPhotoId) return;
        const idx = filteredPhotos.findIndex(p => p.id === selectedPhotoId);
        if (idx > 0) setSelectedPhotoId(filteredPhotos[idx - 1].id);
    };

    return (
        <div className="space-y-8" ref={gridTopRef}>
            {/* Filters & Search */}
            <div className="space-y-4 pb-4 border-b border-white/5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 mr-4 text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filter</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setFilter(cat);
                                setPage(1);
                            }}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                filter === cat
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                            )}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by title..."
                            className="w-full pl-9 pr-3 py-2 rounded-full bg-white/5 border border-white/10 text-sm outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground mr-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            <span className="font-medium">Series</span>
                        </div>
                        {["all", "niagara", "bruce", "montreal", "toronto", "goa", "kerala", "bhuj", "quebec", "etobicoke"].map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setSeriesFilter(s);
                                    setPage(1);
                                }}
                                className={cn(
                                    "px-3 py-1 rounded-full border text-[11px] uppercase tracking-wide",
                                    seriesFilter === s
                                        ? "bg-blue-600 border-blue-500 text-white"
                                        : "bg-transparent border-white/10 text-muted-foreground hover:border-blue-500/50 hover:text-white"
                                )}
                            >
                                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}

                        <button
                            onClick={() => setShowExif((v) => !v)}
                            className={cn(
                                "ml-2 px-3 py-1 rounded-full border text-[11px] uppercase tracking-wide",
                                showExif ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-white/10 text-muted-foreground hover:border-blue-500/50 hover:text-white"
                            )}
                        >
                            EXIF {showExif ? "On" : "Off"}
                        </button>

                        <button
                            onClick={async () => {
                                const url = typeof window !== "undefined" ? window.location.href : "";
                                if (url) await navigator.clipboard.writeText(url);
                            }}
                            className="px-3 py-1 rounded-full border text-[11px] uppercase tracking-wide bg-white/5 hover:bg-white/10 text-muted-foreground"
                        >
                            Copy filtered view
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredPhotos.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No photos found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {paginatedPhotos.map((photo) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                layoutId={`photo-${photo.id}`}
                                onClick={() => setSelectedPhotoId(photo.id)}
                                className="cursor-pointer group"
                            >
                                <GlassCard hoverEffect className="p-0 overflow-hidden h-full bg-muted/20 border-white/5">
                                    <div className="aspect-[3/4] relative overflow-hidden">
                                        <div className="absolute inset-0 skeleton" />
                                        <img
                                            src={photo.src}
                                            alt={photo.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 relative z-10"
                                            onLoad={(e) => (e.currentTarget.previousElementSibling as HTMLElement | null)?.classList.add("opacity-0")}
                                        />
                                        <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FavoriteButton photoId={photo.id} size={16} />
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <span className="px-4 py-2 rounded-full border border-white/30 bg-black/30 backdrop-blur-md text-white text-sm font-medium">View Details</span>
                                        </div>

                                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] uppercase font-bold tracking-widest text-white/80 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                            {photo.category}
                                        </div>

                                        {showExif && (
                                            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {photo.exif.model && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-[10px] text-white/80">
                                                        <Camera className="w-3 h-3" />
                                                        {photo.exif.model}
                                                    </span>
                                                )}
                                                {photo.exif.aperture && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-[10px] text-white/80">
                                                        <Aperture className="w-3 h-3" />
                                                        {photo.exif.aperture}
                                                    </span>
                                                )}
                                                {photo.exif.iso && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-[10px] text-white/80">
                                                        <Zap className="w-3 h-3" />
                                                        ISO {photo.exif.iso}
                                                    </span>
                                                )}
                                                {photo.exif.focalLength && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-[10px] text-white/80">
                                                        <GaugeCircle className="w-3 h-3" />
                                                        {photo.exif.focalLength}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-1">
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">
                                            {photo.title}
                                        </h3>
                                        {photo.location && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                <a
                                                    href={getMapsUrl(photo)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="truncate hover:text-blue-400 hover:underline underline-offset-2"
                                                >
                                                    {photo.location}
                                                </a>
                                            </div>
                                        )}
                                        {photo.tags && photo.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {photo.tags.slice(0, 4).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase tracking-wide text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {photo.tags.length > 4 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        +{photo.tags.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {filteredPhotos.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm text-muted-foreground flex-col gap-3 md:flex-row">
                    <div>
                        Showing{" "}
                        <span className="font-semibold text-white">
                            {(currentPage - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        –{" "}
                        <span className="font-semibold text-white">
                            {Math.min(currentPage * PAGE_SIZE, filteredPhotos.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-white">{filteredPhotos.length}</span>{" "}
                        photos
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/60 hover:text-white transition-colors shimmer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span className="text-xs">
                            Page{" "}
                            <span className="font-semibold text-white">{currentPage}</span> of{" "}
                            <span className="font-semibold text-white">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/60 hover:text-white transition-colors shimmer"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedPhoto && (
                    <PhotoLightbox
                        photo={selectedPhoto}
                        onClose={() => setSelectedPhotoId(null)}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
