import type { ResultadoRevisaoPagamento } from '@/types/divida-ativa'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { RevisaoPagamento } from '../revisao-pagamento'

const emitirGuiaAvista = vi.fn()
vi.mock('@/actions/divida-ativa/emitir-guia-avista', () => ({
  emitirGuiaAvista: (...args: unknown[]) => emitirGuiaAvista(...args),
}))

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }))

type RevisaoOk = Extract<ResultadoRevisaoPagamento, { situacao: 'ok' }>

const ITEM_2025 = {
  numeroCda: '01/137861/2025-00',
  natureza: 'IPTU/Taxas - Predial',
  contribuinte: 'Deusdete de Oliveira Carvalho',
  saldoPrincipal: 1534.21,
  descontoPrincipal: 0,
  honorarios: 147.65,
  descontoHonorarios: 0,
}

const ITEM_2026 = {
  ...ITEM_2025,
  numeroCda: '01/137861/2026-00',
  saldoPrincipal: 1754.32,
  descontoPrincipal: 87.72,
  honorarios: 175.43,
  descontoHonorarios: 8.77,
}

const REVISAO: RevisaoOk = {
  situacao: 'ok',
  dataVencimento: '20/10/2026',
  valorTotal: 4377.37,
  saldoPrincipalTotal: 3288.53,
  descontoPrincipalTotal: 87.72,
  honorariosTotal: 323.08,
  descontoHonorariosTotal: 8.77,
  itens: [ITEM_2025, ITEM_2026],
  grerjs: [{ execucaoFiscal: '0148951-31.3245.3.19.0001', valor: 757.6 }],
}

const ROTA_CONTINUAR =
  '/divida-ativa/parcelamento/simulacao?cda=01%2F137861%2F2025-00&cdas=01%2F137861%2F2025-00'

function renderizar(revisao: RevisaoOk = REVISAO) {
  return render(
    <RevisaoPagamento
      revisao={revisao}
      cdas={['01/137861/2025-00', '01/137861/2026-00']}
      rotaContinuar={ROTA_CONTINUAR}
    />
  )
}

