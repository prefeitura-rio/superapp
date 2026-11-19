import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { TERMOS_DE_USO_ROUTE } from '@/constants/termos-de-uso/platforms'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '../footer'

/**
 * Footer é um async RSC: precisa ser awaited antes de render.
 * As flags são lidas em runtime via process.env, então cada cenário
 * precisa setar as envs antes de chamar o componente.
 */
async function renderFooter() {
  const element = await Footer()
  render(element)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Footer — conteúdo estático (independente de flags)', () => {
  it('exibe informações de endereço da prefeitura', async () => {
    await renderFooter()
    expect(
      screen.getByText('Prefeitura da Cidade do Rio de Janeiro')
    ).toBeTruthy()
    expect(screen.getByText('Rua Afonso Cavalcanti, 455')).toBeTruthy()
    expect(screen.getByText('CNPJ: 42.498.733/0001-48')).toBeTruthy()
  })

  it('exibe os dois botões de telefone', async () => {
    await renderFooter()
    expect(screen.getAllByText('1746').length).toBeGreaterThan(0)
    expect(screen.getAllByText('(21) 3460-1746').length).toBeGreaterThan(0)
  })

  it('tem link de Transparência apontando para o portal de transparência', async () => {
    await renderFooter()
    const link = screen.getByRole('link', { name: 'Acesso à Informação' })
    expect(link).toHaveAttribute(
      'href',
      'https://transparencia.prefeitura.rio/'
    )
  })

  it('tem link "Oportunidades cariocas" apontando para /servicos/trabalho', async () => {
    await renderFooter()
    const link = screen.getByRole('link', { name: 'Oportunidades cariocas' })
    expect(link).toHaveAttribute('href', '/servicos/trabalho')
  })

  it('tem link "Mapa do site" sempre presente', async () => {
    await renderFooter()
    const link = screen.getByRole('link', { name: 'Mapa do site' })
    expect(link).toHaveAttribute('href', '/mapa-do-site')
  })
})

describe('Footer — links controlados por FEATURE_SALESFORCE + FEATURE_HOME_SOLICITACOES', () => {
  it('com ambas as flags ativas: exibe Ouvidoria, LAI e Carta de serviços', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('FEATURE_HOME_SOLICITACOES', 'true')
    await renderFooter()

    expect(screen.getByRole('link', { name: 'Ouvidoria' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Lei de acesso à informação' })
    ).toBeTruthy()
    const cartaLinks = screen.getAllByRole('link', {
      name: 'Carta de serviços',
    })
    expect(cartaLinks.length).toBeGreaterThan(0)
    for (const link of cartaLinks) {
      expect(link).toHaveAttribute('href', CARTA_DE_SERVICOS_ROUTE)
    }
  })

  it('com FEATURE_SALESFORCE=false: oculta Ouvidoria, LAI e Carta de serviços', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    vi.stubEnv('FEATURE_HOME_SOLICITACOES', 'true')
    await renderFooter()

    expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Lei de acesso à informação' })
    ).toBeNull()
    expect(screen.queryByRole('link', { name: 'Carta de serviços' })).toBeNull()
  })

  it('com FEATURE_HOME_SOLICITACOES=false: oculta Ouvidoria, LAI e Carta de serviços', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('FEATURE_HOME_SOLICITACOES', 'false')
    await renderFooter()

    expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Lei de acesso à informação' })
    ).toBeNull()
    expect(screen.queryByRole('link', { name: 'Carta de serviços' })).toBeNull()
  })

  it('com ambas as flags desligadas: oculta Ouvidoria, LAI e Carta de serviços', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    vi.stubEnv('FEATURE_HOME_SOLICITACOES', 'false')
    await renderFooter()

    expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Lei de acesso à informação' })
    ).toBeNull()
    expect(screen.queryByRole('link', { name: 'Carta de serviços' })).toBeNull()
  })
})

describe('Footer — links controlados apenas por FEATURE_SALESFORCE', () => {
  it('com FEATURE_SALESFORCE=true: exibe Termos de uso e Política de privacidade', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    await renderFooter()

    const termosLinks = screen.getAllByRole('link', { name: 'Termos de uso' })
    expect(termosLinks.length).toBeGreaterThan(0)
    for (const link of termosLinks) {
      expect(link).toHaveAttribute('href', TERMOS_DE_USO_ROUTE)
    }
    const privacidadeLinks = screen.getAllByRole('link', {
      name: 'Política de privacidade',
    })
    expect(privacidadeLinks.length).toBeGreaterThan(0)
    for (const link of privacidadeLinks) {
      expect(link).toHaveAttribute('href', TERMOS_DE_USO_ROUTE)
    }
  })

  it('com FEATURE_SALESFORCE=false: oculta Termos de uso e Política de privacidade', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')
    await renderFooter()

    expect(screen.queryByRole('link', { name: 'Termos de uso' })).toBeNull()
    expect(
      screen.queryByRole('link', { name: 'Política de privacidade' })
    ).toBeNull()
  })
})
