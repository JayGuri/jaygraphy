import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wsrv.nl" },
      { protocol: "https", hostname: "*.wsrv.nl" }, // if you still use wsrv
      { protocol: "https", hostname: "lvozuswygskgyeixiubu.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
