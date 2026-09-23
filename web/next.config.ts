import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls to backend to avoid CORS in dev
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },

  // Allow images from common hospital image domains
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "medroute.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // Enable standalone build for minimal container images
  output: "standalone",

  // Enable compression
  compress: true,
};

export default nextConfig;
