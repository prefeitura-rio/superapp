import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { DadosCorrespondenciaForm } from '../dados-correspondencia-form'
import { DadosRequerenteForm } from '../dados-requerente-form'
import {
  lerDadosCorrespondencia,
  lerDadosRequerente,
  salvarDadosCorrespondencia,
  salvarDadosRequerente,
} from '../dados-requerimento-storage'

const push = vi.fn()
const consultarCep = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('@/actions/divida-ativa/consultar-cep', () => ({
  consultarCep: (cep: string) => consultarCep(cep),
}))

const PARAMS = {
  cda: '01140646202600',
  cdas: '01/140646/2026-00',
  data: '15/10/2026',
  parcelas: '2',
  etapa: 'requerente',
  tipo: 'CONTRIBUINTE',
}

const ENDERECO_VAZIO = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  municipio: '',
  uf: '',
}

// O Checkbox do Radix mede o próprio tamanho; o jsdom não tem ResizeObserver.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

beforeEach(() => {
  push.mockClear()
  consultarCep.mockReset()
  sessionStorage.clear()
})

function destino() {
  return new URL(push.mock.calls[0][0], 'http://x')
}

describe('DadosRequerenteForm', () => {
  test('mostra nome e CPF do login e chega preenchido com o perfil', () => {
    render(
      <DadosRequerenteForm
        nome="Maria da Silva"
        cpf="52998224725"
        perfil={{ telefone: '21987654321', email: 'maria@exemplo.com' }}
        searchParamsAtual={PARAMS}
      />
    )

    expect(screen.getByText('Maria da Silva')).toBeInTheDocument()
    expect(screen.getByText('CPF 529.982.247-25')).toBeInTheDocument()
    expect(screen.getByLabelText(/Telefone/)).toHaveValue('(21) 98765-4321')
    expect(screen.getByLabelText(/E-mail/)).toHaveValue('maria@exemplo.com')
  })

  test('a edição salva tem precedência sobre o perfil', async () => {
    salvarDadosRequerente({ telefone: '(21) 2345-6789', email: 'outro@x.com' })
    render(
      <DadosRequerenteForm
        nome="Maria"
        cpf="52998224725"
        perfil={{ telefone: '21987654321', email: 'maria@exemplo.com' }}
        searchParamsAtual={PARAMS}
      />
    )

    await waitFor(() =>
      expect(screen.getByLabelText(/Telefone/)).toHaveValue('(21) 2345-6789')
    )
  })

  test('sem telefone e e-mail válidos não avança', async () => {
    const user = userEvent.setup()
    render(
      <DadosRequerenteForm
        nome="Maria"
        cpf="52998224725"
        perfil={{ telefone: '', email: '' }}
        searchParamsAtual={PARAMS}
      />
    )

    await user.type(screen.getByLabelText(/E-mail/), 'sem-arroba')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByText('Informe o telefone.')).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  test('"Continuar" guarda os dados e segue para a correspondência', async () => {
    const user = userEvent.setup()
    render(
      <DadosRequerenteForm
        nome="Maria"
        cpf="52998224725"
        perfil={{ telefone: '21987654321', email: 'maria@exemplo.com' }}
        searchParamsAtual={PARAMS}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(destino().searchParams.get('etapa')).toBe('correspondencia')
    // Dado pessoal não vai na URL.
    expect(destino().search).not.toContain('maria')
    expect(lerDadosRequerente()).toEqual({
      telefone: '(21) 98765-4321',
      email: 'maria@exemplo.com',
    })
  })
})

describe('DadosCorrespondenciaForm', () => {
  const ENDERECO = {
    cep: '20541190',
    logradouro: 'Rua Paula Brito',
    numero: '10',
    complemento: '',
    bairro: 'Andaraí',
    municipio: 'Rio de Janeiro',
    uf: 'RJ',
  }

  function renderizar(endereco = ENDERECO) {
    return render(
      <DadosCorrespondenciaForm
        nome="Maria da Silva"
        cpf="52998224725"
        endereco={endereco}
        searchParamsAtual={{ ...PARAMS, etapa: 'correspondencia' }}
      />
    )
  }

  test('por padrão usa os dados do requerente, travados, e o endereço do perfil', async () => {
    salvarDadosRequerente({
      telefone: '(21) 98765-4321',
      email: 'maria@exemplo.com',
    })
    renderizar()

    expect(
      screen.getByRole('checkbox', { name: /Usar meus dados/ })
    ).toBeChecked()
    expect(screen.getByLabelText(/Nome completo/)).toHaveAttribute('readonly')
    expect(screen.getByLabelText(/^CPF/)).toHaveValue('529.982.247-25')
    await waitFor(() =>
      expect(screen.getByLabelText(/^Telefone/)).toHaveValue('(21) 98765-4321')
    )
    expect(screen.getByLabelText(/CEP/)).toHaveValue('20541-190')
    expect(screen.getByLabelText(/Logradouro/)).toHaveValue('Rua Paula Brito')
  })

  test('desmarcar libera os campos e permite pessoa jurídica com CNPJ', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('checkbox', { name: /Usar meus dados/ }))
    expect(screen.getByLabelText(/Nome completo/)).not.toHaveAttribute(
      'readonly'
    )

    await user.click(screen.getByText('Jurídica'))
    const documento = screen.getByLabelText(/^CNPJ/)
    expect(documento).toHaveValue('')

    await user.type(documento, '11222333000180')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(await screen.findByText('CNPJ inválido.')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  test('CEP completo busca o endereço e trava o que veio preenchido', async () => {
    const user = userEvent.setup()
    consultarCep.mockResolvedValue({
      success: true,
      data: {
        logradouro: 'Rua Gal Ribeiro da Costa',
        bairro: 'Leme',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
      },
    })
    renderizar(ENDERECO_VAZIO)

    await user.type(screen.getByLabelText(/CEP/), '22010010')

    await waitFor(() =>
      expect(screen.getByLabelText(/Logradouro/)).toHaveValue(
        'Rua Gal Ribeiro da Costa'
      )
    )
    expect(consultarCep).toHaveBeenCalledWith('22010010')
    expect(screen.getByLabelText(/Logradouro/)).toHaveAttribute('readonly')
    expect(screen.getByLabelText(/Bairro/)).toHaveValue('Leme')
    // O número não vem do CEP: segue editável.
    expect(screen.getByLabelText(/Número/)).not.toHaveAttribute('readonly')
  })

  test('CEP não encontrado avisa e deixa o endereço editável', async () => {
    const user = userEvent.setup()
    consultarCep.mockResolvedValue({
      success: false,
      error:
        'Não encontramos este CEP. Confira o número ou preencha o endereço.',
      status: 404,
    })
    renderizar(ENDERECO_VAZIO)

    await user.type(screen.getByLabelText(/CEP/), '99999999')

    expect(
      await screen.findByText(/Não encontramos este CEP/)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Logradouro/)).not.toHaveAttribute('readonly')
  })

  test('"Continuar" guarda a correspondência e segue para os documentos', async () => {
    const user = userEvent.setup()
    salvarDadosRequerente({
      telefone: '(21) 98765-4321',
      email: 'maria@exemplo.com',
    })
    renderizar()

    await waitFor(() =>
      expect(screen.getByLabelText(/^Telefone/)).toHaveValue('(21) 98765-4321')
    )
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    await waitFor(() => expect(push).toHaveBeenCalled())
    expect(destino().searchParams.get('etapa')).toBe('documentos')
    expect(lerDadosCorrespondencia()).toMatchObject({
      nome: 'Maria da Silva',
      documento: '529.982.247-25',
      cep: '20541-190',
      numero: '10',
    })
  })

  test('voltando, a correspondência de outra pessoa reaparece com os campos liberados', async () => {
    salvarDadosRequerente({
      telefone: '(21) 98765-4321',
      email: 'maria@exemplo.com',
    })
    salvarDadosCorrespondencia({
      ...ENDERECO,
      cep: '20541-190',
      nome: 'Empresa Ltda',
      tipoPessoa: 'JURIDICA',
      documento: '11.222.333/0001-81',
      telefone: '(21) 2345-6789',
      email: 'empresa@exemplo.com',
    })
    renderizar()

    await waitFor(() =>
      expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Empresa Ltda')
    )
    expect(
      screen.getByRole('checkbox', { name: /Usar meus dados/ })
    ).not.toBeChecked()
    expect(screen.getByLabelText(/^CNPJ/)).toHaveValue('11.222.333/0001-81')
  })
})
