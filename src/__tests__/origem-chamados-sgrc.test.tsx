import { OrigemChamados } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/origem-chamados'
import type { RequestItem } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/requests-list'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

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

describe('DEV-568: aba "Chamados antigos" em Minhas Solicitações', () => {
  test('sem histórico SGRC disponível, a aba não aparece e os chamados recentes são listados', () => {
    render(<OrigemChamados salesforce={SALESFORCE} historicoSgrc={false} />)

    expect(
      screen.queryByRole('button', { name: 'Chamados antigos' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chamados recentes' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Reparo de iluminação pública')).toBeInTheDocument()
  })

  test('com o histórico SGRC disponível (modo mock), as duas abas aparecem', () => {
    render(<OrigemChamados salesforce={SALESFORCE} historicoSgrc />)

    expect(
      screen.getByRole('button', { name: 'Chamados antigos' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Chamados recentes' })
    ).toBeInTheDocument()
  })
})
