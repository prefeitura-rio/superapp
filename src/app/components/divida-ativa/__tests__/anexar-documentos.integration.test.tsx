import { renderNoWizard } from '@/test/documentos-requerimento'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { AnexarDocumentos } from '../anexar-documentos'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
}))

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }))

const IDENTIDADE = {
  tipo: 'IDENTIDADE',
  nomeArquivo: 'rg.pdf',
  conteudoBase64: 'data:application/pdf;base64,AAAA',
  tamanho: 2048,
}
const CPF = { ...IDENTIDADE, tipo: 'CPF', nomeArquivo: 'cpf.pdf' }

const PARAMS = {
  cda: '01140646202600',
  cdas: '01/140646/2026-00',
  data: '15/10/2026',
  parcelas: '2',
  etapa: 'documentos',
  tipo: 'CONTRIBUINTE',
}

beforeEach(() => {
  push.mockClear()
})

describe('AnexarDocumentos', () => {
  test('mostra os formatos e limites de tamanho e o "Revisar envio", como no Figma', () => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />
    )

    expect(
      screen.getByText(
        'Os arquivos devem estar em formato PDF, JPG, PNG ou GIF. Arquivos de Identidade, CPF e CNPJ não podem ultrapassar 500KB e os demais não devem ultrapassar 1,5MB.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar envio' })).toBeDisabled()
  })

  test('voltando da revisão, os arquivos já anexados reaparecem', async () => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />,
      { tipo: 'CONTRIBUINTE', documentos: [IDENTIDADE, CPF] }
    )

    expect(await screen.findByText(/rg\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/cpf\.pdf/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revisar envio' })).toBeEnabled()
  })

  // Como no portal legado: identidade e CPF do requerente são obrigatórios.
  test('sem o CPF, o contribuinte não revisa o envio', async () => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />,
      { tipo: 'CONTRIBUINTE', documentos: [IDENTIDADE] }
    )

    expect(
      screen.getByRole('heading', {
        name: 'Anexe os documentos do contribuinte',
      })
    ).toBeInTheDocument()
    await screen.findByText(/rg\.pdf/)
    expect(screen.getByRole('button', { name: 'Revisar envio' })).toBeDisabled()
  })

  test.each([
    ['CONTRIBUINTE', ['Identidade com foto', 'CPF', 'Outros documentos']],
    [
      'SOCIO_RESPONSAVEL',
      [
        'Identidade do sócio com foto',
        'CPF do sócio',
        'CNPJ da empresa',
        'Registro de empresário individual, contrato ou estatuto social',
        'Ata de eleição da atual diretoria',
        'Outros documentos',
      ],
    ],
    [
      'PROCURADOR',
      [
        'Identidade do procurador com foto',
        'CPF do procurador',
        'Procuração com firma reconhecida',
        'Identidade do outorgante com foto',
        'CPF do outorgante',
        'Outros documentos',
      ],
    ],
    [
      'PROPRIETARIO_POSSUIDOR',
      [
        'Identidade com foto',
        'CPF',
        'Comprovante de propriedade ou posse',
        'Outros documentos',
      ],
    ],
  ] as const)(
    '%s pede os documentos do seu grupo, com identidade e CPF do requerente',
    (tipo, titulos) => {
      renderNoWizard(
        <AnexarDocumentos tipo={tipo} searchParamsAtual={{ ...PARAMS, tipo }} />
      )

      for (const titulo of titulos) {
        expect(screen.getByText(titulo, { exact: true })).toBeInTheDocument()
      }
    }
  )

  // Os slots mudam por tipo: um RG anexado como contribuinte não vale para procurador.
  test('arquivos de outro vínculo não são reaproveitados', () => {
    renderNoWizard(
      <AnexarDocumentos
        tipo="PROCURADOR"
        searchParamsAtual={{ ...PARAMS, tipo: 'PROCURADOR' }}
      />,
      { tipo: 'CONTRIBUINTE', documentos: [IDENTIDADE, CPF] }
    )

    expect(screen.queryByText(/rg\.pdf/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Revisar envio' })).toBeDisabled()
  })

  test('remover um arquivo também o tira do que fica guardado', async () => {
    const user = userEvent.setup()
    const { documentos } = renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />,
      { tipo: 'CONTRIBUINTE', documentos: [IDENTIDADE, CPF] }
    )

    await user.click(
      await screen.findByRole('button', {
        name: 'Remover Identidade com foto',
      })
    )

    expect(
      documentos()
        .lerDocumentos('CONTRIBUINTE')
        .map(d => d.tipo)
    ).toEqual(['CPF'])
  })

  test('"Revisar envio" guarda os arquivos e segue para a revisão', async () => {
    const user = userEvent.setup()
    const { documentos } = renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />,
      { tipo: 'CONTRIBUINTE', documentos: [IDENTIDADE, CPF] }
    )

    await screen.findByText(/rg\.pdf/)
    await user.click(screen.getByRole('button', { name: 'Revisar envio' }))

    const destino = new URL(push.mock.calls[0][0], 'http://x')
    expect(destino.searchParams.get('etapa')).toBe('revisao')
    expect(destino.searchParams.get('tipo')).toBe('CONTRIBUINTE')
    expect(
      documentos()
        .lerDocumentos('CONTRIBUINTE')
        .map(d => d.nomeArquivo)
    ).toEqual(['rg.pdf', 'cpf.pdf'])
    // Nada dos anexos fica no navegador.
    expect(sessionStorage.length).toBe(0)
  })

  // Regra da API: CDA de pessoa jurídica exige CNPJ e registro de todo vínculo, menos o 5.
  test.each([
    ['CONTRIBUINTE', true],
    ['PROCURADOR', true],
    ['SOCIO_RESPONSAVEL', true],
    ['PROPRIETARIO_POSSUIDOR', false],
  ] as const)(
    'devedor PJ: %s pede os documentos da empresa? %s',
    (tipo, pede) => {
      renderNoWizard(
        <AnexarDocumentos
          tipo={tipo}
          devedorPessoaJuridica
          searchParamsAtual={{ ...PARAMS, tipo }}
        />
      )

      expect(screen.queryByText('CNPJ da empresa') !== null).toBe(pede)
      expect(
        screen.queryByText(
          'Registro de empresário individual, contrato ou estatuto social'
        ) !== null
      ).toBe(pede)
    }
  )

  test('devedor pessoa física: o contribuinte não vê documentos da empresa', () => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />
    )

    expect(screen.queryByText('CNPJ da empresa')).toBeNull()
  })

  test.each([
    ['image/png', 'rg.png'],
    ['image/gif', 'rg.gif'],
  ])('aceita %s, como o contrato', async (mime, nome) => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />
    )

    anexar('Identidade com foto', new File(['x'], nome, { type: mime }))

    expect(await screen.findByText(new RegExp(nome))).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  test('recusa extensão fora do contrato mesmo com tipo MIME aceito', async () => {
    renderNoWizard(
      <AnexarDocumentos tipo="CONTRIBUINTE" searchParamsAtual={PARAMS} />
    )

    anexar(
      'Identidade com foto',
      new File(['x'], 'rg.webp', { type: 'image/png' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Formato inválido. Envie um arquivo PDF, JPG, PNG ou GIF.'
    )
  })
})

/** Escolhe um arquivo no input do slot (o input fica logo depois do card). */
function anexar(tituloSlot: string, arquivo: File) {
  const card = screen.getByRole('button', { name: tituloSlot })
  const input = card
    .closest('div.flex.flex-col')
    ?.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [arquivo] } })
}
