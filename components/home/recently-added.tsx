"use client";

import { Masonry, MasonryItem } from "@/components/ui/masonry";
import { Photo } from "@/types/photo";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

interface RecentlyAddedProps {
  photos: Photo[];
}

export function RecentlyAdded({ photos }: RecentlyAddedProps) {
  const router = useRouter();

  const items = useMemo<MasonryItem[]>(() => {
    return [...photos]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 16)
      .map((photo, idx) => {
        const approxHeight = photo.height && photo.width ? Math.max(320, (photo.height / Math.max(photo.width, 1)) * 420) : 380 + (idx % 5) * 28;
        return {
          id: photo.id,
          img: photo.cdnSrc || photo.src,
          url: `/portfolio?photo=${photo.id}`,
          height: approxHeight,
          meta: {
            [photo.series ? "Series" : "Location"]: photo.series || photo.location,
            Shot: new Date(photo.takenAt || photo.uploadedAt).toLocaleDateString(),
          },
        };
      });
  }, [photos]);

  if (!items.length) return null;

  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Recently Added</p>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">Fresh drops from the camera roll</h3>
            <p className="text-muted-foreground mt-1">CDN-backed, preloaded, and arranged in a flowing masonry grid.</p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shimmer"
          >
            View Portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-3 shadow-[0_30px_120px_rgba(0,0,0,0.35)] overflow-hidden">
          <Masonry
            items={items}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover
            hoverScale={0.97}
            blurToFocus
            colorShiftOnHover
            onSelect={(item) => router.push(item.url || "/portfolio")}
          />
        </div>
      </div>
    </section>
  );
}
