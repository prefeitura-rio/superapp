import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { describe, expect, it } from 'vitest'
import nextConfig, {
  staticAssetCacheControl,
  staticAssetExtensions,
} from '../../next.config'
import { config as middlewareConfig } from '../middleware'

/**
 * Regressão do PREF-718: asset estático sem `Cache-Control` explícito sai com
 * `max-age=0`, o Cloud CDN revalida na origem e cada revalidação conta no rate
 * limit do Cloud Armor (regra 5000, 300 req/min por IP).
 */
const cacheControlFor = async (pathname: string) => {
  const rules = (await nextConfig.headers?.()) ?? []
  const values = rules
    .filter(rule => getPathMatch(rule.source)(pathname) !== false)
    .flatMap(rule => rule.headers)
    .filter(header => header.key === 'Cache-Control')
    .map(header => header.value)
  return values.at(-1)
}

const listFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listFiles(full) : [full]
  })

describe('next.config headers (cache de assets estáticos)', () => {
  it.each([
    '/favicon.ico',
    '/manifest.json',
    '/icons/apple-icon.png',
    '/icons/superapp_png_icone_PWA_64x64.png',
    '/welcome.png',
    '/banners/home/banner.webp',
    '/fonts/montserrat/Montserrat-Bold.ttf',
    '/pdf.worker.min.mjs',
    '/square-shadow.svg',
  ])('%s recebe cache longo', async pathname => {
    expect(await cacheControlFor(pathname)).toBe(staticAssetCacheControl)
  })

  it.each([
    '/',
    '/servicos/cursos',
    '/servicos/trabalho/123',
    '/api/user/cursos/inscricoes',
    '/api/qualquer/coisa.png',
    '/_next/static/media/logo.abc123.png',
    '/_next/image',
  ])('%s não é afetado', async pathname => {
    expect(await cacheControlFor(pathname)).toBeUndefined()
  })

  it('o cache dura pelo menos 1 hora', () => {
    const maxAge = Number(/max-age=(\d+)/.exec(staticAssetCacheControl)?.[1])
    expect(maxAge).toBeGreaterThanOrEqual(3600)
    expect(staticAssetCacheControl).toMatch(/^public,/)
  })

  it('todo arquivo de public/ com extensão de asset está coberto', async () => {
    const publicDir = join(process.cwd(), 'public')
    if (!existsSync(publicDir)) return
    const assets = listFiles(publicDir)
      .map(file => `/${file.slice(publicDir.length + 1).replaceAll('\\', '/')}`)
      .filter(pathname => {
        const ext = pathname.split('.').pop()?.toLowerCase()
        return staticAssetExtensions.some(known => known === ext)
      })
    expect(assets.length).toBeGreaterThan(0)
    for (const pathname of assets) {
      expect(await cacheControlFor(pathname), pathname).toBe(
        staticAssetCacheControl
      )
    }
  })

  it('o middleware não roda em assets estáticos (evita 307 de auth cacheado)', () => {
    const [matcher] = middlewareConfig.matcher as { source: string }[]
    const runsMiddleware = (pathname: string) =>
      getPathMatch(matcher.source)(pathname) !== false

    for (const ext of staticAssetExtensions) {
      expect(runsMiddleware(`/fonts/arquivo.${ext}`), ext).toBe(false)
    }
    expect(runsMiddleware('/manifest.json')).toBe(false)
    expect(runsMiddleware('/favicon.ico')).toBe(false)
    expect(runsMiddleware('/')).toBe(true)
    expect(runsMiddleware('/servicos/cursos')).toBe(true)
  })
})
