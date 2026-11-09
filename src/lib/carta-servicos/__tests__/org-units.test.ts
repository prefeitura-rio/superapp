// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getApiPublicOrgUnits = vi.fn()
const getApiPublicOrgUnitsSiciCodeServices = vi.fn()
vi.mock('@/http-app-catalogo/carta/carta', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getApiPublicOrgUnits: (...args: unknown[]) => getApiPublicOrgUnits(...args),
  getApiPublicOrgUnitsSiciCodeServices: (...args: unknown[]) =>
    getApiPublicOrgUnitsSiciCodeServices(...args),
}))

import {
  CartaFetchError,
  cartaPdfFileName,
  cartaServiceHref,
  fetchCartaOrgUnitServices,
  fetchCartaOrgUnits,
  filterOrgUnitServices,
  formatOrgUnitLabel,
  isValidSiciCode,
  stripShortNameFromName,
  toCartaOrgUnits,
} from '@/lib/carta-servicos/org-units'

const page = <T>(data: T[], pageNo: number, totalPages: number) => ({
  status: 200,
  data: {
    data,
    meta: { page: pageNo, per_page: 100, total: 0, total_pages: totalPages },
  },
})

describe('toCartaOrgUnits', () => {
  it('descarta órgão sem siciCode e ordena pelo nome em pt-BR', () => {
    const orgs = toCartaOrgUnits([
      {
        responsibleOrgUnit: 'Secretaria Municipal de Saúde',
        responsibleOrgUnitShortName: 'SMS',
        responsibleOrgUnitSiciCode: '2',
        publishedServices: 3,
      },
      {
        responsibleOrgUnit: 'Órgão sem código',
        responsibleOrgUnitShortName: 'X',
        responsibleOrgUnitSiciCode: '  ',
        publishedServices: 1,
      },
      {
        responsibleOrgUnit: 'Companhia Carioca de Parcerias e Investimentos',
        responsibleOrgUnitShortName: 'CCPar',
        responsibleOrgUnitSiciCode: '1',
        publishedServices: 1,
      },
      {
        responsibleOrgUnit: 'Ágora sem serviço',
        responsibleOrgUnitShortName: 'AG',
        responsibleOrgUnitSiciCode: '3',
        publishedServices: 0,
      },
    ])

    expect(orgs.map(org => org.siciCode)).toEqual(['1', '2'])
  })
})

describe('stripShortNameFromName', () => {
  it('tira a sigla repetida no fim ou no começo do nome (dado real de staging)', () => {
    expect(
      stripShortNameFromName(
        'Distribuidora de Filmes S.A. - RIOFILME',
        'RIOFILME'
      )
    ).toBe('Distribuidora de Filmes S.A.')
    expect(
      stripShortNameFromName(
        'MULTIRIO - Empresa Municipal de Multimeios Ltda.',
        'MULTIRIO'
      )
    ).toBe('Empresa Municipal de Multimeios Ltda.')
  })

  it('mantém sigla que é parte natural do nome', () => {
    expect(
      stripShortNameFromName('Fundação Cidade das Artes', 'CIDADE DAS ARTES')
    ).toBe('Fundação Cidade das Artes')
    expect(
      stripShortNameFromName(
        'Riocentro S.A. - Centro de Feiras e Congressos',
        'RIOCENTRO'
      )
    ).toBe('Riocentro S.A. - Centro de Feiras e Congressos')
  })

  it('a listagem já sai sem a sigla duplicada e ordenada pelo nome limpo', () => {
    const orgs = toCartaOrgUnits([
      {
        responsibleOrgUnit: 'MULTIRIO - Empresa Municipal de Multimeios Ltda.',
        responsibleOrgUnitShortName: 'MULTIRIO',
        responsibleOrgUnitSiciCode: '1',
        publishedServices: 1,
      },
      {
        responsibleOrgUnit: 'Distribuidora de Filmes S.A. - RIOFILME',
        responsibleOrgUnitShortName: 'RIOFILME',
        responsibleOrgUnitSiciCode: '2',
        publishedServices: 1,
      },
    ])
    expect(orgs.map(formatOrgUnitLabel)).toEqual([
      'Distribuidora de Filmes S.A. - RIOFILME',
      'Empresa Municipal de Multimeios Ltda. - MULTIRIO',
    ])
  })
})

