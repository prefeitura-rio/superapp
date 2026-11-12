// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const notFound = vi.fn(() => {
  throw new Error('NEXT_HTTP_ERROR_FALLBACK;404')
})
vi.mock('next/navigation', () => ({ notFound: () => notFound() }))

const lookupCategoryBySlug = vi.fn()
vi.mock('@/lib/categories', () => ({
  lookupCategoryBySlug: (slug: string) => lookupCategoryBySlug(slug),
}))

const getDalCategorias = vi.fn()
vi.mock('@/lib/dal', () => ({
  getDalCategorias: (...args: unknown[]) => getDalCategorias(...args),
}))

import CoursesCategoryLayout from '@/app/(app)/(logged-in-out)/servicos/(servicos)/cursos/categoria/[slug]/layout'
import CategoryListingLayout from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/(main)/layout'

const children = 'conteúdo da página'

describe('layout de /servicos/categoria/[category-slug]', () => {
  beforeEach(() => {
    notFound.mockClear()
    lookupCategoryBySlug.mockReset()
  })

  function render(slug: string) {
    return CategoryListingLayout({
      children,
      params: Promise.resolve({ 'category-slug': slug }),
    })
  }

  it('chama notFound() para categoria fora do catálogo', async () => {
    lookupCategoryBySlug.mockResolvedValue({ status: 'not_found' })
    await expect(render('zzz-inexistente-999')).rejects.toThrow('404')
    expect(lookupCategoryBySlug).toHaveBeenCalledWith('zzz-inexistente-999')
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it('renderiza a página para categoria do catálogo', async () => {
    lookupCategoryBySlug.mockResolvedValue({
      status: 'found',
      category: { name: 'Saúde' },
    })
    await expect(render('saude')).resolves.toBe(children)
    expect(notFound).not.toHaveBeenCalled()
  })

  it('renderiza a página quando o catálogo está indisponível', async () => {
    lookupCategoryBySlug.mockResolvedValue({ status: 'unavailable' })
    await expect(render('saude')).resolves.toBe(children)
    expect(notFound).not.toHaveBeenCalled()
  })
})

describe('layout de /servicos/cursos/categoria/[slug]', () => {
  beforeEach(() => {
    notFound.mockClear()
    getDalCategorias.mockReset()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  function render(slug: string) {
    return CoursesCategoryLayout({
      children,
      params: Promise.resolve({ slug }),
    })
  }

  const catalog = {
    status: 200,
    data: {
      data: [
        { id: 1, nome: 'Dados' },
        { id: 46, nome: 'Rio do Futuro' },
      ],
      meta: { page: 1, page_size: 100, total: 2 },
    },
  }

  it('chama notFound() para categoria fora do catálogo', async () => {
    getDalCategorias.mockResolvedValue(catalog)
    await expect(render('categoria-cursos-inexistente-999')).rejects.toThrow(
      '404'
    )
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it('consulta todas as categorias, não só as com curso aberto', async () => {
    getDalCategorias.mockResolvedValue(catalog)
    await render('dados')
    const [params] = getDalCategorias.mock.calls[0]
    expect(params).not.toHaveProperty('onlyWithCourses')
  })

  it('renderiza a página para categoria do catálogo', async () => {
    getDalCategorias.mockResolvedValue(catalog)
    await expect(render('rio-do-futuro')).resolves.toBe(children)
    expect(notFound).not.toHaveBeenCalled()
  })

  it('renderiza a página quando a API responde erro', async () => {
    getDalCategorias.mockResolvedValue({ status: 500, data: {} })
    await expect(render('qualquer')).resolves.toBe(children)
    expect(notFound).not.toHaveBeenCalled()
  })

  it('renderiza a página quando a chamada lança', async () => {
    getDalCategorias.mockRejectedValue(new Error('timeout'))
    await expect(render('qualquer')).resolves.toBe(children)
    expect(notFound).not.toHaveBeenCalled()
  })
})

/**
 * O `notFound()` desses layouts só vira HTTP 404 se nenhum `loading.*` estiver
 * acima do layout: o `loading.tsx` do próprio segmento fica abaixo dele (envolve
 * só a página), então não conta.
 */
const APP_DIR = path.resolve(__dirname, '../app')
const SERVICOS = '(app)/(logged-in-out)/servicos'
const LOADING_FILES = ['loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js']

const listingSegments = [
  `${SERVICOS}/categoria/[category-slug]/(main)`,
  `${SERVICOS}/(servicos)/cursos/categoria/[slug]`,
]

function loadingFilesAboveSegment(routeDir: string): string[] {
  const found: string[] = []
  let current = APP_DIR
  const ancestors = ['', ...routeDir.split('/').slice(0, -1)]
  for (const segment of ancestors) {
    current = path.join(current, segment)
    for (const file of LOADING_FILES) {
      if (existsSync(path.join(current, file))) {
        found.push(path.relative(APP_DIR, path.join(current, file)))
      }
    }
  }
  return found
}

describe('listagens por categoria com 404 no layout', () => {
  it.each(listingSegments)('%s chama notFound() no layout', routeDir => {
    const source = readFileSync(
      path.join(APP_DIR, routeDir, 'layout.tsx'),
      'utf8'
    )
    expect(source).toContain('notFound()')
  })

  it.each(listingSegments)('%s não tem loading.* acima do layout', routeDir => {
    expect(loadingFilesAboveSegment(routeDir)).toEqual([])
  })
})
