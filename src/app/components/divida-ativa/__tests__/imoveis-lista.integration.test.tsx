import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ImoveisLista } from '../imoveis-lista'

vi.mock('@/actions/divida-ativa/excluir-imovel', () => ({
  excluirImovel: vi.fn().mockResolvedValue({ success: true, data: null }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

const IMOVEIS: ImovelDividaAtiva[] = [
  {
    inscricao: '06666929',
    endereco: 'Rua Lucio de Mendonca, 27 - Apto 101',
    bairro: 'Maracanã',
    proprietario: 'Fernanda Galvão Assis',
    possuiDebitos: true,
    cadastradoEm: '2026-08-04',
  },
  {
    inscricao: '05217663',
    endereco: 'Rua Barata Ribeiro, 586 - A 501',
    bairro: 'Copacabana',
    proprietario: 'Bruno Rocha Menezes',
    possuiDebitos: false,
    cadastradoEm: '2026-08-05',
  },
]

describe('ImoveisLista', () => {
  test('mostra endereço, bairro, inscrição mascarada e proprietário de cada imóvel', () => {
    render(<ImoveisLista imoveis={IMOVEIS} />)

    expect(
      screen.getByText('Rua Lucio de Mendonca, 27 - Apto 101')
    ).toBeInTheDocument()
    expect(screen.getByText('Maracanã')).toBeInTheDocument()
    expect(screen.getByText('Fernanda Galvão Assis')).toBeInTheDocument()

    // A inscrição é guardada só com dígitos e mascarada na exibição.
    expect(screen.getByText('0.666.692-9')).toBeInTheDocument()
    expect(screen.getByText('0.521.766-3')).toBeInTheDocument()

    expect(screen.getAllByText('Inscrição imobiliária')).toHaveLength(2)
    expect(screen.getAllByText('Proprietário')).toHaveLength(2)
  })

  test('oferece adicionar um novo imóvel ao fim da lista', () => {
    render(<ImoveisLista imoveis={IMOVEIS} />)

    expect(
      screen.getByRole('link', { name: 'Adicionar imóvel' })
    ).toHaveAttribute('href', '/divida-ativa/imoveis/novo')
  })

  test('cada imóvel tem uma ação de exclusão com nome acessível próprio', () => {
    render(<ImoveisLista imoveis={IMOVEIS} />)

    expect(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Lucio de Mendonca, 27 - Apto 101',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Excluir imóvel Rua Barata Ribeiro, 586 - A 501',
      })
    ).toBeInTheDocument()
  })

  test('sem imóveis, explica o serviço e chama para o cadastro', () => {
    render(<ImoveisLista imoveis={[]} />)

    expect(screen.getByText('Nenhum imóvel cadastrado')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Adicionar imóvel' })
    ).toHaveAttribute('href', '/divida-ativa/imoveis/novo')
  })

  test('um imóvel sem endereço ainda é identificável pela inscrição', () => {
    render(
      <ImoveisLista
        imoveis={[
          {
            inscricao: '05217663',
            endereco: null,
            bairro: null,
            proprietario: null,
            possuiDebitos: false,
            cadastradoEm: null,
          },
        ]}
      />
    )

    expect(screen.getByText('0.521.766-3')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Excluir imóvel 0.521.766-3' })
    ).toBeInTheDocument()
  })
})
