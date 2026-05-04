import path from 'node:path'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'battletoads.ams3.digitaloceanspaces.com',
        protocol: 'https'
      },
      {
        hostname: 'battletoads.ams3.cdn.digitaloceanspaces.com',
        protocol: 'https'
      }
    ]
  },
  output: 'standalone',
  transpilePackages: ['@btshop/shared'],
  turbopack: {
    root: path.join(__dirname, '../..')
  }
}

export default nextConfig
