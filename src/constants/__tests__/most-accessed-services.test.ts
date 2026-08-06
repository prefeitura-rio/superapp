import { afterEach, describe, expect, test, vi } from 'vitest'

const CATALOGO =
  '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610'

/**
 * O destino do card é resolvido na carga do módulo, porque `NEXT_PUBLIC_*` é congelada no
 * build. Por isso cada caso precisa de `resetModules()` + import dinâmico: sem isso o
 * primeiro import venceria e o segundo caso testaria o valor do primeiro.
 */
async function cardDividaAtiva(flag: string | undefined) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', flag)

  const { MOST_ACCESSED_SERVICES } = await import('../most-accessed-services')

  return MOST_ACCESSED_SERVICES.find(service => service.id === 'divida-ativa')
}

describe('MOST_ACCESSED_SERVICES — card de Dívida Ativa', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  test('leva ao módulo do Pref.Rio quando a flag está ligada', async () => {
    const card = await cardDividaAtiva('true')

    expect(card?.href).toBe('/servicos/divida-ativa')
  })

  test('segue apontando para o catálogo quando a flag está desligada', async () => {
    const card = await cardDividaAtiva('false')

    expect(card?.href).toBe(CATALOGO)
  })

  test('segue apontando para o catálogo quando a flag está ausente', async () => {
    const card = await cardDividaAtiva(undefined)

    expect(card?.href).toBe(CATALOGO)
  })

  test('nenhum outro card muda de destino por causa da flag', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', 'true')
    const { MOST_ACCESSED_SERVICES: comFlag } = await import(
      '../most-accessed-services'
    )
    const outrosComFlag = comFlag
      .filter(service => service.id !== 'divida-ativa')
      .map(service => `${service.id}:${service.href}`)

    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', 'false')
    const { MOST_ACCESSED_SERVICES: semFlag } = await import(
      '../most-accessed-services'
    )
    const outrosSemFlag = semFlag
      .filter(service => service.id !== 'divida-ativa')
      .map(service => `${service.id}:${service.href}`)

    expect(outrosComFlag).toEqual(outrosSemFlag)
    expect(outrosComFlag.length).toBeGreaterThan(0)
  })
})