describe('formatOrgUnitLabel', () => {
  it('usa "Nome do ente - Sigla"', () => {
    expect(
      formatOrgUnitLabel({
        name: 'Companhia Carioca de Parcerias e Investimentos',
        shortName: 'CCPar',
      })
    ).toBe('Companhia Carioca de Parcerias e Investimentos - CCPar')
  })

  it('sem sigla, mostra só o nome', () => {
    expect(formatOrgUnitLabel({ name: 'Controladoria', shortName: '' })).toBe(
      'Controladoria'
    )
  })
})

describe('fetchCartaOrgUnits', () => {
  beforeEach(() => {
    getApiPublicOrgUnits.mockReset()
  })

  it('percorre todas as páginas com per_page 100', async () => {
    getApiPublicOrgUnits.mockImplementation(async (params: { page: number }) =>
      page(
        [
          {
            responsibleOrgUnit: `Órgão ${params.page}`,
            responsibleOrgUnitShortName: `O${params.page}`,
            responsibleOrgUnitSiciCode: String(params.page),
            publishedServices: 1,
          },
        ],
        params.page,
        3
      )
    )

    const orgs = await fetchCartaOrgUnits()

    expect(orgs).toHaveLength(3)
    expect(getApiPublicOrgUnits).toHaveBeenCalledTimes(3)
    for (const [params] of getApiPublicOrgUnits.mock.calls) {
      expect(params.per_page).toBe(100)
    }
  })

  it('falha inteiro quando uma página falha (lista não sai com buracos)', async () => {
    getApiPublicOrgUnits.mockImplementation(async (params: { page: number }) =>
      params.page === 2 ? { status: 503, data: {} } : page([], params.page, 2)
    )
    await expect(fetchCartaOrgUnits()).rejects.toBeInstanceOf(CartaFetchError)
  })
})

describe('fetchCartaOrgUnitServices', () => {
  beforeEach(() => {
    getApiPublicOrgUnitsSiciCodeServices.mockReset()
  })

  it('junta mais de 100 serviços vindos de várias páginas', async () => {
    getApiPublicOrgUnitsSiciCodeServices.mockImplementation(
      async (_sici: string, params: { page: number }) =>
        page(
          Array.from({ length: params.page === 1 ? 100 : 46 }, (_, i) => ({
            name: `Serviço ${params.page}-${i}`,
            slug: `s-${params.page}-${i}`,
            responsibleOrgUnitSiciCode: '1400',
            articleStatus: 'Online',
          })),
          params.page,
          2
        )
    )

    const services = await fetchCartaOrgUnitServices('1400')

    expect(services).toHaveLength(146)
    expect(getApiPublicOrgUnitsSiciCodeServices).toHaveBeenCalledTimes(2)
  })
})

describe('filterOrgUnitServices', () => {
  it('mantém só publicados, do próprio órgão e com nome', () => {
    const result = filterOrgUnitServices(
      [
        { name: 'B', responsibleOrgUnitSiciCode: '1', articleStatus: 'Online' },
        {
          name: 'Rascunho',
          responsibleOrgUnitSiciCode: '1',
          articleStatus: 'Draft',
        },
        { name: 'Outro órgão', responsibleOrgUnitSiciCode: '2' },
        { name: 'Sem código' },
        { name: '', responsibleOrgUnitSiciCode: '1' },
        { name: 'A', responsibleOrgUnitSiciCode: '1' },
      ],
      '1'
    )
    expect(result.map(service => service.name)).toEqual(['A', 'B'])
  })
})

describe('helpers', () => {
  it('cartaPdfFileName usa a sigla normalizada', () => {
    expect(cartaPdfFileName({ shortName: 'CET-RIO', siciCode: '2951' })).toBe(
      'carta-de-servicos-cet-rio.pdf'
    )
    expect(cartaPdfFileName({ shortName: 'SEÇÃO Á', siciCode: '1' })).toBe(
      'carta-de-servicos-secao-a.pdf'
    )
    expect(cartaPdfFileName({ shortName: '', siciCode: '1200' })).toBe(
      'carta-de-servicos-1200.pdf'
    )
  })

  it('isValidSiciCode recusa path traversal', () => {
    expect(isValidSiciCode('1200')).toBe(true)
    expect(isValidSiciCode('../x')).toBe(false)
    expect(isValidSiciCode('')).toBe(false)
  })

  it('cartaServiceHref monta a rota do serviço', () => {
    expect(
      cartaServiceHref({ slug: 'nada-consta', themeSlug: 'servidor' })
    ).toBe('/servicos/categoria/servidor/nada-consta')
    expect(cartaServiceHref({ slug: 'x' })).toBeNull()
  })
})
