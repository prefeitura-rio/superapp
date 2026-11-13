import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type RequestItem, RequestsList } from '../components/requests-list'
import { filterTabFromParam } from '../helpers'

const ITEMS: RequestItem[] = [
  {
    protocolo: '1',
    codigoOs: 'a',
    servico: 'Remoção de entulho',
    categoria: 'Serviços',
    status: 'Aberto',
    dataAbertura: '01/11/2026',
    isAcessoInformacao: false,
  },
  {
    protocolo: '2',
    codigoOs: 'b',
    servico: 'Reclamação de atendimento',
    categoria: 'Ouvidoria',
    status: 'Aberto',
    dataAbertura: '02/11/2026',
    isAcessoInformacao: false,
  },
  {
    protocolo: '3',
    codigoOs: 'c',
    servico: 'Pedido de dados de obras',
    categoria: 'Serviços',
    status: 'Aberto',
    dataAbertura: '03/11/2026',
    isAcessoInformacao: true,
  },
]

describe('filterTabFromParam', () => {
  it.each([
    ['ouvidoria', 'Ouvidoria'],
    ['acesso-a-informacao', 'Acesso à informação'],
    ['servicos', 'Serviços'],
    [['ouvidoria', 'servicos'], 'Ouvidoria'],
    ['toString', undefined],
    ['qualquer', undefined],
    [undefined, undefined],
  ])('?filtro=%j abre a aba %s', (param, tab) => {
    expect(filterTabFromParam(param)).toBe(tab)
  })
})

describe('RequestsList — aba inicial vinda do menu global', () => {
  it('sem filtro abre em Todos', () => {
    render(<RequestsList items={ITEMS} />)

    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
  })

  it('Ouvidoria (menu logado) abre só os chamados de Ouvidoria', () => {
    render(<RequestsList items={ITEMS} filtroInicial="Ouvidoria" />)

    expect(screen.getByText('Reclamação de atendimento')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Pedido de dados de obras')
    ).not.toBeInTheDocument()
  })

  it('Lei de Acesso à Informação (menu logado) abre só os pedidos de LAI', () => {
    render(<RequestsList items={ITEMS} filtroInicial="Acesso à informação" />)

    expect(screen.getByText('Pedido de dados de obras')).toBeInTheDocument()
    expect(screen.queryByText('Remoção de entulho')).not.toBeInTheDocument()
  })

  it('aba que não existe na origem (chamados antigos só têm Todos) cai em Todos', () => {
    render(
      <RequestsList
        items={ITEMS}
        filtros={['Todos']}
        filtroInicial="Ouvidoria"
      />
    )

    expect(screen.getByText('Remoção de entulho')).toBeInTheDocument()
  })
})
