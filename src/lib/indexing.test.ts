import { afterEach, describe, expect, it, vi } from 'vitest'
import { isIndexingAllowed } from './indexing'

describe('isIndexingAllowed', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it.each(['https://pref.rio/', 'https://pref.rio', ' https://pref.rio/ '])(
    'permite indexar em produção (%s)',
    url => {
      expect(isIndexingAllowed(url)).toBe(true)
    }
  )

  it.each([
    'https://staging.app.dados.rio/',
    'http://localhost:3000',
    'https://pref.rio.evil.com/',
    'https://staging.pref.rio/',
    'https://evil.com/pref.rio',
    'pref.rio',
    'not a url',
    '',
    '   ',
    undefined,
  ])('bloqueia fora de produção (%s)', url => {
    expect(isIndexingAllowed(url)).toBe(false)
  })

  it('lê NEXT_PUBLIC_HOME_URL por padrão', () => {
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://pref.rio/')
    expect(isIndexingAllowed()).toBe(true)
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://staging.app.dados.rio/')
    expect(isIndexingAllowed()).toBe(false)
  })
})

describe('next.config X-Robots-Tag', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  const robotsHeaderFor = async (homeUrl: string) => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', homeUrl)
    const { default: config } = await import('../../next.config')
    const rules = (await config.headers?.()) ?? []
    return rules
      .flatMap(rule => rule.headers)
      .find(header => header.key === 'X-Robots-Tag')?.value
  }

  it('staging recebe noindex, nofollow', async () => {
    expect(await robotsHeaderFor('https://staging.app.dados.rio/')).toBe(
      'noindex, nofollow'
    )
  })

  it('produção não recebe o header', async () => {
    expect(await robotsHeaderFor('https://pref.rio/')).toBeUndefined()
  })
})
