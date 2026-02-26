import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lvozuswygskgyeixiubu.supabase.co" },
    ],
    unoptimized: true, // ← key change: skip Next's optimizer
  },
};

export default nextConfig;