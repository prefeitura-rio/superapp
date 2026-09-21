import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConsultaParcelamentoForm } from '../consulta-parcelamento-form'
import { MODOS_CONSULTA } from '../modos-consulta'

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
      render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.inscricao} />)

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
      render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.inscricao} />)

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
    test('leva o número da certidão para a URL como cda', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.cda} />)

      await user.type(
        screen.getByLabelText('N° da Certidão de Dívida Ativa'),
        '20240000111'
      )
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?cda=20240000111'
      )
    })

    /**
     * A CDA não tem contagem conhecida — o contrato tipa `cdaId` como string livre. O front
     * só exige "tem número", para não recusar valor que a API aceitaria.
     */
    test('aceita qualquer quantidade de dígitos', async () => {
      const user = userEvent.setup()
      render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.cda} />)

      await user.type(
        screen.getByLabelText('N° da Certidão de Dívida Ativa'),
        '7'
      )
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?cda=7'
      )
    })
  })

  describe('modo execução fiscal', () => {
    test('aplica a máscara CNJ e leva só os dígitos', async () => {
      const user = userEvent.setup()
      render(
        <ConsultaParcelamentoForm modo={MODOS_CONSULTA['execucao-fiscal']} />
      )

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
      render(
        <ConsultaParcelamentoForm modo={MODOS_CONSULTA['execucao-fiscal']} />
      )

      const campo = screen.getByLabelText('N° da Execução Fiscal')
      await user.click(campo)
      await user.paste('0012345-67.2024.8.19.0001')

      expect(campo).toHaveValue('0012345-67.2024.8.19.0001')

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(push).toHaveBeenCalledWith(
        '/divida-ativa/parcelamento/debitos?execucaoFiscal=00123456720248190001'
      )
    })

    test('recusa número incompleto', async () => {
      const user = userEvent.setup()
      render(
        <ConsultaParcelamentoForm modo={MODOS_CONSULTA['execucao-fiscal']} />
      )

      await user.type(screen.getByLabelText('N° da Execução Fiscal'), '0012345')
      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(
        screen.getByText('O número da execução fiscal tem 20 números.')
      ).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()
    })
  })

  test('exige o campo preenchido antes de consultar', async () => {
    const user = userEvent.setup()
    render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.inscricao} />)

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getByText('Digite a inscrição imobiliária.')
    ).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  // Manter a mensagem enquanto o cidadão corrige é ruído.
  test('limpa o erro assim que o cidadão volta a digitar', async () => {
    const user = userEvent.setup()
    render(<ConsultaParcelamentoForm modo={MODOS_CONSULTA.inscricao} />)

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
