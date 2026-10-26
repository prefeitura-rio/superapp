import { renderNoWizard } from '@/test/documentos-requerimento'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  salvarDadosCorrespondencia,
  salvarDadosRequerente,
} from '../dados-requerimento-storage'
import { RevisarRequerimentoShell } from '../revisar-requerimento-shell'

const replace = vi.fn()
// Mesmo objeto a cada render, como o router do Next: o efeito do shell depende dele, e um
// objeto novo por render o faria rodar de novo para sempre.
const router = { push: vi.fn(), replace, refresh: vi.fn() }

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}))

vi.mock('@/actions/divida-ativa/enviar-requerimento', () => ({
  enviarRequerimento: vi.fn(),
}))

const ROTAS = {
  rotaRequerente: '/requerimento?etapa=requerente',
  rotaCorrespondencia: '/requerimento?etapa=correspondencia',
  rotaDocumentos: '/requerimento?etapa=documentos',
}

const REQUERENTE = { telefone: '(21) 98765-4321', email: 'maria@exemplo.com' }
const CORRESPONDENCIA = {
  nome: 'Maria da Silva',
  tipoPessoa: 'FISICA' as const,
  documento: '529.982.247-25',
  cep: '20541-190',
  logradouro: 'Rua Paula Brito',
  numero: '10',
  complemento: '',
  bairro: 'Andaraí',
  municipio: 'Rio de Janeiro',
  uf: 'RJ',
  ...REQUERENTE,
}
const DOC = {
  tipo: 'IDENTIDADE',
  nomeArquivo: 'rg.pdf',
  conteudoBase64: 'AAAA',
  tamanho: 3,
}

/** Revisão dentro do layout do wizard, com os anexos que a etapa de upload guardou. */
function renderizar(documentos: (typeof DOC)[] = []) {
  return renderNoWizard(
    <RevisarRequerimentoShell
      cdas={['01/140646/2026-00']}
      qtdeParcelas={2}
      dtVencimento="15/10/2026"
      valor1aParcela={848.29}
      valorTotal={1705.09}
      debitosCdas={[]}
      tipo="CONTRIBUINTE"
      nome="Maria da Silva"
      cpf="52998224725"
      {...ROTAS}
    />,
    { tipo: 'CONTRIBUINTE', documentos }
  )
}

beforeEach(() => {
  replace.mockClear()
  sessionStorage.clear()
})

describe('RevisarRequerimentoShell', () => {
  test('sem os dados do requerente, volta para a etapa dele', async () => {
    renderizar()

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(ROTAS.rotaRequerente)
    )
  })

  test('sem a correspondência, volta para a etapa dela', async () => {
    salvarDadosRequerente(REQUERENTE)
    renderizar()

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(ROTAS.rotaCorrespondencia)
    )
  })

  test('sem documentos, volta para o upload', async () => {
    salvarDadosRequerente(REQUERENTE)
    salvarDadosCorrespondencia(CORRESPONDENCIA)
    renderizar()

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(ROTAS.rotaDocumentos)
    )
  })

  test('com tudo preenchido, mostra os dados com "Editar" para cada etapa', async () => {
    salvarDadosRequerente(REQUERENTE)
    salvarDadosCorrespondencia(CORRESPONDENCIA)
    renderizar([DOC])

    expect(
      await screen.findByRole('link', { name: 'Editar seus dados' })
    ).toHaveAttribute('href', ROTAS.rotaRequerente)
    expect(
      screen.getByRole('link', { name: 'Editar correspondência' })
    ).toHaveAttribute('href', ROTAS.rotaCorrespondencia)
    expect(screen.getByText('Maria da Silva')).toBeInTheDocument()
    expect(
      screen.getByText(/Rua Paula Brito, 10 · Andaraí · Rio de Janeiro\/RJ/)
    ).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  /**
   * A simulação devolve um único `valor1aParcela` para o conjunto de CDAs, não parcelas
   * numeradas por CDA. Cada card é uma CDA com esse valor — sem "Parcela 1/2", que daria a
   * impressão de que outras parcelas viriam a seguir.
   */
  test('a seção de parcelas mostra um card por CDA com o valor da 1ª parcela', async () => {
    salvarDadosRequerente(REQUERENTE)
    salvarDadosCorrespondencia(CORRESPONDENCIA)
    renderizar([DOC])

    expect(
      await screen.findByRole('heading', { name: 'Parcelas' })
    ).toBeInTheDocument()
    expect(screen.getByText('01/140646/2026-00')).toBeInTheDocument()
    expect(screen.getByText('Valor da 1ª parcela')).toBeInTheDocument()
    expect(screen.getByText('R$848,29')).toBeInTheDocument()
    expect(screen.queryByText(/^1\/2$/)).toBeNull()
  })
})
