"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "@/types/photo";
import { MapPin } from "lucide-react";
import { getSeriesLabel, getSeriesOptions } from "@/lib/series";

interface MapViewProps {
  photos: Photo[];
}

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
  const [loadError, setLoadError] = useState(false);
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
    script.onerror = () => {
      console.error("Failed to load CesiumJS from CDN");
      setLoadError(true);
    };
    document.body.appendChild(script);
  }, []);
  return { ready, loadError };
}

export function MapView({ photos }: MapViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [seriesFilter, setSeriesFilter] = useState("all");
  const globeEl = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const { ready: cesiumLoaded, loadError: cesiumError } = useCesium();
  const seriesOptions = useMemo(() => getSeriesOptions(photos), [photos]);

  if (cesiumError) {
    throw new Error("Failed to load CesiumJS from CDN");
  }

  const geoPhotos = useMemo(() => {
    const filtered = photos.filter((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng);
    if (seriesFilter === "all") return filtered;
    return filtered.filter((p) => (p.series || "").toLowerCase() === seriesFilter);
  }, [photos, seriesFilter]);

  // Handle outside click to close preview
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // If clicking on the map canvas itself (which cesium handles), we might want to keep it open unless we click empty space.
      // But for now, let's rely on cesium click handler to clear selection if we click nothing.
      // Actually, easiest is: if we click outside the preview card and not on a pin, close?
      // Let's rely on the Cesium handler for map interactions.
    };
    // No-op for now
  }, []);

  useEffect(() => {
    if (!cesiumLoaded || !globeEl.current || viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    if (!Cesium) return;
    viewerRef.current = new Cesium.Viewer(globeEl.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      infoBox: false, // Disable default infoBox
      selectionIndicator: false, // Disable default selection indicator
      sceneModePicker: false,
      creditContainer: document.createElement("div"), // Hide credits
    });
    viewerRef.current.scene.globe.enableLighting = true;
    viewerRef.current.scene.globe.showGroundAtmosphere = true;
    viewerRef.current.scene.postProcessStages.fxaa.enabled = true;
    viewerRef.current.scene.highDynamicRange = true;

    // Click handler
    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current.scene.canvas);
    handler.setInputAction((movement: any) => {
      const pickedObject = viewerRef.current.scene.pick(movement.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        // It's an entity
        const entity = pickedObject.id;
        // Find the photo associated with this entity
        // We can store photo ID in entity id or properties
        const photoId = entity.id;
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
          setSelectedPhoto(photo);
        }
      } else {
        // Clicked empty space
        setSelectedPhoto(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  }, [cesiumLoaded, photos]);

  useEffect(() => {
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;
    if (!cesiumLoaded || !viewer || !Cesium) return;

    viewer.entities.removeAll();
    const pinBuilder = new Cesium.PinBuilder();
    const pinCache: Record<string, any> = {};
    const getPin = (series?: string) => {
      const key = (series || "default").toLowerCase();
      if (pinCache[key]) return pinCache[key];
      const colorStr = seriesColors[key] || "#2563eb";
      const color = Cesium.Color.fromCssColorString(colorStr);

      try {
        // Use a bullet point character which is safe and looks like a pin head
        pinCache[key] = pinBuilder.fromText("•", color, 48);
      } catch (e) {
        console.error("Error creating pin:", e);
        // Fallback
        pinCache[key] = pinBuilder.fromText("?", color, 48);
      }
      return pinCache[key];
    };

    const positions: any[] = [];
    geoPhotos.forEach((photo) => {
      const pos = Cesium.Cartesian3.fromDegrees(photo.coordinates!.lng, photo.coordinates!.lat);
      positions.push(pos);

      viewer.entities.add({
        id: photo.id, // Store ID to look up later
        position: pos,
        billboard: {
          image: getPin(photo.series),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          scale: 0.8, // Slightly smaller, sleeker
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always show on top of terrain? Maybe not.
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
    });

    if (positions.length) {
      // Logic to fly to bounds only on first load or significant change? 
      // We will keep it for now.
      const rectangle = (window as any).Cesium.Rectangle.fromCartographicArray(
        positions.map((p) => (window as any).Cesium.Cartographic.fromCartesian(p))
      );
      // Add some buffer
      viewer.camera.flyTo({ destination: rectangle, duration: 1.5 });
    }
  }, [geoPhotos, cesiumLoaded]);

  return (
    <div className="space-y-4 relative group">
      <div className="flex flex-wrap gap-2 items-center z-10 relative">
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-4 h-4" /> Filter by series
        </span>
        {seriesOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setSeriesFilter(opt)}
            className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wide transition ${seriesFilter === opt
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/60"
              }`}
          >
            {opt === "all" ? "All" : getSeriesLabel(opt)}
          </button>
        ))}
      </div>

      <div className="w-full h-[75vh] rounded-3xl overflow-hidden border border-white/10 bg-black/40 relative shadow-2xl">
        {!cesiumLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-[#0A0E17] rounded-xl absolute inset-0">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              <p className="text-sm">Loading 3D Globe...</p>
            </div>
          </div>
        )}
        <div ref={globeEl} className="w-full h-full" style={{ opacity: cesiumLoaded ? 1 : 0, transition: "opacity 0.5s ease" }} />

        {/* Custom Preview Card Overlay */}
        {selectedPhoto && (
          <div className="absolute bottom-6 left-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-0">
              <div className="relative h-48">
                <img
                  src={selectedPhoto.cdnSrc || selectedPhoto.src}
                  alt={selectedPhoto.displayTitle || selectedPhoto.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  &times;
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                  <div className="text-white font-bold text-lg leading-tight">{selectedPhoto.displayTitle || selectedPhoto.title}</div>
                  <div className="text-white/70 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selectedPhoto.location}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/5">
                <a
                  href={`/portfolio?photo=${selectedPhoto.id}`}
                  target="_blank"
                  className="block w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-center text-sm font-semibold transition-colors shadow-lg shadow-blue-900/20"
                >
                  View in Portfolio
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

