import type { ResultadoSimulacao } from '@/types/divida-ativa'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { SelecaoParcelas } from '../selecao-parcelas'

const push = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => searchParams,
}))

beforeEach(() => {
  push.mockClear()
  searchParams = new URLSearchParams()
})

/** Números da simulação real de homologação (CDA 01/140646/2026-00, 06/10/2026). */
type Opcoes = Extract<ResultadoSimulacao, { situacao: 'ok' }>['opcoes']

const OPCOES: Opcoes = [
  {
    qtdeParcelas: 1,
    valor1aParcela: 1696.56,
    valorJuros: 0,
    valorDescontos: null,
  },
  {
    qtdeParcelas: 2,
    valor1aParcela: 848.29,
    valorJuros: 8.48,
    valorDescontos: null,
  },
  {
    qtdeParcelas: 3,
    valor1aParcela: 565.52,
    valorJuros: 16.97,
    valorDescontos: null,
  },
]

const PARAMS = { cda: '01/140646/2026-00', cdas: '01/140646/2026-00' }

function renderizar(opcoes = OPCOES) {
  return render(
    <SelecaoParcelas
      opcoes={opcoes}
      valorTotalAvista={1696.61}
      searchParamsAtual={{ ...PARAMS, data: '15/10/2026' }}
    />
  )
}

describe('SelecaoParcelas', () => {
  test('1x é "Valor à vista"; as demais, "Valor da 1ª parcela", cada uma com os juros totais', () => {
    renderizar()

    expect(screen.getByText('Valor à vista')).toBeInTheDocument()
    expect(screen.getAllByText('Valor da 1ª parcela')).toHaveLength(2)
    expect(screen.getAllByText('Juros totais')).toHaveLength(3)

    expect(screen.getByText('R$1.696,56')).toBeInTheDocument()
    expect(screen.getByText('R$848,29')).toBeInTheDocument()
    expect(screen.getByText('R$8,48')).toBeInTheDocument()
    expect(screen.getByText('R$16,97')).toBeInTheDocument()
  })

  test('sem escolha, o total é R$0,00 e o "Continuar" fica desabilitado', () => {
    renderizar()

    expect(
      screen.getByText('R$0,00', { selector: '.text-xl' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  /** Total = saldo à vista da simulação + juros da opção (decisão de 06/10/2026). */
  test('escolher uma opção mostra o total com os juros dela', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('radio', { name: /3x/ }))

    expect(screen.getByText('R$1.713,58')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  test('"Continuar" leva ao requerimento com ?parcelas= e mantém data e CDAs', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('radio', { name: /2x/ }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const destino = new URL(push.mock.calls[0][0], 'http://x')
    expect(destino.pathname).toBe('/divida-ativa/parcelamento/requerimento')
    expect(destino.searchParams.get('parcelas')).toBe('2')
    expect(destino.searchParams.get('data')).toBe('15/10/2026')
    expect(destino.searchParams.get('cdas')).toBe('01/140646/2026-00')
  })

  test('desconto só aparece quando o DAM concede algum', () => {
    renderizar([{ ...OPCOES[0], valorDescontos: 100 }, OPCOES[1]])

    expect(screen.getAllByText('Desconto')).toHaveLength(1)
    expect(screen.getByText('R$100,00')).toBeInTheDocument()
  })

  describe('com as 84 opções do DAM', () => {
    /** 1x a 84x, com valores que dá para conferir de cabeça: juros = N reais. */
    const TODAS: Opcoes = Array.from({ length: 84 }, (_, i) => ({
      qtdeParcelas: i + 1,
      valor1aParcela: 1000 / (i + 1),
      valorJuros: i + 1,
      valorDescontos: null,
    }))

    const listadas = () =>
      screen
        .getAllByRole('radio')
        .map(radio => (radio as HTMLInputElement).value)

    test('lista só as quantidades padrão e oferece o campo para as demais', () => {
      renderizar(TODAS)

      expect(listadas()).toEqual([
        '1',
        '2',
        '3',
        '6',
        '10',
        '12',
        '24',
        '36',
        '48',
        '60',
        '72',
        '84',
      ])
      expect(
        screen.getByRole('textbox', {
          name: /Outra quantidade de parcelas, de 1 a 84/,
        })
      ).toBeInTheDocument()
    })

    test('lista só as padrão que a simulação oferece, e sem campo quando não há outras', () => {
      renderizar(TODAS.slice(0, 3))

      expect(listadas()).toEqual(['1', '2', '3'])
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    test('digitar uma quantidade válida mostra os valores no card e a seleciona', async () => {
      const user = userEvent.setup()
      renderizar(TODAS)

      await user.type(screen.getByRole('textbox'), '37')

      expect(screen.getByText('R$27,03')).toBeInTheDocument()
      expect(screen.getByText('R$37,00')).toBeInTheDocument()
      // Total = 1.696,61 + 37,00.
      expect(screen.getByText('R$1.733,61')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()

      await user.click(screen.getByRole('button', { name: 'Continuar' }))
      const destino = new URL(push.mock.calls[0][0], 'http://x')
      expect(destino.searchParams.get('parcelas')).toBe('37')
    })

    test('quantidade fora do intervalo avisa e não habilita o "Continuar"', async () => {
      const user = userEvent.setup()
      renderizar(TODAS.slice(0, 50))

      await user.type(screen.getByRole('textbox'), '70')

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Escolha entre 1 e 50 parcelas.'
      )
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })

    test('escolher na lista depois de digitar troca a seleção para a lista', async () => {
      const user = userEvent.setup()
      renderizar(TODAS)

      await user.type(screen.getByRole('textbox'), '37')
      await user.click(screen.getByRole('radio', { name: /12x/ }))

      expect(screen.getByRole('radio', { name: /12x/ })).toBeChecked()
      // Total = 1.696,61 + 12,00.
      expect(screen.getByText('R$1.708,61')).toBeInTheDocument()
    })

    test('apagar o número digitado desfaz a escolha', async () => {
      const user = userEvent.setup()
      renderizar(TODAS)

      await user.type(screen.getByRole('textbox'), '37')
      await user.clear(screen.getByRole('textbox'))

      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })

    test('?parcelas= fora da lista padrão volta preenchido no campo', () => {
      searchParams = new URLSearchParams('parcelas=37')
      renderizar(TODAS)

      expect(screen.getByRole('textbox')).toHaveValue('37')
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
    })
  })
})
