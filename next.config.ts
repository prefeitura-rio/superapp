import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/rj-escritorio-dev-public/**',
      },
      {
        protocol: 'https',
        hostname: 'apps.rio.gov.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
