"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/types/photo";

// Optional Cesium-based globe. Will only be used when NEXT_PUBLIC_CESIUM_ION_TOKEN is set.
export function CesiumMap({ photos }: { photos: Photo[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (!token) {
      // Guard: if no token, don't try to load Cesium
      console.warn(
        "[Cesium] NEXT_PUBLIC_CESIUM_ION_TOKEN not set; Cesium map disabled."
      );
      return;
    }

    let viewer: any;
    let destroyed = false;

    (async () => {
      const container = containerRef.current;
      if (!container) return;

      try {
        const Cesium = await import("cesium");
        // Set Ion token
        (Cesium as any).Ion.defaultAccessToken = token;

        // Basic viewer
        viewer = new (Cesium as any).Viewer(container, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          terrainProvider: (Cesium as any).createWorldTerrain(),
        });

        // Fly to a reasonable world view
        viewer.scene.camera.setView({
          destination: (Cesium as any).Cartesian3.fromDegrees(0, 20, 2.5e7),
        });

        const withCoords = photos.filter(
          (p) => p.coordinates && !Number.isNaN(p.coordinates.lat)
        );

        const pinBuilder = new (Cesium as any).PinBuilder();

        withCoords.forEach((photo) => {
          const { lat, lng } = photo.coordinates!;
          const position = (Cesium as any).Cartesian3.fromDegrees(lng, lat);

          const color = (Cesium as any).Color.fromCssColorString("#3B82F6");
          const pin = pinBuilder.fromColor(color, 32).toDataURL();

          viewer.entities.add({
            position,
            billboard: {
              image: pin,
              verticalOrigin: (Cesium as any).VerticalOrigin.BOTTOM,
              scale: 1.0,
            },
            properties: {
              id: photo.id,
              title: photo.displayTitle || photo.title,
              location: photo.location,
            },
          });
        });

        // Simple click handler: open portfolio for photo
        viewer.screenSpaceEventHandler.setInputAction(
          (movement: any) => {
            const picked = viewer.scene.pick(movement.position);
            if (
              picked &&
              picked.id &&
              picked.id.properties &&
              picked.id.properties.id
            ) {
              const id = picked.id.properties.id.getValue();
              const url = `/portfolio?photo=${id}`;
              window.open(url, "_blank");
            }
          },
          (await import("cesium")).ScreenSpaceEventType.LEFT_CLICK
        );
      } catch (err) {
        console.error("[Cesium] Failed to initialize Cesium map:", err);
      }
    })();

    return () => {
      destroyed = true;
      if (viewer && !viewer.isDestroyed?.()) {
        viewer.destroy();
      }
    };
  }, [photos]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[88vh] rounded-3xl overflow-hidden border border-white/10 bg-[#060d1f] relative shadow-2xl"
    />
  );
}

