import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { type Mock, beforeEach, describe, expect, test, vi } from 'vitest'
import { handleCatalogItemClick } from '../navigation-helpers'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

function makeRouter(): AppRouterInstance {
  return {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  } as unknown as AppRouterInstance
}

function jobItem(overrides: Partial<ModelsSearchItem> = {}): ModelsSearchItem {
  return {
    // item.id é o UUID interno do catálogo, NÃO o id da vaga no app-go-api.
    id: '11111111-1111-4111-8111-111111111111',
    type: 'job',
    title: 'Analista de dados',
    ...overrides,
  }
}

describe('handleCatalogItemClick — vagas (job)', () => {
  let router: AppRouterInstance
  let onExternalLinkClick: Mock<(url: string) => void>

  beforeEach(() => {
    router = makeRouter()
    onExternalLinkClick = vi.fn<(url: string) => void>()
  })

  test('usa o slug top-level (URL SEO) quando presente', () => {
    const item = jobItem({
      slug: 'analista-de-dados-b06235c80d2a',
      metadata: {
        id: '22222222-2222-4222-8222-222222222222',
        slug: 'analista-de-dados-b06235c80d2a',
      },
    })

    handleCatalogItemClick(item, 'analista', router, onExternalLinkClick)

    expect(router.push).toHaveBeenCalledWith(
      '/servicos/trabalho/analista-de-dados-b06235c80d2a'
    )
  })

  test('cai para metadata.id (id real da vaga) quando não há slug', () => {
    const item = jobItem({
      metadata: { id: '22222222-2222-4222-8222-222222222222' },
    })

    handleCatalogItemClick(item, 'q', router, onExternalLinkClick)

    expect(router.push).toHaveBeenCalledWith(
      '/servicos/trabalho/22222222-2222-4222-8222-222222222222'
    )
  })

  test('slug vazio ("") NÃO curto-circuita o fallback para metadata.id', () => {
    // Regressão PREF-322: mesmo que o source_data (metadata) traga slug:""
    // (dados sincronizados antes do slug existir), a string vazia não pode
    // "vencer" o fallback para metadata.id.
    const item = jobItem({
      metadata: { slug: '', id: '22222222-2222-4222-8222-222222222222' },
    })

    handleCatalogItemClick(item, 'q', router, onExternalLinkClick)

    expect(router.push).toHaveBeenCalledWith(
      '/servicos/trabalho/22222222-2222-4222-8222-222222222222'
    )
  })

  test('NÃO navega usando item.id (UUID interno do catálogo) como identificador', () => {
    // Sem slug e sem metadata.id: item.id não é aceito pelo app-go-api, então
    // não deve ser usado como identificador da vaga.
    const item = jobItem({ metadata: {} })

    handleCatalogItemClick(item, 'q', router, onExternalLinkClick)

    expect(router.push).not.toHaveBeenCalled()
    expect(onExternalLinkClick).not.toHaveBeenCalled()
  })

  test('sem identificador mas com url → abre link externo', () => {
    const item = jobItem({ metadata: {}, url: 'https://example.com/vaga' })

    handleCatalogItemClick(item, 'q', router, onExternalLinkClick)

    expect(onExternalLinkClick).toHaveBeenCalledWith('https://example.com/vaga')
    expect(router.push).not.toHaveBeenCalled()
  })

  test('encoda o identificador na URL', () => {
    const item = jobItem({ slug: 'a b/c' })

    handleCatalogItemClick(item, 'q', router, onExternalLinkClick)

    expect(router.push).toHaveBeenCalledWith('/servicos/trabalho/a%20b%2Fc')
  })
})
