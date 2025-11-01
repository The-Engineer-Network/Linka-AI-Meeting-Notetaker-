import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Web App Configuration
  images: {
    unoptimized: true,
  },

  // Webpack configuration for web app
  webpack: (config, { isServer }) => {
    // Handle client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Environment variables for web app
  env: {
    NEXT_PUBLIC_IS_WEB_APP: 'true',
  },
};

export default nextConfig;
