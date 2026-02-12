import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media-*.api-sports.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.football-data.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
