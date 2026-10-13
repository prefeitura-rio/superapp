import type { NextConfig } from 'next'

const oportunidadesCariocasLegacyPaths = [
  '/oportunidadescariocas',
  '/oportunidades-cariocas',
  '/oportunidades.cariocas',
]

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  // jsdom backs HTML sanitization during server render. Bundling it pulls
  // optional native deps and breaks the client build.
  serverExternalPackages: ['jsdom'],
  async redirects() {
    return [
      {
        source: '/servicos/empregos',
        destination: '/servicos/trabalho',
        permanent: true,
      },
      {
        source: '/servicos/empregos/:path*',
        destination: '/servicos/trabalho/:path*',
        permanent: true,
      },
      ...oportunidadesCariocasLegacyPaths.flatMap(source => [
        {
          source,
          destination: '/servicos/trabalho',
          permanent: true,
        },
        {
          source: `${source}/:path*`,
          destination: '/servicos/trabalho/:path*',
          permanent: true,
        },
      ]),
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
