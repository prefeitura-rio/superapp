import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DebitosSelecao } from '../debitos-selecao'
import { DebitosVazio } from '../debitos-vazio'

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

/**
 * Fixtures na forma que o mapper entrega: situação em caixa alta e como texto livre do DAM
 * (o enum do front morreu na reconciliação do contrato), principal e honorários separados
 * pela decisão D5, e nenhum total em reais — `totalDebitos` é contagem (premissa P13).
 */
const CDA_2024: DebitoDividaAtiva = {
  numeroCda: '01/137861/2025-00',
  exercicio: 2024,
  natureza: 'IPTU',
  receita: 'IPTU/Taxas - Predial',
  contribuinte: 'RONALD FREITAS CAMPOS',
  situacaoPrincipal: 'EM ABERTO',
  situacaoHonorarios: 'EM ABERTO',
  faseCobranca: 'AJUIZADA',
  valorPrincipal: 1534.21,
  valorHonorarios: 153.42,
  parcelavel: true,
  protocoloRequerimentoAberto: null,
  inscricao: '00000018',
}

const CDA_2023: DebitoDividaAtiva = {
  ...CDA_2024,
  numeroCda: '01/137861/2024-00',
  exercicio: 2023,
  valorPrincipal: 1765.41,
}

describe('DebitosSelecao', () => {
  test('mostra um card por CDA com número, ano, natureza e valor', () => {
    render(<DebitosSelecao cdas={[CDA_2024, CDA_2023]} />)

    expect(
      screen.getByRole('heading', {
        name: 'Selecione os débitos que deseja pagar',
      })
    ).toBeInTheDocument()

    expect(screen.getByText('01/137861/2025-00')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('R$1.534,21')).toBeInTheDocument()

    expect(screen.getByText('01/137861/2024-00')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('R$1.765,41')).toBeInTheDocument()

    expect(screen.getAllByText('IPTU/Taxas - Predial')).toHaveLength(2)
  })

  test('"Continuar" fica desabilitado enquanto nada estiver selecionado', () => {
    render(<DebitosSelecao cdas={[CDA_2024]} />)

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  })

  test('marcar uma CDA habilita o "Continuar"', async () => {
    const user = userEvent.setup()
    render(<DebitosSelecao cdas={[CDA_2024]} />)

    await user.click(
      screen.getByRole('checkbox', { name: /01\/137861\/2025-00/ })
    )

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  /**
   * O valor dos honorários só aparece no drawer do "Ver mais" — mas aparece **separado** do
   * principal, nunca somado (decisão D5). Este teste falha se alguém juntar os dois num total.
   */
  test('"Ver mais" abre um drawer com honorários, contribuinte, inscrição e situações', async () => {
    const user = userEvent.setup()
    render(<DebitosSelecao cdas={[CDA_2024]} />)

    expect(screen.queryByText('R$153,42')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('R$153,42')).toBeInTheDocument()
    expect(
      within(drawer).getByText('RONALD FREITAS CAMPOS')
    ).toBeInTheDocument()
    expect(within(drawer).getByText('0.000.001-8')).toBeInTheDocument()
    expect(within(drawer).getByText('AJUIZADA')).toBeInTheDocument()
    expect(within(drawer).getAllByText('EM ABERTO')).toHaveLength(2)

    // E o principal continua em reais próprios, não absorvido por um total.
    expect(within(drawer).getByText('R$1.534,21')).toBeInTheDocument()
  })

  /** O Figma trocou a expansão pelo drawer: o card não cresce, e o detalhe não vive nele. */
  test('"Ver mais" não expande o card', async () => {
    const user = userEvent.setup()
    render(<DebitosSelecao cdas={[CDA_2024]} />)

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))
    await screen.findByRole('dialog')

    expect(
      screen.queryByRole('button', { name: 'Ver menos', hidden: true })
    ).not.toBeInTheDocument()
    expect(
      within(screen.getByRole('article', { hidden: true })).queryByText(
        'R$153,42'
      )
    ).not.toBeInTheDocument()
  })

  test('fechar o drawer com Esc esconde os detalhes', async () => {
    const user = userEvent.setup()
    render(<DebitosSelecao cdas={[CDA_2024]} />)

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  /**
   * Decisão D9: `parcelavel` diz **se pode**. Quem não pode não entra na seleção — oferecer
   * o checkbox levaria o cidadão a uma simulação que a API recusa.
   */
  test('CDA não parcelável não pode ser selecionada, e a tela diz por quê', () => {
    render(<DebitosSelecao cdas={[{ ...CDA_2024, parcelavel: false }]} />)

    expect(
      screen.getByRole('checkbox', { name: /01\/137861\/2025-00/ })
    ).toBeDisabled()
    expect(
      screen.getByText('Esta certidão não está disponível para parcelamento.')
    ).toBeInTheDocument()
  })

  /**
   * Decisão D9, o outro lado: protocolo aberto **informa e dá caminho**, nunca bloqueia. Um
   * não se deriva do outro, e o mock MSW tem de propósito uma CDA selecionável e com
   * protocolo aberto — é exatamente este caso.
   */
  test('protocolo de requerimento aberto informa sem bloquear a seleção', async () => {
    const user = userEvent.setup()
    render(
      <DebitosSelecao
        cdas={[{ ...CDA_2024, protocoloRequerimentoAberto: '2026000123' }]}
      />
    )

    const checkbox = screen.getByRole('checkbox', {
      name: /01\/137861\/2025-00/,
    })
    expect(checkbox).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Ver mais' }))

    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText(/2026000123/)).toBeInTheDocument()
    expect(
      within(drawer).getByRole('link', { name: 'Acompanhar requerimento' })
    ).toHaveAttribute('href', '/divida-ativa/acompanhamento')
  })

  test('"Continuar" leva à simulação com as CDAs escolhidas na URL', async () => {
    const user = userEvent.setup()
    searchParams = new URLSearchParams('inscricao=05217663')
    render(<DebitosSelecao cdas={[CDA_2024, CDA_2023]} />)

    await user.click(
      screen.getByRole('checkbox', { name: /01\/137861\/2025-00/ })
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(push).toHaveBeenCalledTimes(1)

    const destino = new URL(push.mock.calls[0][0], 'https://pref.rio')
    expect(destino.pathname).toBe('/divida-ativa/parcelamento/simulacao')
    // O critério da consulta viaja junto: a tela seguinte precisa dele para simular.
    expect(destino.searchParams.get('inscricao')).toBe('05217663')
    expect(destino.searchParams.get('cdas')).toBe('01/137861/2025-00')
  })

  test('várias CDAs viajam separadas por vírgula, na ordem da lista', async () => {
    const user = userEvent.setup()
    render(<DebitosSelecao cdas={[CDA_2024, CDA_2023]} />)

    // Clicadas fora de ordem de propósito: a URL segue a lista, não o clique.
    await user.click(
      screen.getByRole('checkbox', { name: /01\/137861\/2024-00/ })
    )
    await user.click(
      screen.getByRole('checkbox', { name: /01\/137861\/2025-00/ })
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const destino = new URL(push.mock.calls[0][0], 'https://pref.rio')
    expect(destino.searchParams.get('cdas')).toBe(
      '01/137861/2025-00,01/137861/2024-00'
    )
  })

  /**
   * Voltar da simulação tem de reencontrar o que já estava marcado. A seleção não é escrita
   * na URL a cada clique de propósito — esta consulta custa ~16 s, e um `router.replace` por
   * checkbox refaria a chamada — mas é **lida** dela, então o endereço continua compartilhável.
   */
  test('restaura a seleção que veio na URL', () => {
    searchParams = new URLSearchParams('cdas=01/137861/2024-00')
    render(<DebitosSelecao cdas={[CDA_2024, CDA_2023]} />)

    expect(
      screen.getByRole('checkbox', { name: /01\/137861\/2024-00/ })
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: /01\/137861\/2025-00/ })
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled()
  })

  /** Linha vazia é pior que linha ausente — a regra que o card de imóvel já segue. */
  test('omite as linhas cujo dado a API não devolveu', () => {
    render(
      <DebitosSelecao
        cdas={[
          {
            ...CDA_2024,
            exercicio: null,
            receita: null,
            valorPrincipal: null,
          },
        ]}
      />
    )

    expect(screen.queryByText('Ano')).not.toBeInTheDocument()
    expect(screen.queryByText('Valor')).not.toBeInTheDocument()
    expect(screen.getByText('01/137861/2025-00')).toBeInTheDocument()
  })
})

describe('DebitosVazio', () => {
  test('mostra a mensagem do Figma e os dois caminhos de saída', () => {
    render(<DebitosVazio />)

    expect(
      screen.getByRole('heading', {
        name: 'Não encontramos nenhum débito associado ao número informado',
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Pesquisar novamente' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento')

    expect(
      screen.getByRole('link', { name: 'Ir para tela inicial' })
    ).toHaveAttribute('href', '/')
  })

  /**
   * A API manda um texto institucional próprio quando não há débito. Exibimos o dela, não um
   * nosso — a regra de ouro nº 9 vale também para copy de estado vazio.
   */
  test('exibe a mensagem da API quando ela vem preenchida', () => {
    render(
      <DebitosVazio mensagem="Nao ha debitos inscritos em divida ativa." />
    )

    expect(
      screen.getByText('Nao ha debitos inscritos em divida ativa.')
    ).toBeInTheDocument()
  })
})
