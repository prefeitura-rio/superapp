// @vitest-environment node
import { iptuIcon, multasIcon } from '@/constants/bucket'
import type { ModelsCartaHomeFeatured } from '@/http-app-catalogo/models/modelsCartaHomeFeatured'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mapHomeFeatured } from '../home-featured'

const getApiPublicThemes = vi.fn()
vi.mock('@/http-app-catalogo/carta/carta', () => ({
  getApiPublicThemes: (...args: unknown[]) => getApiPublicThemes(...args),
}))

function item(
  partial: ModelsCartaHomeFeatured & {
    slug: string
    name: string
    themeSlug: string
  }
): ModelsCartaHomeFeatured {
  return {
    themeName: 'Tributos',
    position: 1,
    ...partial,
  }
}

async function loadResolver(carta: 'true' | 'false') {
  vi.resetModules()
  vi.stubEnv('CARTA_SERVICOS_API_ENABLED', carta)
  return import('../home-featured')
}

describe('mapHomeFeatured', () => {
  it('ordena por position e monta o link da ficha', () => {
    const cards = mapHomeFeatured(
      [
        item({
          slug: 'depois',
          name: 'Depois',
          themeSlug: 'tributos',
          position: 2,
        }),
        item({
          slug: 'iptu-2026',
          name: 'IPTU 2026',
          themeSlug: 'tributos',
          themeName: 'Tributos',
          position: 1,
          summary: '<p>não entra no card</p>',
        }),
      ],
      { dividaAtivaEnabled: false }
    )

    expect(cards.map(card => card.title)).toEqual(['IPTU 2026', 'Depois'])
    expect(cards[0]).toMatchObject({
      id: 'iptu-2026',
      href: '/servicos/categoria/tributos/iptu-2026',
      icon: iptuIcon,
      description: 'Tributos',
    })
    expect(JSON.stringify(cards)).not.toContain('<p>')
  })

  it('ignora item sem slug, nome ou tema', () => {
    const cards = mapHomeFeatured([
      item({ slug: ' ', name: 'Sem slug', themeSlug: 'tributos' }),
      item({ slug: 'sem-nome', name: '  ', themeSlug: 'tributos' }),
      item({ slug: 'sem-tema', name: 'Sem tema', themeSlug: '' }),
      item({
        slug: 'ok',
        name: 'Ok',
        themeSlug: 'saude',
        themeName: 'Tema novo',
      }),
    ])

    expect(cards).toHaveLength(1)
    expect(cards[0]?.title).toBe('Ok')
    expect(cards[0]?.icon).toBeUndefined()
    expect(cards[0]?.href).toBe('/servicos/categoria/saude/ok')
  })

  it('manda a ficha de dívida ativa para o módulo quando a flag está ligada', () => {
    const featured = [
      item({
        slug: 'consulta-de-debitos-de-iptu-em-divida-ativa',
        name: 'Dívida Ativa',
        themeSlug: 'tributos',
      }),
    ]

    expect(
      mapHomeFeatured(featured, { dividaAtivaEnabled: true })[0]?.href
    ).toBe('/divida-ativa')
    expect(
      mapHomeFeatured(featured, { dividaAtivaEnabled: false })[0]?.href
    ).toBe(
      '/servicos/categoria/tributos/consulta-de-debitos-de-iptu-em-divida-ativa'
    )
  })
})

describe('resolveMostAccessedServices', () => {
  beforeEach(() => {
    getApiPublicThemes.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('não chama a app-catalogo com a flag desligada', async () => {
    const { resolveMostAccessedServices } = await loadResolver('false')
    const { MOST_ACCESSED_SERVICES } = await import(
      '@/constants/most-accessed-services'
    )

    await expect(resolveMostAccessedServices()).resolves.toBe(
      MOST_ACCESSED_SERVICES
    )
    expect(getApiPublicThemes).not.toHaveBeenCalled()
  })

  it('usa o ícone de carro na fiscalização de estacionamento', () => {
    const [card] = mapHomeFeatured([
      item({
        slug: 'fiscalizacao-de-estacionamento-irregular-de-veiculo',
        name: 'Fiscalização de estacionamento irregular de veículo',
        themeSlug: 'ordem-publica',
        themeName: 'Ordem Pública',
      }),
    ])

    expect(card?.icon).toBe(multasIcon)
  })

  it('mantém 5 da API e fecha com o card fixo de Dívida Ativa', async () => {
    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: {
        home_featured: Array.from({ length: 8 }, (_, index) =>
          item({
            slug: `s-${index}`,
            name: `Serviço ${index}`,
            themeSlug: 'tributos',
            position: 8 - index,
          })
        ),
      },
    })

    const { resolveMostAccessedServices } = await loadResolver('true')
    const cards = await resolveMostAccessedServices()

    expect(getApiPublicThemes).toHaveBeenCalledWith(
      { include_featured: true, per_page: 100 },
      expect.objectContaining({
        next: expect.objectContaining({
          revalidate: 600,
          tags: ['home-featured'],
        }),
      })
    )
    expect(cards).toHaveLength(6)
    expect(cards.map(card => card.id)).toEqual([
      's-7',
      's-6',
      's-5',
      's-4',
      's-3',
      'divida-ativa',
    ])
    expect(cards[5]?.icon).toBeTruthy()
    expect(cards[5]?.title).toContain('Dívida Ativa')
  })

  it('lista vazia da API não cai na constante', async () => {
    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: { home_featured: [] },
    })

    const { resolveMostAccessedServices } = await loadResolver('true')
    await expect(resolveMostAccessedServices()).resolves.toEqual([])
    expect(console.error).not.toHaveBeenCalled()
  })

  it('erro de status ou de rede mantém a constante', async () => {
    getApiPublicThemes.mockResolvedValue({ status: 503, data: {} })
    const first = await loadResolver('true')
    const firstConstant = await import('@/constants/most-accessed-services')
    await expect(first.resolveMostAccessedServices()).resolves.toBe(
      firstConstant.MOST_ACCESSED_SERVICES
    )

    getApiPublicThemes.mockResolvedValue({ status: 200, data: { data: [] } })
    const missing = await loadResolver('true')
    const missingConstant = await import('@/constants/most-accessed-services')
    await expect(missing.resolveMostAccessedServices()).resolves.toBe(
      missingConstant.MOST_ACCESSED_SERVICES
    )

    getApiPublicThemes.mockRejectedValue(new Error('timeout'))
    const thrown = await loadResolver('true')
    const thrownConstant = await import('@/constants/most-accessed-services')
    await expect(thrown.resolveMostAccessedServices()).resolves.toBe(
      thrownConstant.MOST_ACCESSED_SERVICES
    )
    expect(console.error).toHaveBeenCalled()
  })
})
