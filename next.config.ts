import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['bcrypt', 'mongoose'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  // Removed /login redirect - authentication flow is handled by middleware
};

export default nextConfig;
