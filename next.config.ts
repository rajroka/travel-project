import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile pictures (OAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // ImageKit CDN
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      // Unsplash (used in Hero component)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
