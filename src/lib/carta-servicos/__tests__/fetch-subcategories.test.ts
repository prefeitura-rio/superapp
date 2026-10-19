import {
  getApiPublicServicesSlug,
  getApiPublicSubthemesSlugServices,
  getApiPublicThemes,
  getApiPublicThemesSlugSubthemes,
} from '@/http-app-catalogo/carta/carta'
import {
  fetchCartaServicosServiceBySlug,
  fetchCartaServicosServicesByCategory,
  fetchCartaServicosSubcategoriesByCategory,
  keepNonEmptySubcategories,
  parseCartaServicosPayload,
} from '@/lib/carta-servicos/fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/http-app-catalogo/carta/carta', () => ({
  getApiPublicThemes: vi.fn(),
  getApiPublicThemesSlugSubthemes: vi.fn(),
  getApiPublicSubthemesSlugServices: vi.fn(),
  getApiPublicServicesSlug: vi.fn(),
}))

const mockGetThemes = vi.mocked(getApiPublicThemes)
const mockGetSubthemesByTheme = vi.mocked(getApiPublicThemesSlugSubthemes)
const mockGetServicesBySubtheme = vi.mocked(getApiPublicSubthemesSlugServices)
const mockGetService = vi.mocked(getApiPublicServicesSlug)

const getIcon = () => null

describe('keepNonEmptySubcategories', () => {
  it('preserves subcategories when count/publishedServices is missing', () => {
    const result = keepNonEmptySubcategories([
      { name: 'A', count: undefined },
      { name: 'B' },
      { name: 'C', count: 3 },
    ])

    expect(result.map(s => s.name)).toEqual(['A', 'B', 'C'])
  })

  it('drops subcategories only when count is explicitly zero', () => {
    const result = keepNonEmptySubcategories([
      { name: 'Empty', count: 0 },
      { name: 'Active', count: 2 },
      { name: 'Unknown' },
    ])

    expect(result.map(s => s.name)).toEqual(['Active', 'Unknown'])
  })
})

describe('parseCartaServicosPayload', () => {
  it('parses JSON string payloads', () => {
    const result = parseCartaServicosPayload<{ data: string[] }>(
      JSON.stringify({ data: ['a'] })
    )

    expect(result).toEqual({ data: ['a'] })
  })

  it('returns objects as-is', () => {
    const payload = { data: [{ slug: 'x' }] }
    expect(parseCartaServicosPayload(payload)).toBe(payload)
  })

  it('returns null for HTML / non-JSON strings (does not fake empty success)', () => {
    expect(parseCartaServicosPayload('<html>error</html>')).toBeNull()
    expect(parseCartaServicosPayload('Internal Server Error')).toBeNull()
  })

  it('returns null for invalid JSON object strings', () => {
    expect(parseCartaServicosPayload('{not-json')).toBeNull()
  })
})

describe('fetchCartaServicosSubcategoriesByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetThemes.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            name: 'Licenças',
            slug: 'licencas',
            publishedServices: 10,
          },
        ],
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getApiPublicThemes>>)
  })

  it('retries after a transient failure and returns subcategories', async () => {
    mockGetSubthemesByTheme
      .mockResolvedValueOnce({
        status: 502,
        data: 'Bad Gateway',
        headers: new Headers(),
      } as unknown as Awaited<
        ReturnType<typeof getApiPublicThemesSlugSubthemes>
      >)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            { name: 'Alvarás', slug: 'alvaras', publishedServices: 4 },
            { name: 'Sem contagem', slug: 'sem-contagem' },
          ],
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getApiPublicThemesSlugSubthemes>>)

    const result = await fetchCartaServicosSubcategoriesByCategory(
      'licencas',
      getIcon
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(mockGetSubthemesByTheme).toHaveBeenCalledTimes(2)
    expect(result.data.subcategories).toHaveLength(2)
    expect(result.data.subcategories?.[0]?.name).toBe('Alvarás')
    expect(result.data.subcategories?.[1]?.name).toBe('Sem contagem')
  })

  it('returns ok:false after exhausting retries on parse failures', async () => {
    mockGetSubthemesByTheme.mockResolvedValue({
      status: 200,
      data: '<html>upstream error</html>',
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getApiPublicThemesSlugSubthemes>>)

    const result = await fetchCartaServicosSubcategoriesByCategory(
      'licencas',
      getIcon
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('subthemes_parse_failed')
    expect(mockGetSubthemesByTheme).toHaveBeenCalledTimes(3)
  })

  it('returns ok:true with empty list when theme cannot be resolved', async () => {
    mockGetThemes.mockResolvedValue({
      status: 200,
      data: { data: [] },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getApiPublicThemes>>)

    const result = await fetchCartaServicosSubcategoriesByCategory(
      'inexistente',
      getIcon
    )

    expect(result).toEqual({
      ok: true,
      data: {
        category: 'inexistente',
        subcategories: [],
        total_subcategories: 0,
      },
    })
    expect(mockGetSubthemesByTheme).not.toHaveBeenCalled()
  })
})

describe('fetchCartaServicosServicesByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetThemes.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            name: 'Licenças',
            slug: 'licencas',
            publishedServices: 10,
          },
        ],
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getApiPublicThemes>>)
    mockGetSubthemesByTheme.mockResolvedValue({
      status: 200,
      data: {
        data: [
          { name: 'Poucos', slug: 'poucos', publishedServices: 1 },
          { name: 'Muitos', slug: 'muitos', publishedServices: 8 },
        ],
      },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof getApiPublicThemesSlugSubthemes>>)
  })

  it('builds four highlight cards from the fullest subthemes and stops', async () => {
    mockGetServicesBySubtheme.mockImplementation(async (slug: string) => {
      const names =
        slug === 'muitos' ? ['Um', 'Dois', 'Três', 'Quatro'] : ['Cinco', 'Seis']
      return {
        status: 200,
        data: {
          data: names.map(name => ({
            slug: name.toLowerCase(),
            name,
            summary: name,
            articleStatus: 'Online',
          })),
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getApiPublicSubthemesSlugServices>>
    })

    const result = await fetchCartaServicosServicesByCategory(
      'licencas',
      getIcon
    )

    expect(mockGetServicesBySubtheme).toHaveBeenCalledTimes(1)
    expect(mockGetServicesBySubtheme).toHaveBeenCalledWith(
      'muitos',
      { page: 1, per_page: 4 },
      expect.anything()
    )
    expect(
      result?.filtered_category?.services?.map(service => service.slug)
    ).toEqual(['um', 'dois', 'três', 'quatro'])
    expect(result?.filtered_category?.total_services).toBe(4)
    expect(result?.filtered_category?.name).toBe('Licenças')
  })

  it('continues into the next subtheme until four unique slugs', async () => {
    mockGetServicesBySubtheme.mockImplementation(async (slug: string) => {
      const names =
        slug === 'muitos' ? ['Um', 'Dois'] : ['Três', 'Quatro', 'Cinco']
      return {
        status: 200,
        data: {
          data: names.map(name => ({
            slug: name.toLowerCase(),
            name,
            summary: name,
          })),
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getApiPublicSubthemesSlugServices>>
    })

    const result = await fetchCartaServicosServicesByCategory(
      'licencas',
      getIcon
    )

    expect(mockGetServicesBySubtheme).toHaveBeenNthCalledWith(
      1,
      'muitos',
      { page: 1, per_page: 4 },
      expect.anything()
    )
    expect(mockGetServicesBySubtheme).toHaveBeenNthCalledWith(
      2,
      'poucos',
      { page: 1, per_page: 4 },
      expect.anything()
    )
    expect(
      result?.filtered_category?.services?.map(service => service.title)
    ).toEqual(['Um', 'Dois', 'Três', 'Quatro'])
  })
})

describe('fetchCartaServicosServiceBySlug', () => {
  it('reads the 301 body and fetches the canonical slug', async () => {
    mockGetService
      .mockResolvedValueOnce({
        status: 301,
        data: { redirect: 'iptu-2026' },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getApiPublicServicesSlug>>)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            slug: 'iptu-2026',
            name: 'IPTU 2026',
            themeName: 'Tributos',
          },
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getApiPublicServicesSlug>>)

    const result = await fetchCartaServicosServiceBySlug('iptu-2025')

    expect(mockGetService).toHaveBeenNthCalledWith(
      1,
      'iptu-2025',
      expect.objectContaining({ redirect: 'manual' })
    )
    expect(mockGetService).toHaveBeenNthCalledWith(
      2,
      'iptu-2026',
      expect.objectContaining({ redirect: 'manual' })
    )
    expect(result?.slug).toBe('iptu-2026')
    expect(result?.nome_servico).toBe('IPTU 2026')
  })
})
