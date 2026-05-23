import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: false,
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
