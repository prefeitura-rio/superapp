import type { ImovelDividaAtiva } from '@/types/divida-ativa'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { ConfirmarImovel } from '../confirmar-imovel'

// O componente continua sabendo exibir bairro e proprietário, então a fixture mantém os
// dois para cobrir esse caminho. A API real não os devolve hoje (P22 e P19) — o que a
// lista faz sem eles está coberto em `imoveis-lista.integration.test.tsx`.
const IMOVEL: ImovelDividaAtiva = {
  id: 32,
  inscricao: '05217663',
  endereco: 'Rua Barata Ribeiro, 586 - A 501',
  nome: null,
  bairro: 'Copacabana',
  proprietario: 'Bruno Rocha Menezes',
  possuiDebitos: null,
  cadastradoEm: null,
}

const CONTINUAR_HREF = '/divida-ativa/imoveis/novo/nome?inscricao=05217663'

describe('ConfirmarImovel', () => {
  test('mostra o que a consulta trouxe para o cidadão conferir', () => {
    render(<ConfirmarImovel imovel={IMOVEL} continuarHref={CONTINUAR_HREF} />)

    expect(
      screen.getByRole('heading', {
        name: 'Confirme sua inscrição imobiliária',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Rua Barata Ribeiro, 586 - A 501')
    ).toBeInTheDocument()
    expect(screen.getByText('Endereço')).toBeInTheDocument()
    expect(screen.getByText('Copacabana')).toBeInTheDocument()
    expect(screen.getByText('0.521.766-3')).toBeInTheDocument()
    expect(screen.getByText('Bruno Rocha Menezes')).toBeInTheDocument()
  })

  /**
   * Nada é gravado aqui: o "Continuar" é navegação para o passo do nome, que é quem
   * dispara a Server Action. A ordem é decisão de produto (19/08/2026).
   */
  test('continuar leva ao passo do nome carregando a inscrição', () => {
    render(<ConfirmarImovel imovel={IMOVEL} continuarHref={CONTINUAR_HREF} />)

    expect(screen.getByRole('link', { name: 'Continuar' })).toHaveAttribute(
      'href',
      CONTINUAR_HREF
    )
  })
})
