import { afterEach, describe, expect, test, vi } from 'vitest'

const BUSCA_SEARCH = {
  iptu: '/servicos/categoria/taxas/iptu-2025-94ff5567',
  cadrio:
    '/servicos/categoria/cidadania/inscricao-e-atualizacao-do-cadastro-unico-8cafda60',
  multas:
    '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa-1d76fc90',
  alvara:
    '/servicos/categoria/licencas/alvara-consulta-previa-de-local-a0cf6969',
  'licenca-sanitaria':
    '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento-ffa3f857',
  'divida-ativa':
    '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa-4a98e610',
} as const

const CATALOGO = {
  iptu: '/servicos/categoria/tributos/iptu-2026',
  cadrio: '/servicos/categoria/saude/cadrio-agendamento',
  multas: '/servicos/categoria/transporte/multa-de-transito-consulta-de-multa',
  alvara: '/servicos/categoria/licencas/alvara-consulta-previa-de-local',
  'licenca-sanitaria':
    '/servicos/categoria/licencas/licenca-sanitaria-de-funcionamento',
  'divida-ativa':
    '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa',
} as const

const OUTROS_IDS = [
  'iptu',
  'cadrio',
  'multas',
  'alvara',
  'licenca-sanitaria',
] as const

/**
 * O destino dos cards é resolvido na carga do módulo, porque as flags são lidas na
 * importação. Cada caso precisa de `resetModules()` + import dinâmico: sem isso o
 * primeiro import venceria e o segundo caso testaria o valor do primeiro.
 *
 * `CARTA_SERVICOS_API_ENABLED` entra em todo caso. O `.env` local pode deixá-la
 * ligada, e sem o stub esse valor vaza para o teste.
 */
async function loadServices(flags: {
  dividaAtiva: string | undefined
  carta: string | undefined
}) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', flags.dividaAtiva)
  vi.stubEnv('CARTA_SERVICOS_API_ENABLED', flags.carta)

  return import('../most-accessed-services')
}

function hrefsPorId(
  services: { id: string; href: string }[],
  ids: readonly string[]
) {
  return ids.map(id => {
    const service = services.find(item => item.id === id)
    return `${id}:${service?.href}`
  })
}

describe('MOST_ACCESSED_SERVICES — card de Dívida Ativa', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  test('leva ao módulo do Pref.Rio quando a flag do módulo está ligada, com a carta ligada ou desligada', async () => {
    const comCarta = await loadServices({ dividaAtiva: 'true', carta: 'true' })
    const semCarta = await loadServices({ dividaAtiva: 'true', carta: 'false' })

    const href = (services: { id: string; href: string }[]) =>
      services.find(service => service.id === 'divida-ativa')?.href

    expect(href(comCarta.MOST_ACCESSED_SERVICES)).toBe('/divida-ativa')
    expect(href(semCarta.MOST_ACCESSED_SERVICES)).toBe('/divida-ativa')
  })

  test('aponta para o slug da app-busca-search quando o módulo e a carta estão desligados', async () => {
    const { MOST_ACCESSED_SERVICES } = await loadServices({
      dividaAtiva: 'false',
      carta: 'false',
    })

    expect(
      MOST_ACCESSED_SERVICES.find(service => service.id === 'divida-ativa')
        ?.href
    ).toBe(BUSCA_SEARCH['divida-ativa'])
  })

  test('aponta para o slug da app-busca-search quando as duas flags estão ausentes', async () => {
    const { MOST_ACCESSED_SERVICES } = await loadServices({
      dividaAtiva: undefined,
      carta: undefined,
    })

    expect(
      MOST_ACCESSED_SERVICES.find(service => service.id === 'divida-ativa')
        ?.href
    ).toBe(BUSCA_SEARCH['divida-ativa'])
  })

  test('aponta para o slug da app-catalogo quando só a carta está ligada', async () => {
    const { MOST_ACCESSED_SERVICES } = await loadServices({
      dividaAtiva: 'false',
      carta: 'true',
    })

    expect(
      MOST_ACCESSED_SERVICES.find(service => service.id === 'divida-ativa')
        ?.href
    ).toBe(CATALOGO['divida-ativa'])
  })

  test('os outros cards não mudam com a flag do módulo', async () => {
    const comModulo = await loadServices({
      dividaAtiva: 'true',
      carta: 'false',
    })
    const semModulo = await loadServices({
      dividaAtiva: 'false',
      carta: 'false',
    })

    expect(hrefsPorId(comModulo.MOST_ACCESSED_SERVICES, OUTROS_IDS)).toEqual(
      hrefsPorId(semModulo.MOST_ACCESSED_SERVICES, OUTROS_IDS)
    )
  })

  test('os outros cards trocam de slug com a flag da carta', async () => {
    const semCarta = await loadServices({
      dividaAtiva: 'false',
      carta: 'false',
    })
    const comCarta = await loadServices({
      dividaAtiva: 'false',
      carta: 'true',
    })

    expect(hrefsPorId(semCarta.MOST_ACCESSED_SERVICES, OUTROS_IDS)).toEqual(
      OUTROS_IDS.map(id => `${id}:${BUSCA_SEARCH[id]}`)
    )
    expect(hrefsPorId(comCarta.MOST_ACCESSED_SERVICES, OUTROS_IDS)).toEqual(
      OUTROS_IDS.map(id => `${id}:${CATALOGO[id]}`)
    )
  })
})

describe('popularServiceHrefs', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  test('devolve o mapa pedido pelo argumento, sem ler a flag do ambiente', async () => {
    const { popularServiceHrefs } = await loadServices({
      dividaAtiva: 'true',
      carta: 'true',
    })

    expect(popularServiceHrefs(false)).toEqual(BUSCA_SEARCH)
    expect(popularServiceHrefs(true)).toEqual(CATALOGO)
  })
})
