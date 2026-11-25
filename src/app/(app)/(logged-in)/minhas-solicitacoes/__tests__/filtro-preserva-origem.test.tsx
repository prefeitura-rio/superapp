import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: { current: '' },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(searchParams.current),
  usePathname: () => '/minhas-solicitacoes',
}))

import { type RequestItem, RequestsList } from '../components/requests-list'

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
]

beforeEach(() => replace.mockClear())

describe('RequestsList: trocar a aba de filtro preserva ?o=', () => {
  it('mantém o=1 ao escolher uma aba', () => {
    searchParams.current = 'o=1'
    render(<RequestsList items={ITEMS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ouvidoria' }))
    expect(replace).toHaveBeenCalledWith(
      '/minhas-solicitacoes?o=1&filtro=ouvidoria',
      { scroll: false }
    )
  })

  it('voltar para Todos remove só o filtro', () => {
    searchParams.current = 'o=1&filtro=ouvidoria'
    render(<RequestsList items={ITEMS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(replace).toHaveBeenCalledWith('/minhas-solicitacoes?o=1', {
      scroll: false,
    })
  })

  it('sem outros params, mantém o comportamento anterior', () => {
    searchParams.current = ''
    render(<RequestsList items={ITEMS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ouvidoria' }))
    expect(replace).toHaveBeenCalledWith(
      '/minhas-solicitacoes?filtro=ouvidoria',
      { scroll: false }
    )
  })
})
