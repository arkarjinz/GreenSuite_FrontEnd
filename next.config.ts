import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|obj|mtl|fbx|dae)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
