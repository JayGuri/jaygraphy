"use client";

import React, { useState, useEffect, useMemo } from "react";

type Circle = {
  id: "iso" | "aperture" | "shutter";
  label: string;
  value: string;
  color: string;
  lightColor: string;
};

interface ExposureTriangleLoaderProps {
  durationMs?: number;
  onComplete?: () => void;
}

/**
 * ExposureTriangleLoader
 * Three circles (ISO / Aperture / Shutter) orbit, collapse, and merge into a clean aperture mark.
 * Auto-dismisses after durationMs; pass onComplete to hook into the end of the animation.
 */
export function ExposureTriangleLoader({ durationMs = 3600, onComplete }: ExposureTriangleLoaderProps) {
  const [phase, setPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const circles: Circle[] = useMemo(
    () => [
      { id: "iso", label: "ISO", value: "400", color: "#60a5fa", lightColor: "#93c5fd" },
      { id: "aperture", label: "f/", value: "2.8", color: "#22d3ee", lightColor: "#67e8f9" },
      { id: "shutter", label: "1/", value: "125", color: "#a78bfa", lightColor: "#c4b5fd" },
    ],
    []
  );

  useEffect(() => {
    const timings = durationMs * 0.4; // first phase portion
    const timers = [
      setTimeout(() => setPhase(1), timings * 0.6),
      setTimeout(() => setPhase(2), timings * 1.2),
      setTimeout(() => setPhase(3), timings * 1.5),
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, durationMs),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, [durationMs, onComplete]);

  const getCirclePosition = (index: number) => {
    if (phase === 0 || phase === 1) {
      const angle = (index * 120 - 90) * (Math.PI / 180);
      const radius = phase === 0 ? 85 : 50;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: phase === 0 ? 1 : 0.85, opacity: 1 };
    } else if (phase === 2) {
      return { x: 0, y: 0, scale: 0.4, opacity: 0.6 };
    }
    return { x: 0, y: 0, scale: 1, opacity: 0 };
  };

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(94, 109, 128, 0.08) 0%, transparent 60%)",
          opacity: phase >= 2 ? 0.9 : 0.5,
          transition: "opacity 1.2s ease-in-out",
        }}
      />

      <div className="relative">
        <svg width="450" height="450" viewBox="-225 -225 450 450" className="relative z-10">
          <defs>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="subtleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {phase < 2 &&
            circles.map((_, i) => {
              const start = getCirclePosition(i);
              const end = getCirclePosition((i + 1) % 3);
              return (
                <line
                  key={`line-${i}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(148, 163, 184, 0.18)"
                  strokeWidth="1.4"
                  style={{ transition: "all 1s ease-in-out", opacity: phase === 0 ? 0.35 : 0.18 }}
                />
              );
            })}

        <g
          style={{
            transform: `rotate(${phase === 0 ? 0 : 180}deg)`,
            transition: "transform 2s ease-in-out",
            transformOrigin: "center",
          }}
        >
          {circles.map((circle, index) => {
            const pos = getCirclePosition(index);
            return (
              <g
                key={circle.id}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
                  transition: "all 1s ease-in-out",
                  opacity: pos.opacity,
                }}
              >
                <circle r="38" fill="none" stroke={circle.lightColor} strokeWidth="1" opacity="0.18" />
                <circle
                  r="32"
                  fill="rgba(100, 116, 139, 0.12)"
                  stroke={circle.color}
                  strokeWidth="1.5"
                  opacity="0.95"
                  style={{ filter: "url(#softGlow)" }}
                />
                <text y="-4" textAnchor="middle" fill={circle.lightColor} fontSize="10" fontWeight="500" fontFamily="Inter, system-ui" opacity="0.9">
                  {circle.label}
                </text>
                <text
                  y="9"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, SFMono-Regular, Consolas, monospace"
                  opacity="0.95"
                >
                  {circle.value}
                </text>
              </g>
            );
          })}
        </g>

          {phase >= 2 && (
            <g
              style={{
                opacity: phase === 3 ? 1 : 0,
                transform: `scale(${phase === 3 ? 1 : 0.35})`,
                transition: "all 1s ease-out",
                transformOrigin: "center",
              }}
            >
              <circle r="55" fill="none" stroke="url(#subtleGradient)" strokeWidth="2" opacity="0.5" />
              <circle r="48" fill="rgba(148, 163, 184, 0.08)" opacity="0.9" />

              {[...Array(6)].map((_, i) => {
                const angle = i * 60 * (Math.PI / 180);
                const x1 = Math.cos(angle) * 18;
                const y1 = Math.sin(angle) * 18;
                const x2 = Math.cos(angle) * 40;
                const y2 = Math.sin(angle) * 40;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(148, 163, 184, 0.6)"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                );
              })}

              <circle r="12" fill="rgba(148, 163, 184, 0.75)" opacity="0.9" style={{ filter: "url(#softGlow)" }} />
            </g>
          )}
        </svg>

        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <p
            className="text-slate-500 text-xs tracking-[0.25em] uppercase font-light transition-all duration-700"
            style={{ opacity: phase >= 3 ? 1 : 0.55 }}
          >
            Loading
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExposureTriangleLoader;
