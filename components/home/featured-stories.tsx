"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Photo } from "@/types/photo";

const storiesOrder = ["niagara", "bruce", "toronto"];

interface Props {
  photos: Photo[];
}

export function FeaturedStories({ photos }: Props) {
  const stories = useMemo(() => {
    const bySeries: Record<string, Photo[]> = {};
    photos.forEach((p) => {
      if (!p.series) return;
      const key = p.series.toLowerCase();
      if (!bySeries[key]) bySeries[key] = [];
      bySeries[key].push(p);
    });
    return storiesOrder
      .map((s) => ({ series: s, items: (bySeries[s] || []).slice(0, 6) }))
      .filter((s) => s.items.length > 0);
  }, [photos]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!stories.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % stories.length);
    }, 4000);
    return () => clearInterval(id);
  }, [stories.length]);

  if (!stories.length) return null;

  const current = stories[index];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Featured Story</p>
            <h3 className="text-2xl font-bold capitalize text-foreground">{current.series.replace("-", " ")} Series</h3>
          </div>
          <div className="flex gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${i === index ? "bg-primary" : "bg-border"}`}
                aria-label={`Show story ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.series}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {current.items.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-xl border border-border bg-card/80">
                <img src={photo.src} alt={photo.title} className="w-full h-40 md:h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition p-3 flex flex-col justify-end">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">{photo.title}</h4>
                  <p className="text-[11px] text-white/80 uppercase tracking-wide">{photo.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <Link
          href={`/portfolio?series=${current.series}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
        >
          View full series →
        </Link>
      </div>
    </section>
  );
}

