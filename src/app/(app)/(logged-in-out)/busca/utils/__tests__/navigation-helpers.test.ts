import { handleCatalogItemClick } from '@/app/(app)/(logged-in-out)/busca/utils/navigation-helpers'
import type { ModelsSearchItem } from '@/http-app-catalogo/models'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

function serviceItem(
  metadata: Record<string, unknown>,
  url = 'https://prefeitura.rio/servicos/iptu-2026'
): ModelsSearchItem {
  return {
    type: 'service',
    title: 'IPTU 2026',
    url,
    metadata,
  }
}

describe('handleCatalogItemClick', () => {
  const push = vi.fn()
  const onExternalLinkClick = vi.fn()
  const router = { push } as never

  beforeEach(() => {
    push.mockClear()
    onExternalLinkClick.mockClear()
  })

  it('opens the external drawer when the carta flag is off and there is no tema_geral', () => {
    handleCatalogItemClick(
      serviceItem({ slug: 'iptu-2026', themeSlug: 'tributos' }),
      'iptu',
      router,
      onExternalLinkClick
    )

    expect(onExternalLinkClick).toHaveBeenCalledWith(
      'https://prefeitura.rio/servicos/iptu-2026'
    )
    expect(push).not.toHaveBeenCalled()
  })

  it('navigates internally with themeSlug when the carta flag is on', () => {
    handleCatalogItemClick(
      serviceItem({ slug: 'iptu-2026', themeSlug: 'tributos' }),
      'iptu',
      router,
      onExternalLinkClick,
      { cartaServicosEnabled: true }
    )

    expect(push).toHaveBeenCalledWith('/servicos/categoria/tributos/iptu-2026')
    expect(onExternalLinkClick).not.toHaveBeenCalled()
  })

  it('falls back to themeName when themeSlug is missing and the flag is on', () => {
    handleCatalogItemClick(
      serviceItem({ slug: 'iptu-2026', themeName: 'Tributos' }),
      'iptu',
      router,
      onExternalLinkClick,
      { cartaServicosEnabled: true }
    )

    expect(push).toHaveBeenCalledWith('/servicos/categoria/tributos/iptu-2026')
  })

  it('keeps the tema_geral path when the carta flag is off', () => {
    handleCatalogItemClick(
      serviceItem({
        slug: 'iptu-2026',
        tema_geral: 'Tributos',
        themeSlug: 'tributos',
      }),
      'iptu',
      router,
      onExternalLinkClick,
      { cartaServicosEnabled: false }
    )

    expect(push).toHaveBeenCalledWith('/servicos/categoria/tributos/iptu-2026')
    expect(onExternalLinkClick).not.toHaveBeenCalled()
  })
})
