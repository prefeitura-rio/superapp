// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const getApiV1Categories = vi.fn()
vi.mock('@/http-busca-search/categories/categories', () => ({
  getApiV1Categories: (...args: unknown[]) => getApiV1Categories(...args),
}))

import {
  type Category,
  findCategoryInList,
  lookupCategoryBySlug,
} from '@/lib/categories'

function category(name: string, extra: Partial<Category> = {}): Category {
  return {
    name,
    icon: null,
    categorySlug: name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Mn}/gu, ''),
    relevanciaMedia: 1,
    quantidadeServicos: 1,
    ...extra,
  }
}

const catalog = [
  category('Saúde'),
  category('Meio Ambiente', { themeSlug: 'meio-ambiente' }),
]

describe('findCategoryInList', () => {
  it('acha a categoria pelo slug do catálogo', () => {
    expect(findCategoryInList(catalog, 'saude')).toMatchObject({
      status: 'found',
      category: { name: 'Saúde' },
    })
  })

  it('acha a categoria pelo slug codificado na URL', () => {
    expect(findCategoryInList(catalog, 'meio%20ambiente')).toMatchObject({
      status: 'found',
      category: { name: 'Meio Ambiente' },
    })
  })

  it('acha a categoria pelo nome com acento e caixa diferentes', () => {
    expect(findCategoryInList(catalog, 'Sa%C3%BAde')).toMatchObject({
      status: 'found',
    })
  })

  it('acha a categoria pelo slug do tema da Carta de Serviços', () => {
    expect(findCategoryInList(catalog, 'meio-ambiente')).toMatchObject({
      status: 'found',
      category: { name: 'Meio Ambiente' },
    })
  })

  it('responde not_found para slug fora do catálogo', () => {
    expect(
      findCategoryInList(catalog, 'zzz-categoria-definitivamente-inexistente')
    ).toEqual({ status: 'not_found' })
  })

  it('aceita slug com escape inválido sem lançar', () => {
    expect(findCategoryInList(catalog, '%E0%A4%A')).toEqual({
      status: 'not_found',
    })
  })

  it('responde unavailable com catálogo vazio', () => {
    expect(findCategoryInList([], 'saude')).toEqual({ status: 'unavailable' })
  })
})

describe('lookupCategoryBySlug', () => {
  beforeEach(() => {
    getApiV1Categories.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('responde not_found quando o catálogo lido não tem o slug', async () => {
    getApiV1Categories.mockResolvedValue({
      status: 200,
      data: { categories: [{ name: 'Saúde', count: 2, popularity_score: 1 }] },
    })
    await expect(lookupCategoryBySlug('inexistente-999')).resolves.toEqual({
      status: 'not_found',
    })
  })

  it('responde found para categoria do catálogo', async () => {
    getApiV1Categories.mockResolvedValue({
      status: 200,
      data: { categories: [{ name: 'Saúde', count: 2, popularity_score: 1 }] },
    })
    await expect(lookupCategoryBySlug('saude')).resolves.toMatchObject({
      status: 'found',
    })
  })

  it('responde unavailable quando a API de categorias falha', async () => {
    getApiV1Categories.mockResolvedValue({ status: 500, data: {} })
    await expect(lookupCategoryBySlug('saude')).resolves.toEqual({
      status: 'unavailable',
    })
  })

  it('responde unavailable quando a chamada lança', async () => {
    getApiV1Categories.mockRejectedValue(new Error('timeout'))
    await expect(lookupCategoryBySlug('saude')).resolves.toEqual({
      status: 'unavailable',
    })
  })
})
