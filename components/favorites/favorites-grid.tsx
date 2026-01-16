"use client";

import { useFavorites } from "./use-favorites";
import type { Photo } from "@/types/photo";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { FavoriteButton } from "./favorite-button";
import { MapPin } from "lucide-react";

interface Props {
  photos: Photo[];
}

export function FavoritesGrid({ photos }: Props) {
  const { favorites, clearFavorites } = useFavorites();
  const favPhotos = photos.filter((p) => favorites.includes(p.id));

  if (favPhotos.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
        <p className="text-muted-foreground text-sm mb-4">Heart photos in the portfolio or lightbox to build your shortlist.</p>
        <Link href="/portfolio" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
          Browse portfolio
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{favPhotos.length} photos</span>
        <button
          onClick={clearFavorites}
          className="text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground transition"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favPhotos.map((photo) => {
          const mapsUrl = photo.coordinates
            ? `https://www.google.com/maps/search/?api=1&query=${photo.coordinates.lat},${photo.coordinates.lng}`
            : undefined;
          return (
            <GlassCard key={photo.id} className="p-0 overflow-hidden bg-muted/20 border-border/70">
              <div className="relative aspect-[3/4]">
                <img src={photo.src} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <FavoriteButton photoId={photo.id} size={16} />
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-lg">{photo.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="uppercase tracking-wide text-[11px] text-primary">{photo.category}</span>
                  {mapsUrl && (
                    <>
                      <span>•</span>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <MapPin className="w-3 h-3" /> {photo.location}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

