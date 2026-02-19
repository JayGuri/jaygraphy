"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export interface MasonryItem {
  id: string;
  img: string;
  alt?: string;
  blurDataURL?: string;
  url?: string;
  height: number;
  meta?: Record<string, string>;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: string;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  onSelect?: (item: MasonryItem) => void;
}

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => {
    if (typeof window === "undefined") return defaultValue;
    const idx = queries.findIndex((q) => matchMedia(q).matches);
    return values[idx] ?? defaultValue;
  };
  const [value, setValue] = useState<number>(get);
  useEffect(() => {
    const handler = () => setValue(get);
    if (typeof window !== "undefined") {
      queries.forEach((q) => matchMedia(q).addEventListener("change", handler));
    }
    return () => {
      if (typeof window !== "undefined") {
        queries.forEach((q) => matchMedia(q).removeEventListener("change", handler));
      }
    };
  }, [queries]);
  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        if (!ref.current) return;
        const { width, height } = ref.current.getBoundingClientRect();
        setSize({ width, height });
      }, 150)
    );
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);
  return [ref, size] as const;
};

interface GridItem extends MasonryItem {
  x: number; y: number; w: number; h: number;
}
export const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.03,
  colorShiftOnHover = false,
  onSelect,
}) => {
  const columns = useMedia(
    ["(min-width:1500px)", "(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [5, 4, 3, 2], 1
  );
  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>();

  const columnCount = useMemo(() => {
    if (containerWidth < 640) return 1;
    if (containerWidth < 1024) return 2;
    if (containerWidth < 1280) return 3;
    return columns;
  }, [containerWidth, columns]);

  const REFERENCE_WIDTH = 500;

  const grid = useMemo<GridItem[]>(() => {
    if (!containerWidth) return [];
    const colHeights = new Array(columnCount).fill(0);
    const columnWidth = containerWidth / columnCount;
    return items.map((child) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = (columnWidth * child.height) / REFERENCE_WIDTH;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columnCount, items, containerWidth]);

  const gridHeight = useMemo(
    () => (grid.length ? Math.max(...grid.map((item) => item.y + item.h)) : 0),
    [grid]
  );

  // Track which item IDs are already positioned so we distinguish
  // new items (fade in) from existing items (smooth reposition on resize).
  const positionedIds = useRef<Set<string>>(new Set());

  useLayoutEffect(() => {
    if (!containerRef.current || !grid.length) return;
    const ctx = gsap.context(() => {
      grid.forEach((item, index) => {
        const selector = "[data-key=" + JSON.stringify(item.id) + "]";
        const posProps = { x: item.x, y: item.y, width: item.w, height: item.h };
        if (!positionedIds.current.has(item.id)) {
          gsap.set(selector, { ...posProps, opacity: 0 });
          gsap.to(selector, { opacity: 1, duration: 0.4, delay: index * stagger, ease: "power2.out" });
          positionedIds.current.add(item.id);
        } else {
          gsap.to(selector, { ...posProps, duration, ease, overwrite: "auto" });
        }
      });
      positionedIds.current = new Set(grid.map((i) => i.id));
    }, containerRef);
    return () => ctx.revert();
  }, [items, columnCount, containerWidth, duration, ease, stagger, grid]);
  return (
    <div ref={containerRef} className="masonry-list" style={{ height: Math.max(gridHeight + 16, 480) }}>
      {grid.map((item) => (
        <div
          key={item.id}
          data-key={item.id}
          className="masonry-item"
          onClick={() => (onSelect ? onSelect(item) : item.url && window.open(item.url, "_blank", "noopener"))}
        >
          <div className="masonry-img">
            {colorShiftOnHover && <div className="color-overlay" />}
            <Image
              src={item.img}
              alt={item.alt || ""}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain"
              loading="lazy"
              placeholder={item.blurDataURL ? "blur" : "empty"}
              blurDataURL={item.blurDataURL}
              quality={85}
            />
            {item.meta && (
              <div className="masonry-meta">
                {Object.entries(item.meta).map(([label, value]) => (
                  <span key={label}><strong>{label}:</strong> {value}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
