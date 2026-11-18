import type { CartaOrgUnit } from '@/lib/carta-servicos/org-units'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const flags = vi.hoisted(() => ({ salesforce: true }))
const fetchCartaOrgUnits = vi.fn()
const fetchCartaOrgUnit = vi.fn()
const fetchCartaOrgUnitServices = vi.fn()

vi.mock('@/lib/feature-flags', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  isSalesforceServicesEnabled: () => flags.salesforce,
}))
vi.mock('@/lib/carta-servicos/org-units', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  fetchCartaOrgUnits: () => fetchCartaOrgUnits(),
  fetchCartaOrgUnit: (sici: string) => fetchCartaOrgUnit(sici),
  fetchCartaOrgUnitServices: (sici: string) => fetchCartaOrgUnitServices(sici),
}))
vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))

const notFoundError = new Error('NEXT_NOT_FOUND')
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw notFoundError
  },
}))

import CartaDeServicosPage from '../(main)/page'
import CartaDeServicosOrgaoPage from '../[siciCode]/page'

const CET: CartaOrgUnit = {
  siciCode: '2951',
  name: 'Companhia de Engenharia de Tráfego do Rio de Janeiro',
  shortName: 'CET-RIO',
  publishedServices: 2,
}
const CGM: CartaOrgUnit = {
  siciCode: '1200',
  name: 'Controladoria Geral do Município do Rio de Janeiro',
  shortName: 'CGM',
  publishedServices: 1,
}

const orgParams = (siciCode: string) => ({
  params: Promise.resolve({ siciCode }),
})

beforeEach(() => {
  flags.salesforce = true
  fetchCartaOrgUnits.mockReset()
  fetchCartaOrgUnit.mockReset()
  fetchCartaOrgUnitServices.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('/carta-de-servicos', () => {
  it('lista os órgãos como "Nome do ente - Sigla", na ordem recebida, sem "Todas as secretarias"', async () => {
    fetchCartaOrgUnits.mockResolvedValue([CET, CGM])
    const { container } = render(await CartaDeServicosPage())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Carta de serviços' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Cartas de serviços por Órgão',
      })
    ).toBeVisible()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Ver mais' })).toBeInTheDocument()

    const main = screen.getByRole('main')
    const list = within(main).getByRole('list')
    const links = within(list).getAllByRole('link')
    expect(links.map(link => link.textContent)).toEqual([
      'Companhia de Engenharia de Tráfego do Rio de Janeiro - CET-RIO',
      'Controladoria Geral do Município do Rio de Janeiro - CGM',
    ])
    expect(links[0]).toHaveAttribute('href', '/carta-de-servicos/2951')
    // Chevron à direita do nome reforça que o card é clicável (decorativo p/ leitor de tela).
    for (const link of links) {
      const icon = link.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(link.lastElementChild).toBe(icon)
    }
    expect(screen.queryByText(/todas as secretarias/i)).not.toBeInTheDocument()
  })

  it('falha da API vira mensagem, sem derrubar a página', async () => {
    fetchCartaOrgUnits.mockRejectedValue(new Error('503'))
    render(await CartaDeServicosPage())
    expect(
      screen.getByText(/Não foi possível carregar a lista de órgãos/)
    ).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(within(main).queryByRole('list')).not.toBeInTheDocument()
  })

  it('lista vazia tem estado próprio', async () => {
    fetchCartaOrgUnits.mockResolvedValue([])
    render(await CartaDeServicosPage())
    expect(
      screen.getByText('Nenhum órgão com serviço publicado no momento.')
    ).toBeInTheDocument()
  })
})

describe('/carta-de-servicos/[siciCode]', () => {
  const services = [
    {
      name: 'Alteração do sentido de vias',
      slug: 'alteracao',
      themeSlug: 'transito',
    },
    { name: 'Serviço sem tema', slug: 'sem-tema' },
  ]

  it('mostra o órgão, o botão que abre a carta e os serviços com link', async () => {
    fetchCartaOrgUnit.mockResolvedValue(CET)
    fetchCartaOrgUnitServices.mockResolvedValue(services)

    const { container } = render(
      await CartaDeServicosOrgaoPage(orgParams('2951'))
    )

    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Companhia de Engenharia de Tráfego do Rio de Janeiro - CET-RIO'
    )
    const carta = screen.getByRole('link', {
      name: /^Visualizar Carta de Serviços/,
    })
    expect(carta).toHaveAttribute('href', '/api/carta-de-servicos/2951/pdf')
    expect(carta).toHaveAttribute('target', '_blank')
    expect(carta.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Serviços relacionados' })
    ).toBeVisible()

    const list = screen.getByRole('list')
    const serviceLink = within(list).getByRole('link', {
      name: 'Alteração do sentido de vias',
    })
    expect(serviceLink).toHaveAttribute(
      'href',
      '/servicos/categoria/transito/alteracao'
    )
    // Sem themeSlug não há rota de serviço: aparece sem link.
    expect(within(list).getByText('Serviço sem tema').closest('a')).toBeNull()
  })

  it('com Salesforce desligado, serviços aparecem sem link (evita 404)', async () => {
    flags.salesforce = false
    fetchCartaOrgUnit.mockResolvedValue(CET)
    fetchCartaOrgUnitServices.mockResolvedValue(services)

    render(await CartaDeServicosOrgaoPage(orgParams('2951')))

    const list = screen.getByRole('list')
    expect(within(list).queryAllByRole('link')).toHaveLength(0)
    expect(
      within(list).getByText('Alteração do sentido de vias')
    ).toBeInTheDocument()
  })

  it('404 para órgão inexistente e para código inválido', async () => {
    fetchCartaOrgUnit.mockResolvedValue(null)
    await expect(CartaDeServicosOrgaoPage(orgParams('9999'))).rejects.toBe(
      notFoundError
    )

    fetchCartaOrgUnit.mockReset()
    await expect(CartaDeServicosOrgaoPage(orgParams('../admin'))).rejects.toBe(
      notFoundError
    )
    expect(fetchCartaOrgUnit).not.toHaveBeenCalled()
  })
})
