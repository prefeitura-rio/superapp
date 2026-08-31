import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { ImoveisLista, ImoveisVazio } from '../imoveis-lista'

vi.mock('@/actions/divida-ativa/excluir-imovel', () => ({
  excluirImovel: vi.fn().mockResolvedValue({ success: true, data: null }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

// Fixtures na forma que a API real devolve: id local presente, e proprietário, bairro e
// indicador de débito ausentes (premissas P19, P22 e P12 em `docs/divida-ativa.md`).
const IMOVEIS: ImovelDividaAtiva[] = [
  {
    id: 32,
    inscricao: '06666929',
    endereco: 'Rua Lucio de Mendonca, 27 - Apto 101',
    nome: null,
    bairro: null,
    proprietario: null,
    possuiDebitos: null,
    cadastradoEm: '2026-08-04',
  },
  {
    id: 33,
    inscricao: '05217663',
    endereco: 'Rua Barata Ribeiro, 586 - A 501',
    nome: null,
    bairro: null,
    proprietario: null,
    possuiDebitos: null,
    cadastradoEm: '2026-08-05',
  },
]

describe('ImoveisLista', () => {
  test('mostra endereço e inscrição mascarada de cada imóvel', () => {
    render(<ImoveisLista imoveis={IMOVEIS} />)

    expect(
      screen.getByText('Rua Lucio de Mendonca, 27 - Apto 101')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Rua Barata Ribeiro, 586 - A 501')
    ).toBeInTheDocument()

    // A inscrição é guardada só com dígitos e mascarada na exibição.
    expect(screen.getByText('0.666.692-9')).toBeInTheDocument()
    expect(screen.getByText('0.521.766-3')).toBeInTheDocument()

    expect(screen.getAllByText('Inscrição imobiliária')).toHaveLength(2)
    expect(screen.getAllByText('Endereço')).toHaveLength(2)
  })

  /**
   * O nome dado pelo cidadão vira o título do card — hoje só aparece quando a API passar
   * a devolvê-lo (premissa P23); a fixture antecipa esse dia.
   */
  test('mostra o nome do imóvel como título do card quando existir', () => {
    render(<ImoveisLista imoveis={[{ ...IMOVEIS[0], nome: 'Casa Família' }]} />)

    expect(
      screen.getByRole('heading', { name: 'Casa Família' })
    ).toBeInTheDocument()
    // A exclusão também passa a se referir ao nome, que é como o cidadão pensa no imóvel.
    expect(
      screen.getByRole('button', { name: 'Excluir imóvel Casa Família' })
    ).toBeInTheDocument()
  })

  /**
   * A API não devolve proprietário hoje (P19). A linha some em vez de aparecer vazia — se
   * este teste passar a falhar, é porque a premissa foi resolvida e o Figma volta a ter
   * a linha, não porque o componente quebrou.
   */
  test('não mostra a linha de proprietário enquanto a API não devolve o nome', () => {
    render(<ImoveisLista imoveis={IMOVEIS} />)

    expect(screen.queryByText('Proprietário')).not.toBeInTheDocument()
  })

  test('mostra proprietário e bairro se a API passar a devolvê-los', () => {
    render(
      <ImoveisLista
        imoveis={[
          {
            ...IMOVEIS[0],
            nome: null,
            bairro: 'Maracanã',
            proprietario: 'Fernanda Galvão Assis',
          },
        ]}
      />
    )

    expect(screen.getByText('Maracanã')).toBeInTheDocument()
    expect(screen.getByText('Fernanda Galvão Assis')).toBeInTheDocument()
    expect(screen.getByText('Proprietário')).toBeInTheDocument()
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

  /**
   * A exclusão precisa do id local; sem ele a API não tem como identificar o registro.
   * Melhor não oferecer a ação do que oferecer uma que falha sempre.
   */
  test('um imóvel sem id local não oferece exclusão', () => {
    render(<ImoveisLista imoveis={[{ ...IMOVEIS[0], id: null }]} />)

    expect(
      screen.queryByRole('button', { name: /Excluir imóvel/ })
    ).not.toBeInTheDocument()
  })

  /**
   * O estado vazio é um componente próprio (renderizado pela rota no lugar da lista):
   * a mensagem assume o papel de título da página e o CTA leva ao cadastro.
   */
  test('sem imóveis, informa que nada foi encontrado e chama para o cadastro', () => {
    render(<ImoveisVazio />)

    expect(
      screen.getByRole('heading', {
        name: 'Não encontramos nenhum imóvel cadastrado no seu CPF',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Adicionar imóvel' })
    ).toHaveAttribute('href', '/divida-ativa/imoveis/novo')
  })

  test('um imóvel sem endereço ainda é identificável pela inscrição', () => {
    render(
      <ImoveisLista
        imoveis={[
          {
            id: 34,
            inscricao: '05217663',
            endereco: null,
            nome: null,
            bairro: null,
            proprietario: null,
            possuiDebitos: null,
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
