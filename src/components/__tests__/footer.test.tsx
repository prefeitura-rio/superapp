import { CARTA_DE_SERVICOS_ROUTE } from '@/constants/carta-de-servicos'
import { TERMOS_DE_USO_ROUTE } from '@/constants/termos-de-uso/platforms'
import { TICKET_FORM_BASE_URL } from '@/constants/url'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Footer } from '../footer'

describe('Footer', () => {
  it('exibe informações de endereço da prefeitura', () => {
    render(<Footer />)
    expect(
      screen.getByText('Prefeitura da Cidade do Rio de Janeiro')
    ).toBeTruthy()
    expect(screen.getByText('Rua Afonso Cavalcanti, 455')).toBeTruthy()
    expect(screen.getByText('CNPJ: 42.498.733/0001-48')).toBeTruthy()
  })

  it('exibe os dois botões de telefone', () => {
    render(<Footer />)
    expect(screen.getAllByText('1746').length).toBeGreaterThan(0)
    expect(screen.getAllByText('(21) 3460-1746').length).toBeGreaterThan(0)
  })

  it('tem link "Carta de serviços" apontando para a rota correta', () => {
    render(<Footer salesforceEnabled />)
    const links = screen.getAllByRole('link', { name: 'Carta de serviços' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', CARTA_DE_SERVICOS_ROUTE)
    }
  })

  it('tem link "Termos de uso" apontando para a rota correta', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link', { name: 'Termos de uso' })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', TERMOS_DE_USO_ROUTE)
    }
  })

  it('tem link de Transparência apontando para o portal de transparência', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Acesso à Informação' })
    expect(link).toHaveAttribute(
      'href',
      'https://transparencia.prefeitura.rio/'
    )
  })

  it('tem link "Oportunidades cariocas" apontando para /servicos/trabalho', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Oportunidades cariocas' })
    expect(link).toHaveAttribute('href', '/servicos/trabalho')
  })

  describe('links rápidos e FEATURE_SALESFORCE (DEV-649)', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    function quickLinkLabels() {
      const title = screen.getByText('Links rápidos')
      const list = title.nextElementSibling as HTMLElement
      return within(list)
        .getAllByRole('link')
        .map(link => link.textContent)
    }

    it('com a flag ligada, mostra os links de atendimento e a Carta de serviços', () => {
      render(<Footer salesforceEnabled />)

      expect(quickLinkLabels()).toEqual([
        'Serviços',
        'Oportunidades cariocas',
        'Ouvidoria',
        'Lei de acesso à informação',
        'Perguntas frequentes',
        'Carta de serviços',
        'Mapa do site',
        'Termos de uso',
        'Política de privacidade',
      ])
      expect(screen.getByRole('link', { name: 'Ouvidoria' })).toHaveAttribute(
        'href',
        `${TICKET_FORM_BASE_URL}/ouvidoria`
      )
      expect(
        screen.getByRole('link', { name: 'Lei de acesso à informação' })
      ).toHaveAttribute('href', `${TICKET_FORM_BASE_URL}/lai`)
    })

    it('com a flag desligada, oculta Ouvidoria, LAI e Carta de serviços e mantém Perguntas frequentes', () => {
      render(<Footer salesforceEnabled={false} />)

      expect(quickLinkLabels()).toEqual([
        'Serviços',
        'Oportunidades cariocas',
        'Perguntas frequentes',
        'Mapa do site',
        'Termos de uso',
        'Política de privacidade',
      ])
      expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
      expect(
        screen.queryByRole('link', { name: 'Lei de acesso à informação' })
      ).toBeNull()
      expect(
        screen.queryByRole('link', { name: 'Carta de serviços' })
      ).toBeNull()
      expect(
        screen.getByRole('link', { name: 'Perguntas frequentes' })
      ).toHaveAttribute('href', '/faq')
    })

    it('sem a prop, fica desligada (kill switch seguro)', () => {
      render(<Footer />)

      expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
      expect(
        screen.queryByRole('link', { name: 'Carta de serviços' })
      ).toBeNull()
    })

    it('segue o valor lido no servidor, não o process.env do bundle do cliente', () => {
      vi.stubEnv('FEATURE_SALESFORCE', 'true')
      render(<Footer salesforceEnabled={false} />)

      expect(screen.queryByRole('link', { name: 'Ouvidoria' })).toBeNull()
      expect(
        screen.queryByRole('link', { name: 'Carta de serviços' })
      ).toBeNull()
    })
  })
})
