import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { ModoConsultaList } from '../modo-consulta-list'

describe('ModoConsultaList', () => {
  /**
   * Os três identificadores do Figma, na ordem do desenho. Não são sinônimos: inscrição
   * identifica o imóvel, CDA identifica uma dívida, execução fiscal identifica um processo.
   */
  test('oferece os três modos de busca, na ordem do desenho', () => {
    render(<ModoConsultaList />)

    const itens = screen.getAllByRole('link')

    expect(itens.map(item => item.textContent)).toEqual([
      'N° da Inscrição Imobiliária',
      'N° da Certidão de Dívida Ativa',
      'N° da Execução Fiscal',
    ])
  })

  /**
   * O modo vira `?modo=` na mesma rota, e não uma rota por modo: são dois estados da mesma
   * tela, o voltar do navegador funciona sozinho e o endereço fica compartilhável.
   */
  test('cada modo aponta para a própria rota com o modo na query', () => {
    render(<ModoConsultaList />)

    expect(
      screen.getByRole('link', { name: 'N° da Inscrição Imobiliária' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento?modo=inscricao')

    expect(
      screen.getByRole('link', { name: 'N° da Certidão de Dívida Ativa' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento?modo=cda')

    expect(
      screen.getByRole('link', { name: 'N° da Execução Fiscal' })
    ).toHaveAttribute('href', '/divida-ativa/parcelamento?modo=execucao-fiscal')
  })
})
