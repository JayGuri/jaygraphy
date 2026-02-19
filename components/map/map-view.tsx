"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import type { Photo } from "@/types/photo";
import { MapPin } from "lucide-react";
import { getSeriesLabel, getSeriesOptions } from "@/lib/series";

interface MapViewProps { photos: Photo[]; }

const SERIES_COLORS: Record<string, string> = {
  niagara: "#3b82f6", bruce: "#0ea5e9", montreal: "#a855f7",
  toronto: "#22c55e", goa: "#f97316", kerala: "#16a34a",
  bhuj: "#eab308", quebec: "#8b5cf6", etobicoke: "#06b6d4",
};

export function MapView({ photos }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [seriesFilter, setSeriesFilter] = useState("all");
  const seriesOptions = useMemo(() => getSeriesOptions(photos), [photos]);

  const geoPhotos = useMemo(() => {
    const base = photos.filter((p) => p.coordinates?.lat && p.coordinates?.lng);
    return seriesFilter === "all"
      ? base
      : base.filter((p) => (p.series || "").toLowerCase() === seriesFilter);
  }, [photos, seriesFilter]);

  /* ── Initialise globe.gl once (dynamic import avoids SSR) ── */
  useEffect(() => {
    if (!containerRef.current) return;
    let alive = true;
    import("globe.gl").then(({ default: Globe }) => {
      if (!alive || !containerRef.current) return;
      const el = containerRef.current;
      const globe = Globe()(el)
        .width(el.clientWidth)
        .height(el.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .atmosphereColor("#1d4ed8")
        .atmosphereAltitude(0.18)
        .pointsData(geoPhotos)
        .pointLat((d: any) => d.coordinates.lat)
        .pointLng((d: any) => d.coordinates.lng)
        .pointColor((d: any) => SERIES_COLORS[(d.series || "").toLowerCase()] || "#3b82f6")
        .pointAltitude(0.02)
        .pointRadius(0.45)
        .pointResolution(8)
        .onPointClick((point: any) => {
          globe.controls().autoRotate = false;
          setSelectedPhoto(point as Photo);
        })
        .onPointHover((point: any) => {
          el.style.cursor = point ? "pointer" : "default";
        });
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
      globe.controls().enableDamping = true;
      globe.controls().dampingFactor = 0.1;
      globe.pointOfView({ lat: 20, lng: 80, altitude: 2.2 }, 0);
      globeRef.current = globe;
      setGlobeReady(true);
      const ro = new ResizeObserver(() => {
        if (containerRef.current) {
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        }
      });
      ro.observe(el);
    });
    return () => { alive = false; globeRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Re-sync pins whenever the filter changes ── */
  useEffect(() => {
    if (!globeRef.current || !globeReady) return;
    globeRef.current
      .pointsData(geoPhotos)
      .pointLat((d: any) => d.coordinates.lat)
      .pointLng((d: any) => d.coordinates.lng)
      .pointColor((d: any) => SERIES_COLORS[(d.series || "").toLowerCase()] || "#3b82f6");
  }, [geoPhotos, globeReady]);

  const handleClosePreview = () => {
    setSelectedPhoto(null);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
  };

  return (
    <div className="space-y-4 relative">
      {/* Series filter bar */}
      <div className="flex flex-wrap gap-2 items-center z-10 relative">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Filter by series
        </span>
        {seriesOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setSeriesFilter(opt)}
            className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wide transition ${
              seriesFilter === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/60"
            }`}
          >
            {opt === "all" ? "All" : getSeriesLabel(opt)}
          </button>
        ))}
      </div>

      {/* Globe */}
      <div className="w-full h-[88vh] rounded-3xl overflow-hidden border border-white/10 bg-[#060d1f] relative shadow-2xl">
        {!globeReady && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              <p className="text-sm">Loading 3D Globe…</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ opacity: globeReady ? 1 : 0, transition: "opacity 0.6s ease" }}
        />

        {/* Photo preview card */}
        {selectedPhoto && (
          <div className="absolute bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-48">
                <img
                  src={selectedPhoto.cdnSrc || selectedPhoto.src}
                  alt={selectedPhoto.displayTitle || selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleClosePreview}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors"
                >×</button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-10">
                  <div className="text-white font-bold text-base leading-tight">
                    {selectedPhoto.displayTitle || selectedPhoto.title}
                  </div>
                  <div className="text-white/60 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selectedPhoto.location}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <a
                  href={`/portfolio?photo=${selectedPhoto.id}`}
                  target="_blank"
                  className="block w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-center text-sm font-semibold transition-colors"
                >View in Portfolio →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
