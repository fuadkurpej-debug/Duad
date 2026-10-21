import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Product photography will come from the supplier/CDN later; add its host here.
    remotePatterns: [],
  },
};

export default nextConfig;
