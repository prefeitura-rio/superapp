import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import type { RequerimentoDividaAtiva } from '@/types/divida-ativa'
import { RequerimentoCard } from '../requerimento-card'

const REQUERIMENTO: RequerimentoDividaAtiva = {
  protocolo: '1',
  ano: '2020',
  contribuinte: 'MAC Laren Estaleiros e Serviços Marítimos SA',
  abertoEm: '2020-03-13',
  previsaoRetornoEm: '2020-06-29',
  respondidoEm: '2020-06-15',
  situacaoId: '3',
  situacao: 'Rejeitado por documentação',
  motivoRejeicao:
    'Foi criado só para testar se o serviços funciona corretamente',
  guiaPagamentoId: null,
  urlComprovante: null,
}

describe('RequerimentoCard', () => {
  test('mostra os dados do requerimento como no Figma', () => {
    render(
      <RequerimentoCard requerimento={REQUERIMENTO} destaque="protocolo" />
    )

    expect(screen.getByText('000000001/2020')).toBeInTheDocument()
    expect(
      screen.getByText('MAC Laren Estaleiros e Serviços Marítimos SA')
    ).toBeInTheDocument()
    expect(screen.getByText('13 MAR 2020')).toBeInTheDocument()
    expect(screen.getByText('29 JUN 2020')).toBeInTheDocument()
    expect(screen.getByText('15 JUN 2020')).toBeInTheDocument()
    expect(screen.getByText('Rejeitado por documentação')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Foi criado só para testar se o serviços funciona corretamente'
      )
    ).toBeInTheDocument()
  })

  test('na lista do CPF o contribuinte abre o card; por protocolo, o protocolo', () => {
    const { rerender } = render(
      <RequerimentoCard requerimento={REQUERIMENTO} destaque="contribuinte" />
    )
    expect(screen.getByText('Contribuinte').nextSibling).toHaveTextContent(
      'MAC Laren Estaleiros e Serviços Marítimos SA'
    )

    rerender(
      <RequerimentoCard requerimento={REQUERIMENTO} destaque="protocolo" />
    )
    expect(screen.getByText('N° de protocolo').nextSibling).toHaveTextContent(
      '000000001/2020'
    )
  })

  test('sem o texto da situação, mostra o id do DAM; linha sem valor some', () => {
    render(
      <RequerimentoCard
        requerimento={{
          ...REQUERIMENTO,
          situacao: null,
          respondidoEm: null,
          motivoRejeicao: null,
        }}
        destaque="protocolo"
      />
    )

    expect(screen.getByText('Andamento').nextSibling).toHaveTextContent('3')
    expect(screen.queryByText('Data da resposta')).not.toBeInTheDocument()
    expect(screen.queryByText('Descrição')).not.toBeInTheDocument()
  })
})
