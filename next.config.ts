import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['fabric'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias['fabric'] = false;
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
