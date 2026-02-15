"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

type AnimateFrom = "bottom" | "top" | "left" | "right" | "center" | "random";

export interface MasonryItem {
  id: string;
  img: string;
  url?: string;
  height: number;
  meta?: Record<string, string>;
}

interface MasonryProps {
  items: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: AnimateFrom;
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

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = "power3.out",
  duration = 0.6,
  stagger = 0.05,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onSelect,
}) => {
  const columns = useMedia(
    ["(min-width:1500px)", "(min-width:1000px)", "(min-width:600px)", "(min-width:400px)"],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);

  const columnCount = useMemo(() => {
    if (containerWidth < 640) return 1;
    if (containerWidth < 1024) return 2;
    if (containerWidth < 1280) return 3;
    return columns;
  }, [containerWidth, columns]);

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };

    let direction: AnimateFrom = animateFrom;

    if (animateFrom === "random") {
      const directions: AnimateFrom[] = ["top", "bottom", "left", "right"];
      direction = directions[Math.floor(Math.random() * directions.length)];
    }

    switch (direction) {
      case "top":
        return { x: item.x, y: -200 };
      case "bottom":
        return { x: item.x, y: window.innerHeight + 200 };
      case "left":
        return { x: -200, y: item.y };
      case "right":
        return { x: window.innerWidth + 200, y: item.y };
      case "center":
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2,
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map((i) => i.img)).then(() => setImagesReady(true));
  }, [items]);

  // Reference width used when computing item height in the parent (portfolio-grid).
  // Tile height = columnWidth * (child.height / REFERENCE_WIDTH) so aspect ratio matches the image and nothing is cropped.
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

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !containerRef.current) return;

    const ctx = gsap.context(() => {
      grid.forEach((item, index) => {
        const selector = `[data-key="${item.id}"]`;
        const animationProps = {
          x: item.x,
          y: item.y,
          width: item.w,
          height: item.h,
        };

        if (!hasMounted.current) {
          const initialPos = getInitialPosition(item);
          const initialState = {
            opacity: 0,
            x: initialPos.x,
            y: initialPos.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: "blur(10px)" }),
          };

          gsap.fromTo(
            selector,
            initialState,
            {
              opacity: 1,
              ...animationProps,
              ...(blurToFocus && { filter: "blur(0px)" }),
              duration: 0.8,
              ease: "power3.out",
              delay: index * stagger,
            }
          );
        } else {
          gsap.to(selector, {
            ...animationProps,
            duration: duration,
            ease: ease,
            overwrite: "auto",
          });
        }
      });

      hasMounted.current = true;
    }, containerRef);

    return () => ctx.revert();
  }, [items, columnCount, containerWidth, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const handleMouseEnter = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: hoverScale,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = (item: GridItem) => {
    const selector = `[data-key="${item.id}"]`;

    if (scaleOnHover) {
      gsap.to(selector, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: Math.max(gridHeight + 16, 480) }}>
      {grid.map((item) => {
        return (
          <div
            key={item.id}
            data-key={item.id}
            className="masonry-item"
            onClick={() => (onSelect ? onSelect(item) : item.url && window.open(item.url, "_blank", "noopener"))}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={() => handleMouseLeave(item)}
          >
            <div className="masonry-img" style={{ backgroundImage: `url(${item.img})` }}>
              {colorShiftOnHover && (
                <div className="color-overlay" />
              )}
              {item.meta && (
                <div className="masonry-meta">
                  {Object.entries(item.meta).map(([label, value]) => (
                    <span key={label}>
                      <strong>{label}:</strong> {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Masonry;
