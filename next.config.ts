import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['zustand']
  },
  // 减少水合错误的严格性
  reactStrictMode: true,
};

export default nextConfig;
