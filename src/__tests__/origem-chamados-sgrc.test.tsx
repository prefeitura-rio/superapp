import { OrigemChamados } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/origem-chamados'
import type { RequestItem } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/requests-list'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const SALESFORCE: RequestItem[] = [
  {
    protocolo: 'RIO-2026-00000001',
    codigoOs: '00000001',
    servico: 'Reparo de iluminação pública',
    categoria: 'Serviços',
    status: 'Aberto',
    dataAbertura: '01/06/2026',
    isAcessoInformacao: false,
  },
]

describe('DEV-568: filtro de data em Minhas Solicitações', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          protocolos: [
            {
              protocolo: 'SGRC-2026-00000001',
              ordens_de_servico: [
                {
                  codigoOs: '00000001',
                  servico: 'Chamado histórico',
                  status: 'Encerrado',
                  dataAbertura: '20/11/2026',
                },
              ],
            },
          ],
        }),
      })
    )
  })

  test('sem histórico SGRC disponível, o seletor não aparece', () => {
    render(<OrigemChamados salesforce={SALESFORCE} historicoSgrc={false} />)

    expect(
      screen.queryByRole('button', { name: 'Data de abertura' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Reparo de iluminação pública')).toBeInTheDocument()
  })

  test('com histórico SGRC disponível, somente o seletor de data aparece', async () => {
    render(<OrigemChamados salesforce={SALESFORCE} historicoSgrc />)

    expect(
      screen.getByRole('button', { name: 'Data de abertura' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chamados antigos' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chamados recentes' })
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('Chamado histórico')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Data de abertura' }))

    expect(screen.getByText('abertas até 26/11/2026')).toBeInTheDocument()
    expect(
      screen.getByText('abertas a partir de 27/11/2026')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'abertas até 26/11/2026' })
    ).toBeChecked()
  })
})
