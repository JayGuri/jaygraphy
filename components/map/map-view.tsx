"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/types/photo";
import { MapPin } from "lucide-react";

interface MapViewProps {
  photos: Photo[];
}

const seriesOptions = ["all", "niagara", "bruce", "montreal", "toronto", "goa", "kerala", "bhuj", "quebec", "etobicoke"];

const seriesColors: Record<string, string> = {
  niagara: "#2563eb",
  bruce: "#0ea5e9",
  montreal: "#a855f7",
  toronto: "#22c55e",
  goa: "#f97316",
  kerala: "#16a34a",
  bhuj: "#eab308",
  quebec: "#8b5cf6",
  etobicoke: "#06b6d4",
};

function useCesium() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Cesium) {
      setReady(true);
      return;
    }
    const version = "1.137.0";
    const baseUrl = `https://unpkg.com/cesium@${version}/Build/Cesium/`;
    (window as any).CESIUM_BASE_URL = baseUrl;
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${baseUrl}Widgets/widgets.css`;
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = `${baseUrl}Cesium.js`;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);
  return ready;
}

export function MapView({ photos }: MapViewProps) {
  const [seriesFilter, setSeriesFilter] = useState("all");
  const globeEl = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const ready = useCesium();

  const geoPhotos = useMemo(() => {
    const filtered = photos.filter((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng);
    if (seriesFilter === "all") return filtered;
    return filtered.filter((p) => (p.series || "").toLowerCase() === seriesFilter);
  }, [photos, seriesFilter]);

  useEffect(() => {
    if (!ready || !globeEl.current || viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;
    viewerRef.current = new Cesium.Viewer(globeEl.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      infoBox: true,
      sceneModePicker: false,
    });
    viewerRef.current.scene.globe.enableLighting = true;
    viewerRef.current.scene.globe.showGroundAtmosphere = true;
    viewerRef.current.scene.postProcessStages.fxaa.enabled = true;
    viewerRef.current.scene.highDynamicRange = true;
  }, [ready]);

  useEffect(() => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!ready || !viewer || !Cesium) return;

    viewer.entities.removeAll();
    const pinBuilder = new Cesium.PinBuilder();
    const pinCache: Record<string, any> = {};
    const getPin = (series?: string) => {
      const key = (series || "default").toLowerCase();
      if (pinCache[key]) return pinCache[key];
      const color = seriesColors[key] || "#2563eb";
      // Use a camera icon emoji as glyph for relevance; falls back to color pin if glyph fails
      pinCache[key] = pinBuilder.fromText("📷", Cesium.Color.fromCssColorString(color), 48);
      return pinCache[key];
    };

    const positions: any[] = [];
    geoPhotos.forEach((photo) => {
      const pos = Cesium.Cartesian3.fromDegrees(photo.coordinates!.lng, photo.coordinates!.lat);
      positions.push(pos);
      viewer.entities.add({
        position: pos,
        billboard: {
          image: getPin(photo.series),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 1.05,
        },
        description: `
          <div style="max-width:220px">
            <div style="font-weight:700;margin-bottom:4px;">${photo.title}</div>
            <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">${photo.location}</div>
            <img src="${photo.src}" alt="${photo.title}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:6px;" />
            <a href="/portfolio?photo=${photo.id}" style="color:#2563eb;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
              View in portfolio
            </a>
          </div>
        `,
      });
    });

    if (positions.length) {
      const rectangle = (window as any).Cesium.Rectangle.fromCartographicArray(
        positions.map((p) => (window as any).Cesium.Cartographic.fromCartesian(p))
      );
      viewer.camera.flyTo({ destination: rectangle, duration: 1.2 });
    }
  }, [geoPhotos, ready]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
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
            {opt === "all" ? "All" : opt}
          </button>
        ))}
      </div>

      <div className="w-full h-[70vh] rounded-2xl overflow-hidden border border-border bg-muted/30 relative">
        {!ready && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Loading globe…</div>}
        <div ref={globeEl} className="w-full h-full" />
      </div>
    </div>
  );
}

