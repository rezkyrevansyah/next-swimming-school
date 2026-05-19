import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    // Set the workspace root to this project to avoid lockfile conflicts
    // when this project is nested inside a parent directory.
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
