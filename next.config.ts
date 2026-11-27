import type { NextConfig } from 'next'
import { isIndexingAllowed } from './src/lib/indexing'

const oportunidadesCariocasLegacyPaths = [
  '/oportunidadescariocas',
  '/oportunidades-cariocas',
  '/oportunidades.cariocas',
]

export const allowedImageBuckets = [
  'rj-escritorio-dev-public',
  'rj-superapp-prefrio',
  'rj-superapp-staging-prefrio',
  'portal-do-cidadao',
] as const

/**
 * Assets estáticos servidos sem hash no nome (`public/` e arquivos de metadata
 * como `favicon.ico`) saem do Next com `max-age=0`. Com o Cloud CDN em
 * `USE_ORIGIN_HEADERS`, isso faz o CDN revalidar cada pedido na origem, e cada
 * revalidação passa pelo Cloud Armor e conta no rate limit de 300 req/min por
 * IP (regra 5000 da `istio-security-policy-web`). Navegadores internos do
 * Instagram e do WhatsApp pedem os ícones em loop e esgotam o limite do
 * usuário, que passa a receber 429 também nas páginas e APIs (PREF-718).
 *
 * Todo asset estático novo precisa cair em uma destas regras. Servido do cache
 * do CDN, o pedido não chega ao Cloud Armor.
 *
 * `/_next/static/*` já recebe `immutable` do Next e não pode ser sobrescrito,
 * então fica de fora.
 */
export const staticAssetCacheControl = 'public, max-age=86400'

export const staticAssetExtensions = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp',
  'avif',
  'ico',
  'ttf',
  'otf',
  'woff',
  'woff2',
  'mjs',
] as const

const staticAssetCacheHeaders = [
  { key: 'Cache-Control', value: staticAssetCacheControl },
]

export const staticAssetHeaders = [
  { source: '/favicon.ico', headers: staticAssetCacheHeaders },
  { source: '/manifest.json', headers: staticAssetCacheHeaders },
  { source: '/icons/:path*', headers: staticAssetCacheHeaders },
  {
    source: `/:path((?!_next/|api/).+\\.(?:${staticAssetExtensions.join('|')}))`,
    headers: staticAssetCacheHeaders,
  },
]

/**
 * Fora de produção (`pref.rio`) nada deve ser indexado. O header cobre HTML,
 * APIs, PDFs e imagens; o middleware não serve para isso porque o matcher dele
 * ignora assets. Ver `src/lib/indexing.ts`.
 */
const indexingAllowed = isIndexingAllowed()

export const noIndexHeaders = [
  {
    source: '/:path*',
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  // allowedDevOrigins: ['*.ngrok-free.app', '*.share.zrok.io'],
  transpilePackages: ['react-pdf', 'pdfjs-dist'],
  // jsdom backs HTML sanitization during server render. Bundling it pulls
  // optional native deps and breaks the client build.
  // @react-pdf/renderer gera o PDF da Carta de Serviços no Route Handler; fica fora
  // do bundle para carregar yoga/fontkit como módulos Node normais.
  serverExternalPackages: ['jsdom', '@react-pdf/renderer'],
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
  async headers() {
    return indexingAllowed
      ? staticAssetHeaders
      : [...staticAssetHeaders, ...noIndexHeaders]
  },
  images: {
    /**
     * Somente os buckets GCS que servem imagens do app passam pelo otimizador
     * `/_next/image`; qualquer outra origem recebe 400 do próprio Next.js.
     * Manter em sincronia com a allowlist da regra 2310 do Cloud Armor em
     * `prefeitura-rio/infra` (`superapp/modules/gcp/security-policies.tf`).
     */
    remotePatterns: allowedImageBuckets.map(bucket => ({
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      port: '',
      pathname: `/${bucket}/**`,
    })),
  },
}

export default nextConfig
