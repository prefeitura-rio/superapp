import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))

vi.mock('@/lib/categories', () => ({
  fetchCategories: vi.fn(async () => []),
  normalizeCategoryName: (name: string) => name,
}))

const TICKET_BASE = 'https://1746.example/protocolo'

async function renderMapa(salesforce: boolean) {
  vi.resetModules()
  vi.stubEnv('FEATURE_SALESFORCE', salesforce ? 'true' : 'false')
  vi.stubEnv('NEXT_PUBLIC_TICKET_FORM_BASE_URL', TICKET_BASE)
  const { default: MapaDoSitePage } = await import('../page')
  render(await MapaDoSitePage())
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Mapa do site — Solicitações', () => {
  it('inclui Minhas solicitações e aponta Ouvidoria e LAI para o formulário do ambiente', async () => {
    await renderMapa(true)

    const section = screen.getByRole('region', { name: 'Solicitações' })
    const link = (name: string) => within(section).getByRole('link', { name })

    expect(link('Minhas solicitações')).toHaveAttribute(
      'href',
      '/minhas-solicitacoes'
    )
    expect(link('Consulta de protocolo')).toHaveAttribute(
      'href',
      '/consulta-protocolo'
    )
    expect(link('Ouvidoria')).toHaveAttribute(
      'href',
      `${TICKET_BASE}/ouvidoria`
    )
    expect(link('Ouvidoria')).toHaveAttribute('target', '_blank')
    expect(link('Lei de Acesso à Informação')).toHaveAttribute(
      'href',
      `${TICKET_BASE}/lai`
    )
    expect(link('Lei de Acesso à Informação')).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('omite a seção quando FEATURE_SALESFORCE está desligada', async () => {
    await renderMapa(false)
    expect(screen.queryByRole('region', { name: 'Solicitações' })).toBeNull()
  })
})
