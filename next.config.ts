import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['fabric'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
