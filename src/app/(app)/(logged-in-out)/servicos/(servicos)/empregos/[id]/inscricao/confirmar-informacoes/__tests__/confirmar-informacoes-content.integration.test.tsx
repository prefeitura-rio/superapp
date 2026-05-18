import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ConfirmarInformacoesContent } from '../confirmar-informacoes-content'
import type { EmpregosUserInfo } from '../types'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const validPhone = {
  principal: { ddi: '55', ddd: '21', valor: '999999999' },
}

const validEmail = {
  principal: { valor: 'usuario@exemplo.com.br' },
}

const baseUserInfo: EmpregosUserInfo = {
  cpf: '12345678901',
  name: 'Maria Silva',
  email: validEmail,
  phone: validPhone,
  genero: 'Feminino',
  escolaridade: 'Médio completo',
  renda_familiar: 'De 1 a 2 salários mínimos',
  deficiencia: 'Nenhuma',
}

const baseAuthInfo = { cpf: '12345678901', name: 'MARIA SILVA' }

describe('ConfirmarInformacoesContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exibição de dados', () => {
    test('exibe CPF formatado', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.getByText('123.456.789-01')).toBeInTheDocument()
    })

    test('exibe nome do usuário em title case', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    })

    test('exibe valor do celular quando preenchido', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.queryByText('Informe seu celular')).not.toBeInTheDocument()
    })

    test('exibe valor do e-mail quando preenchido', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.queryByText('Informe seu e-mail')).not.toBeInTheDocument()
    })
  })

  describe('campos obrigatórios ausentes', () => {
    test('exibe "Informe seu celular" e desabilita botão quando phone é nulo', () => {
      const userInfoSemPhone: EmpregosUserInfo = {
        ...baseUserInfo,
        phone: { principal: null },
      }

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={userInfoSemPhone}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.getByText('Informe seu celular')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })

    test('exibe "Informe seu e-mail" e desabilita botão quando email é nulo', () => {
      const userInfoSemEmail: EmpregosUserInfo = {
        ...baseUserInfo,
        email: { principal: null },
      }

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={userInfoSemEmail}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.getByText('Informe seu e-mail')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })

    test('desabilita botão quando phoneNeedsUpdate é true', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
          contactUpdateStatus={{
            phoneNeedsUpdate: true,
            emailNeedsUpdate: false,
          }}
        />
      )

      expect(screen.getByText('Informe seu celular')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })

    test('desabilita botão quando emailNeedsUpdate é true', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
          contactUpdateStatus={{
            phoneNeedsUpdate: false,
            emailNeedsUpdate: true,
          }}
        />
      )

      expect(screen.getByText('Informe seu e-mail')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    })
  })

  describe('botão Continuar habilitado', () => {
    test('habilita botão quando phone e email estão preenchidos', () => {
      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(
        screen.getByRole('button', { name: 'Continuar' })
      ).not.toBeDisabled()
    })

    test('chama onContinuar ao clicar quando dados estão completos', async () => {
      const user = userEvent.setup()
      const onContinuar = vi.fn()

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
          onContinuar={onContinuar}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(onContinuar).toHaveBeenCalledTimes(1)
    })

    test('navega para página do currículo quando onContinuar não é fornecido', async () => {
      const user = userEvent.setup()

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-456"
          userInfo={baseUserInfo}
          userAuthInfo={baseAuthInfo}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Continuar' }))

      expect(mockPush).toHaveBeenCalledWith(
        '/servicos/empregos/vaga-456/inscricao/curriculo'
      )
    })
  })

  describe('campos opcionais', () => {
    test('exibe "Informe seu gênero" quando gênero não está preenchido', () => {
      const userInfoSemGenero: EmpregosUserInfo = {
        ...baseUserInfo,
        genero: undefined,
      }

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={userInfoSemGenero}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(screen.getByText('Informe seu gênero')).toBeInTheDocument()
    })

    test('botão Continuar permanece habilitado mesmo sem campos opcionais', () => {
      const userInfoSemOpcionais: EmpregosUserInfo = {
        ...baseUserInfo,
        genero: undefined,
        escolaridade: undefined,
        renda_familiar: undefined,
        deficiencia: undefined,
      }

      render(
        <ConfirmarInformacoesContent
          vagaId="vaga-123"
          userInfo={userInfoSemOpcionais}
          userAuthInfo={baseAuthInfo}
        />
      )

      expect(
        screen.getByRole('button', { name: 'Continuar' })
      ).not.toBeDisabled()
    })
  })
})
