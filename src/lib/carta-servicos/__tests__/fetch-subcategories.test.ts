import {
  fetchCartaServicosSubcategoriesByCategory,
  keepNonEmptySubcategories,
  parseCartaServicosPayload,
} from '@/lib/carta-servicos/fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/http-pref-rio-carta-servicos/default/default', () => ({
  getThemes: vi.fn(),
  getSubthemesByTheme: vi.fn(),
  getServicesBySubtheme: vi.fn(),
  getServiceDetail: vi.fn(),
}))

import {
  getSubthemesByTheme,
  getThemes,
} from '@/http-pref-rio-carta-servicos/default/default'

const mockGetThemes = vi.mocked(getThemes)
const mockGetSubthemesByTheme = vi.mocked(getSubthemesByTheme)

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
    } as Awaited<ReturnType<typeof getThemes>>)
  })

  it('retries after a transient failure and returns subcategories', async () => {
    mockGetSubthemesByTheme
      .mockResolvedValueOnce({
        status: 502,
        data: 'Bad Gateway',
        headers: new Headers(),
      } as unknown as Awaited<ReturnType<typeof getSubthemesByTheme>>)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            { name: 'Alvarás', slug: 'alvaras', publishedServices: 4 },
            { name: 'Sem contagem', slug: 'sem-contagem' },
          ],
        },
        headers: new Headers(),
      } as Awaited<ReturnType<typeof getSubthemesByTheme>>)

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
    } as Awaited<ReturnType<typeof getSubthemesByTheme>>)

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
    } as Awaited<ReturnType<typeof getThemes>>)

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
