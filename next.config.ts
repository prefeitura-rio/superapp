import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Pacotes gRPC/OTel usam require() dinâmico — excluí-los do bundle do webpack elimina os warnings de "Critical dependency"
  // ref: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages
  serverExternalPackages: [
    '@opentelemetry/exporter-trace-otlp-grpc',
    '@opentelemetry/sdk-node',
    '@opentelemetry/instrumentation',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    'protobufjs',
    'require-in-the-middle',
  ],
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
