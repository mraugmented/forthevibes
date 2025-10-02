import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Completely skip static optimization
  skipTrailingSlashRedirect: true,
  experimental: {
    // Prevent prerendering errors by skipping static optimization
    appDir: true,
  },
};

export default nextConfig;
