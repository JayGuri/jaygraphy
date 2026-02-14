"use client";

import { Photo } from "@/types/photo";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { PhotoLightbox } from "@/components/portfolio/photo-lightbox";
import { Filter, SlidersHorizontal, Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildGoogleMapsUrlFromGps, buildGoogleMapsUrlFromLocation } from "@/lib/location";
import { Masonry } from "@/components/ui/masonry";
import { getSeriesLabel, getSeriesOptions } from "@/lib/series";

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
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(searchParams.get("photo"));
    const gridTopRef = useRef<HTMLDivElement | null>(null);

    const PAGE_SIZE = 12;

    // Derive unique categories from photos
    const categories = useMemo(() => {
        const cats = new Set(initialPhotos.map((p) => p.category.toString().toLowerCase()));
        return ["all", ...Array.from(cats)];
    }, [initialPhotos]);

    const seriesOptions = useMemo(() => getSeriesOptions(initialPhotos), [initialPhotos]);

    const filteredPhotos = useMemo(() => {
        let result = [...initialPhotos];

        if (filter !== "all") {
            result = result.filter((p) => p.category.toString().toLowerCase() === filter);
        }

        if (seriesFilter !== "all") {
            const key = seriesFilter.toLowerCase();
            result = result.filter((p) => (p.series || "").toString().toLowerCase() === key);
        }

        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter((p) => {
                return (
                    (p.displayTitle || p.title).toLowerCase().includes(q)
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
        if (selectedPhotoId) params.set("photo", selectedPhotoId);
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, [filter, seriesFilter, query, pathname, router, selectedPhotoId]);

    // Sync selected photo with URL (for links from map or shared URLs)
    useEffect(() => {
        const photoId = searchParams.get("photo");
        if (photoId && initialPhotos.some((p) => p.id === photoId)) {
            setSelectedPhotoId(photoId);
        } else {
            setSelectedPhotoId((prev) => (prev ? null : prev));
        }
    }, [searchParams, initialPhotos]);

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

    const masonryItems = useMemo(
        () =>
            paginatedPhotos.map((photo, idx) => {
                const computedHeight =
                    photo.height && photo.width
                        ? Math.max(420, (photo.height / Math.max(photo.width, 1)) * 560)
                        : 420 + (idx % 6) * 42;

                const meta: Record<string, string> = {
                    [photo.series ? "Series" : "Location"]: photo.series ? getSeriesLabel(photo.series) : photo.location,
                };

                if (showExif) {
                    if (photo.exif.aperture) meta["Aperture"] = photo.exif.aperture;
                    if (photo.exif.iso) meta["ISO"] = photo.exif.iso;
                    if (photo.exif.exposureTime) meta["Shutter"] = photo.exif.exposureTime;
                }

                return {
                    id: photo.id,
                    img: photo.cdnSrc || photo.src,
                    height: computedHeight,
                    url: "#",
                    meta,
                };
            }),
        [paginatedPhotos, showExif]
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-wide text-muted-foreground mr-2">
                            <Sparkles className="w-3 h-3 text-primary" />
                            CDN masonry view
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mr-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            <span className="font-medium">Series</span>
                        </div>
                        {seriesOptions.map((s) => (
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
                                {s === "all" ? "All" : getSeriesLabel(s)}
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
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                    <Masonry
                        items={masonryItems}
                        animateFrom="bottom"
                        stagger={0.06}
                        blurToFocus
                        scaleOnHover
                        hoverScale={0.97}
                        colorShiftOnHover
                        onSelect={(item) => setSelectedPhotoId(item.id)}
                    />
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
                        onPhotoUpdated={() => router.refresh()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
