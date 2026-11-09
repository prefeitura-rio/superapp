// @vitest-environment node
import { NextRequest } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getApiPublicOrgUnits = vi.fn()
const getApiPublicOrgUnitsSiciCodeServices = vi.fn()
vi.mock('@/http-app-catalogo/carta/carta', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getApiPublicOrgUnits: (...args: unknown[]) => getApiPublicOrgUnits(...args),
  getApiPublicOrgUnitsSiciCodeServices: (...args: unknown[]) =>
    getApiPublicOrgUnitsSiciCodeServices(...args),
}))

import { clearCartaPdfCache } from '@/lib/carta-servicos/pdf/render-carta-pdf'
import { GET } from '../route'

const ORG = {
  responsibleOrgUnit: 'Companhia de Engenharia de Tráfego do Rio de Janeiro',
  responsibleOrgUnitShortName: 'CET-RIO',
  responsibleOrgUnitSiciCode: '2951',
  publishedServices: 2,
}

const service = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  name: `Serviço ${slug}`,
  themeSlug: 'transito',
  articleStatus: 'Online',
  responsibleOrgUnitSiciCode: '2951',
  info: { summary: '<p>Resumo.</p>', cost: 'Gratuito' },
  ...extra,
})

const paged = (data: unknown[], page = 1, totalPages = 1) => ({
  status: 200,
  data: {
    data,
    meta: { page, per_page: 100, total: data.length, total_pages: totalPages },
  },
})

function call(siciCode: string) {
  return GET(
    new NextRequest(
      new URL(`/api/carta-de-servicos/${siciCode}/pdf`, 'http://localhost:3000')
    ),
    { params: Promise.resolve({ siciCode }) }
  )
}

describe('GET /api/carta-de-servicos/[siciCode]/pdf', () => {
  beforeEach(() => {
    clearCartaPdfCache()
    getApiPublicOrgUnits.mockReset()
    getApiPublicOrgUnitsSiciCodeServices.mockReset()
    getApiPublicOrgUnits.mockResolvedValue(paged([ORG]))
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devolve o PDF pronto para baixar, com o nome pela sigla', async () => {
    getApiPublicOrgUnitsSiciCodeServices.mockResolvedValue(
      paged([service('a'), service('b')])
    )

    const response = await call('2951')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/pdf')
    expect(response.headers.get('content-disposition')).toBe(
      'attachment; filename="carta-de-servicos-cet-rio.pdf"'
    )
    expect(response.headers.get('cache-control')).toContain('max-age=600')

    const bytes = Buffer.from(await response.arrayBuffer())
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    expect(Number(response.headers.get('content-length'))).toBe(bytes.length)
    const doc = await PDFDocument.load(bytes)
    expect(doc.getTitle()).toContain('CET-RIO')
  }, 30_000)

  it('busca todas as páginas de serviços (mais de 100) antes de montar', async () => {
    getApiPublicOrgUnitsSiciCodeServices.mockImplementation(
      async (_sici: string, params: { page: number }) =>
        paged(
          Array.from({ length: params.page === 1 ? 100 : 3 }, (_, i) =>
            service(`p${params.page}-${i}`, { info: { summary: '<p>x</p>' } })
          ),
          params.page,
          2
        )
    )

    const response = await call('2951')

    expect(response.status).toBe(200)
    expect(getApiPublicOrgUnitsSiciCodeServices).toHaveBeenCalledTimes(2)
    expect(getApiPublicOrgUnitsSiciCodeServices.mock.calls[0][0]).toBe('2951')
  }, 60_000)

  it('400 para código SICI inválido, sem chamar a API', async () => {
    const response = await call('..%2Fadmin')
    expect(response.status).toBe(400)
    expect(getApiPublicOrgUnits).not.toHaveBeenCalled()
  })

  it('404 quando o órgão não está na lista', async () => {
    const response = await call('9999')
    expect(response.status).toBe(404)
    expect(getApiPublicOrgUnitsSiciCodeServices).not.toHaveBeenCalled()
  })

  it('404 quando o órgão não tem serviço publicado de verdade', async () => {
    getApiPublicOrgUnitsSiciCodeServices.mockResolvedValue(
      paged([
        service('rascunho', { articleStatus: 'Draft' }),
        service('outro', { responsibleOrgUnitSiciCode: '1200' }),
      ])
    )
    const response = await call('2951')
    expect(response.status).toBe(404)
  })

  it('502 quando a app-catalogo falha em uma das páginas', async () => {
    getApiPublicOrgUnitsSiciCodeServices.mockImplementation(
      async (_sici: string, params: { page: number }) =>
        params.page === 2
          ? { status: 503, data: {} }
          : paged([service('a')], 1, 2)
    )
    const response = await call('2951')
    expect(response.status).toBe(502)
  })
})
