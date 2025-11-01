import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chrome Extension Configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // Webpack configuration for Chrome extension
  webpack: (config, { isServer }) => {
    // Handle Chrome extension APIs in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Add Chrome extension types
    config.externals = config.externals || [];
    config.externals.push({
      'chrome': 'chrome',
    });

    return config;
  },

  // Environment variables for Chrome extension
  env: {
    NEXT_PUBLIC_IS_CHROME_EXTENSION: 'true',
  },

  // Headers for Chrome extension
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Experimental features for Chrome extension compatibility
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
