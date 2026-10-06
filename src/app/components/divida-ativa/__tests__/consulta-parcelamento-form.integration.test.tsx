import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConsultaParcelamentoForm } from '../consulta-parcelamento-form'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back: vi.fn() }),
}))

describe('ConsultaParcelamentoForm', () => {
  beforeEach(() => {
    push.mockClear()
  })

  describe('modo inscrição imobiliária', () => {
    test('aplica a máscara da inscrição e leva só os dígitos para a URL', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="inscricao" />)

      const campo = screen.getByLabelText('N° da Inscrição Imobiliária')
      await user.type(campo, '05217663')

      expect(campo).toHaveValue('0.521.766-3')

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      // A máscara é exibição; o que trafega são dígitos.
      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?inscricao=05217663'
      )
    })

    test('recusa inscrição curta demais sem chamar a navegação', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="inscricao" />)

      await user.type(
        screen.getByLabelText('N° da Inscrição Imobiliária'),
        '52'
      )
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(
        screen.getByText('A inscrição imobiliária tem 7 ou 8 números.')
      ).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })

  describe('modo CDA', () => {
    test('aceita a CDA sem o sufixo', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="cda" />)

      await user.type(
        screen.getByLabelText('N° da Certidão de Dívida Ativa'),
        '010215802003'
      )
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?cda=010215802003'
      )
    })

    test('aplica a máscara da carta da PGM e leva só os dígitos', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="cda" />)

      const campo = screen.getByLabelText('N° da Certidão de Dívida Ativa')
      await user.type(campo, '01021580200300')

      expect(campo).toHaveValue('01/021580/2003-00')

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?cda=01021580200300'
      )
    })

    test('aceita o número colado já pontuado', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="cda" />)

      const campo = screen.getByLabelText('N° da Certidão de Dívida Ativa')
      await user.click(campo)
      await user.paste('01/021580/2003-00')

      expect(campo).toHaveValue('01/021580/2003-00')
    })

    test('recusa número incompleto sem navegar', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="cda" />)

      await user.type(
        screen.getByLabelText('N° da Certidão de Dívida Ativa'),
        '0123'
      )
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(
        screen.getByText(
          'Confira o número da certidão: ele tem o formato 00/000000/0000 ou 00/000000/0000-00.'
        )
      ).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })

  describe('modo execução fiscal', () => {
    test('aplica a máscara CNJ e leva só os dígitos', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="execucao-fiscal" />)

      const campo = screen.getByLabelText('N° da Execução Fiscal')
      await user.type(campo, '00123456720248190001')

      expect(campo).toHaveValue('0012345-67.2024.8.19.0001')

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?execucaoFiscal=00123456720248190001'
      )
    })

    /**
     * O cidadão copia o número da citação da Justiça, que já vem pontuado. Colar não pode
     * duplicar separador nem invalidar o campo.
     */
    test('aceita o número colado já formatado', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="execucao-fiscal" />)

      const campo = screen.getByLabelText('N° da Execução Fiscal')
      await user.click(campo)
      await user.paste('0012345-67.2024.8.19.0001')

      expect(campo).toHaveValue('0012345-67.2024.8.19.0001')

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?execucaoFiscal=00123456720248190001'
      )
    })

    test.each([
      [
        'CNJ sem os zeros à esquerda',
        '4236809220108190001',
        '423680-92.2010.8.19.0001',
      ],
      ['antigo do TJRJ', '20001200007061', '2000.120.000706-1'],
    ])('aceita o formato %s', async (_formato, digitos, mascarado) => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="execucao-fiscal" />)

      const campo = screen.getByLabelText('N° da Execução Fiscal')
      await user.click(campo)
      await user.paste(digitos)

      expect(campo).toHaveValue(mascarado)

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        `/divida-ativa/parcelamento/debitos?execucaoFiscal=${digitos}`
      )
    })

    test('recusa número incompleto', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo="execucao-fiscal" />)

      await user.type(screen.getByLabelText('N° da Execução Fiscal'), '0012345')
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(
        screen.getByText(
          'Confira o número da execução fiscal: ele tem de 14 a 20 números.'
        )
      ).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })

  test('exige o campo preenchido antes de consultar', async () => {
    const user = userEvent.setup()
    render(<ConsultaParcelamentoForm modo="inscricao" />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getByText('Digite a inscrição imobiliária.')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  // Manter a mensagem enquanto o cidadão corrige é ruído.
  test('limpa o erro assim que o cidadão volta a digitar', async () => {
    const user = userEvent.setup()
    render(<ConsultaParcelamentoForm modo="inscricao" />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(
      screen.getByText('Digite a inscrição imobiliária.')
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText('N° da Inscrição Imobiliária'), '5')

    expect(
      screen.queryByText('Digite a inscrição imobiliária.')
    ).not.toBeInTheDocument()
  })
})
