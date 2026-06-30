import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    unoptimized: true,
    deviceSizes: [390, 640, 768, 1024, 1280, 1920],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3002',
        pathname: '/uploads/**',
      },
      {
        // LAN IP — allows image loading when accessed from phones / other browsers on the network
        protocol: 'http',
        hostname: '192.168.100.61',
        port: '3002',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Production domains
      {
        protocol: 'https',
        hostname: '**.moltrottinettes.ma',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.moldroguerie.ma',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