describe('RevisaoPagamento', () => {
  test('resumo mostra os totais da API, com o saldo principal em destaque', () => {
    renderizar()

    const resumo = screen.getByRole('region', { name: 'Resumo do pagamento' })
    // Em destaque, o total a pagar do DAM — não a soma só do principal (R$3.288,53).
    expect(within(resumo).getByText('R$4.377,37')).toBeInTheDocument()
    expect(within(resumo).queryByText('R$3.288,53')).not.toBeInTheDocument()
    expect(
      within(resumo).getByText('Saldo principal total')
    ).toBeInTheDocument()

    // O valor vem logo depois do rótulo, como no Figma.
    const valorDe = (rotulo: string) =>
      screen.getByText(rotulo).nextElementSibling?.textContent
    expect(valorDe('Desconto principal total')).toBe('R$87,72')
    expect(valorDe('Honorários total')).toBe('R$323,08')
    expect(valorDe('Desconto honorários total')).toBe('R$8,77')
  })

  test('cada CDA tem seu card, com principal e honorários separados', () => {
    renderizar()

    const cards = screen.getAllByRole('listitem')
    const card2026 = cards.find(card =>
      within(card).queryByText('01/137861/2026-00')
    )
    expect(card2026).toBeDefined()

    const card = within(card2026 as HTMLElement)
    expect(card.getByRole('heading', { name: 'IPTU' })).toBeInTheDocument()
    expect(card.getByText('Deusdete de Oliveira Carvalho')).toBeInTheDocument()
    expect(card.getByText('IPTU/Taxas - Predial')).toBeInTheDocument()
    expect(card.getByText('R$1.754,32')).toBeInTheDocument()
    expect(card.getByText('R$175,43')).toBeInTheDocument()
    expect(card.getByText('R$8,77')).toBeInTheDocument()
  })

  test('desconto zero aparece como R$0,00; desconto ausente some', () => {
    renderizar({
      ...REVISAO,
      itens: [{ ...ITEM_2025, descontoHonorarios: null }],
    })

    expect(screen.getByText('Desconto principal')).toBeInTheDocument()
    expect(screen.queryByText('Desconto honorários')).not.toBeInTheDocument()
  })

  test('lista de GRERJ mostra as custas por execução fiscal', () => {
    renderizar()

    expect(
      screen.getByRole('heading', { name: 'Lista de GRERJ' })
    ).toBeVisible()
    expect(screen.getByText('0148951-31.3245.3.19.0001')).toBeInTheDocument()
    expect(screen.getByText('R$757,60')).toBeInTheDocument()
  })

  test('sem execução fiscal, não há card de GRERJ', () => {
    renderizar({ ...REVISAO, grerjs: [] })

    expect(
      screen.queryByRole('heading', { name: 'Lista de GRERJ' })
    ).not.toBeInTheDocument()
  })

  test('"Requerer parcelamento" leva à simulação com a seleção', () => {
    renderizar()

    expect(
      screen.getByRole('link', { name: 'Requerer parcelamento' })
    ).toHaveAttribute('href', ROTA_CONTINUAR)
  })

  describe('"Imprimir Guia a Vista"', () => {
    beforeEach(() => {
      emitirGuiaAvista.mockReset()
      vi.mocked(toast.error).mockReset()
    })

    test('emite com as CDAs e a data da revisão e vira o link do PDF', async () => {
      const user = userEvent.setup()
      const abrir = vi.spyOn(window, 'open')
      emitirGuiaAvista.mockResolvedValue({
        success: true,
        data: { urlPdf: 'https://daminternet.rio.rj.gov.br/guia.pdf' },
      })
      renderizar()

      await user.click(
        screen.getByRole('button', { name: 'Imprimir Guia a Vista' })
      )

      expect(emitirGuiaAvista).toHaveBeenCalledWith(
        ['01/137861/2025-00', '01/137861/2026-00'],
        '20/10/2026'
      )
      const link = await screen.findByRole('link', { name: 'Abrir guia (PDF)' })
      expect(link).toHaveAttribute(
        'href',
        'https://daminternet.rio.rj.gov.br/guia.pdf'
      )
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      // Nenhuma aba aberta por script: era ela que ficava em branco quando algo falhava.
      expect(abrir).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('button', { name: 'Imprimir Guia a Vista' })
      ).not.toBeInTheDocument()
    })

    test('PDF fora do domínio da Prefeitura não vira link', async () => {
      const user = userEvent.setup()
      emitirGuiaAvista.mockResolvedValue({
        success: true,
        data: { urlPdf: 'https://exemplo.com/guia.pdf' },
      })
      renderizar()

      await user.click(
        screen.getByRole('button', { name: 'Imprimir Guia a Vista' })
      )

      await vi.waitFor(() => expect(toast.error).toHaveBeenCalled())
      expect(
        screen.queryByRole('link', { name: 'Abrir guia (PDF)' })
      ).not.toBeInTheDocument()
    })

    test('falha mostra a mensagem da API e mantém o botão para tentar de novo', async () => {
      const user = userEvent.setup()
      emitirGuiaAvista.mockResolvedValue({
        success: false,
        error: 'Data de vencimento inválida.',
        status: 400,
      })
      renderizar()

      await user.click(
        screen.getByRole('button', { name: 'Imprimir Guia a Vista' })
      )

      await vi.waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Data de vencimento inválida.')
      )
      await vi.waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'Imprimir Guia a Vista' })
        ).toBeEnabled()
      )
    })

    test('o botão trava enquanto emite: cada emissão cria uma guia no DAM', async () => {
      const user = userEvent.setup()
      emitirGuiaAvista.mockReturnValue(new Promise(() => {}))
      renderizar()

      const botao = screen.getByRole('button', {
        name: 'Imprimir Guia a Vista',
      })
      await user.click(botao)

      await vi.waitFor(() => expect(botao).toBeDisabled())
      await user.click(botao)
      expect(emitirGuiaAvista).toHaveBeenCalledTimes(1)
    })
  })
})
