"use client";

import { useState, useEffect } from "react";
import { ExposureTriangleLoader } from "./exposure-triangle-loader";

const LOADER_DURATION_MS = 2800;

export function SessionLoader() {
  const [show, setShow] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("jaygraphy-loaded");
    setHasChecked(true);
    if (hasLoaded) return;
    setShow(true);
    const t = setTimeout(() => {
      sessionStorage.setItem("jaygraphy-loaded", "1");
      setShow(false);
    }, LOADER_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (!hasChecked || !show) return null;
  return <ExposureTriangleLoader durationMs={LOADER_DURATION_MS} />;
}
