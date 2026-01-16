"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "./use-favorites";

interface Props {
  photoId: string;
  size?: number;
  className?: string;
}

export function FavoriteButton({ photoId, size = 18, className = "" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(photoId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(photoId);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      className={`p-2 rounded-full bg-black/50 backdrop-blur text-white/80 hover:text-red-400 hover:bg-black/70 transition ${className}`}
    >
      <Heart
        className="transition"
        width={size}
        height={size}
        fill={fav ? "currentColor" : "none"}
        strokeWidth={fav ? 2 : 2}
      />
    </button>
  );
}

