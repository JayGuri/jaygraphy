'use client';

import NextNProgress from 'nextjs-progressbar';

export function NavigationProgress() {
  return (
    <NextNProgress
      color="#3B82F6"
      startPosition={0.3}
      stopDelayMs={200}
      height={3}
      showOnShallow={false}
      options={{ easing: 'ease', speed: 300, showSpinner: false }}
    />
  );
}
