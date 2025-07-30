/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@codearena/ui'],
  images: {
    domains: ['images.pexels.com', 'avatars.githubusercontent.com'],
  },
  env: {
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'ws://localhost:3001',
  },
}

module.exports = nextConfig