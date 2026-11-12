import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern'
import { describe, expect, it } from 'vitest'
import nextConfig, { allowedImageBuckets } from '../../next.config'

const remotePatterns = nextConfig.images?.remotePatterns ?? []

const isAllowed = (url: string) =>
  hasRemoteMatch([], remotePatterns, new URL(url))

describe('next.config images.remotePatterns', () => {
  it('lists exactly the GCS buckets allowed by Cloud Armor rule 2310', () => {
    expect([...allowedImageBuckets]).toEqual([
      'rj-escritorio-dev-public',
      'rj-superapp-prefrio',
      'rj-superapp-staging-prefrio',
      'portal-do-cidadao',
    ])
    expect(remotePatterns).toEqual(
      allowedImageBuckets.map(bucket => ({
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: `/${bucket}/**`,
      }))
    )
  })

  it('does not use hostname wildcards', () => {
    for (const pattern of remotePatterns) {
      if (pattern instanceof URL)
        throw new Error('URL patterns are not expected')
      expect(pattern.hostname).not.toContain('*')
    }
  })

  it.each([
    'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/icons/cursos.png',
    'https://storage.googleapis.com/rj-superapp-prefrio/courses/cover.jpg',
    'https://storage.googleapis.com/rj-superapp-staging-prefrio/empresas/logo.webp',
    'https://storage.googleapis.com/portal-do-cidadao/banner.png',
  ])('allows %s', url => {
    expect(isAllowed(url)).toBe(true)
  })

  it.each([
    'http://169.254.169.254/computeMetadata/v1/',
    'https://169.254.169.254/computeMetadata/v1/',
    'http://metadata.google.internal/computeMetadata/v1/',
    'https://example.com/image.png',
    'http://storage.googleapis.com/rj-superapp-prefrio/a.png',
    'https://storage.googleapis.com/outro-bucket/a.png',
    'https://storage.googleapis.com/rj-superapp-prefrio-evil/a.png',
    'https://storage.googleapis.com.evil.com/rj-superapp-prefrio/a.png',
    'https://evil.storage.googleapis.com/rj-superapp-prefrio/a.png',
    'https://storage.googleapis.com:8443/rj-superapp-prefrio/a.png',
  ])('rejects %s', url => {
    expect(isAllowed(url)).toBe(false)
  })
})
