import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.fotmob.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
