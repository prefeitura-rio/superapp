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
  experimental: {
    serverActions: {
      /**
       * Limite aumentado para suportar o upload de documentos do requerimento de
       * parcelamento de Dívida Ativa. Os documentos vão como base64 inline (P15 —
       * ver `docs/divida-ativa.md`), que infla ~33%.
       *
       * Pior caso estimado: 4 docs × 1,5 MB × 1,33 ≈ 8 MB. Deixamos em 10 MB para
       * folga. Revisar se outros fluxos do app passarem a usar server actions com upload.
       */
      bodySizeLimit: '10mb',
    },
  },
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
