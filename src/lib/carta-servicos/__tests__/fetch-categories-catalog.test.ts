// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getApiPublicThemes = vi.fn()
vi.mock('@/http-app-catalogo/carta/carta', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  getApiPublicThemes: (...args: unknown[]) => getApiPublicThemes(...args),
}))

import { fetchCartaServicosCategoryCatalog } from '@/lib/carta-servicos/fetch'

const theme = (i: number) => ({
  name: `Tema ${i}`,
  slug: `tema-${i}`,
  publishedServices: 1,
})

describe('fetchCartaServicosCategoryCatalog', () => {
  beforeEach(() => getApiPublicThemes.mockReset())

  it('marca completo quando meta.total cabe na página', async () => {
    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: { data: [theme(1), theme(2)], meta: { total: 2, total_pages: 1 } },
    })
    const catalog = await fetchCartaServicosCategoryCatalog(() => null)
    expect(catalog.categories).toHaveLength(2)
    expect(catalog.complete).toBe(true)
  })

  it('marca incompleto quando meta.total passa da página', async () => {
    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: { data: [theme(1)], meta: { total: 120, total_pages: 2 } },
    })
    const catalog = await fetchCartaServicosCategoryCatalog(() => null)
    expect(catalog.complete).toBe(false)
  })

  it('sem meta, marca incompleto só com a página cheia', async () => {
    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: { data: Array.from({ length: 100 }, (_, i) => theme(i)) },
    })
    expect((await fetchCartaServicosCategoryCatalog(() => null)).complete).toBe(
      false
    )

    getApiPublicThemes.mockResolvedValue({
      status: 200,
      data: { data: [theme(1)] },
    })
    expect((await fetchCartaServicosCategoryCatalog(() => null)).complete).toBe(
      true
    )
  })
})
