import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Set the workspace root to this project to avoid lockfile conflicts
    // when this project is nested inside a parent directory.
    root: __dirname,
  },
};

export default nextConfig;
