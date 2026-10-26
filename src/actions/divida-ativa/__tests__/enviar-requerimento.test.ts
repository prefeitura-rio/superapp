import { enviarRequerimento } from '@/actions/divida-ativa/enviar-requerimento'
import type {
  DadosCorrespondencia,
  DadosRequerente,
} from '@/app/components/divida-ativa/dados-requerimento-schema'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { headers } from 'next/headers'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const URL_REQUERIMENTO = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/requerimentos`
const URL_SIMULAR = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/parcelamentos/simular`

const KB = 1024

/** Data URI de um arquivo com `bytes` bytes, como o FileReader do navegador produz. */
function dataUri(bytes: number, mime = 'application/pdf'): string {
  return `data:${mime};base64,${Buffer.alloc(bytes, 1).toString('base64')}`
}

const REQUERENTE: DadosRequerente = {
  telefone: '(21) 98765-4321',
  email: 'cidadao@exemplo.com',
}

const CORRESPONDENCIA: DadosCorrespondencia = {
  nome: 'Maria da Silva',
  tipoPessoa: 'FISICA',
  documento: '529.982.247-25',
  cep: '20541-190',
  logradouro: 'Rua Paula Brito',
  numero: '10',
  complemento: '',
  bairro: 'Andaraí',
  municipio: 'Rio de Janeiro',
  uf: 'rj',
  telefone: '(21) 2345-6789',
  email: 'maria@exemplo.com',
}

const DADOS = {
  cdas: ['01/175428/2024-00'],
  qtdeParcelas: '12',
  dtVencimento: '26/10/2026',
  tipo: 'SOCIO_RESPONSAVEL' as const,
  requerente: REQUERENTE,
  correspondencia: CORRESPONDENCIA,
  documentos: [
    {
      tipo: 'IDENTIDADE',
      nomeArquivo: 'rg.pdf',
      conteudoBase64: dataUri(10 * KB),
    },
  ],
  declaracaoAceita: true,
}

describe('enviarRequerimento', () => {
  // A action ressimula antes de enviar: o DAM recebe os números dela, não os do cliente.
  beforeEach(() => {
    server.use(
      http.post(URL_SIMULAR, () =>
        HttpResponse.json(
          {
            opcoes: [
              { qtdeParcelas: 6, valor1aParcela: 'R$\u00a0300,00' },
              { qtdeParcelas: 12, valor1aParcela: 'R$\u00a0150,50' },
            ],
          },
          { status: 200 }
        )
      )
    )
  })

  test('manda vínculo pelo código do DAM, nome do token e dados sem máscara', async () => {
    let corpo: Record<string, unknown> = {}
    server.use(
      http.post(URL_REQUERIMENTO, async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { numProtocoloRequerimentoParcelamento: '2026/123' },
          { status: 201 }
        )
      })
    )

    const resultado = await enviarRequerimento(DADOS)

    expect(resultado).toEqual({
      success: true,
      data: { protocolo: '2026/123', prazo: null },
    })
    expect(corpo).toMatchObject({
      descVinculoRequerente: '1',
      // Do token (mock em test/setup.ts), não do cliente.
      nomRequerente: 'Test User',
      numTelefoneRequerente: '21987654321',
      txtEmailRequerente: 'cidadao@exemplo.com',
      nomeCorr: 'Maria da Silva',
      tipoDoc: '1',
      numCPFCorr: '52998224725',
      numCEPCorr: '20541190',
      txtLogradouroEnderecoCorr: 'Rua Paula Brito',
      numEnderecoCorr: '10',
      txtBairroEnderecoCorr: 'Andaraí',
      txtCidadeEnderecoCorr: 'Rio de Janeiro',
      txtUfEnderecoCorr: 'RJ',
      numTelefoneCorr: '2123456789',
      txtEmailCorr: 'maria@exemplo.com',
      declaracaoAceita: true,
    })
    // Complemento vazio não vai como string vazia.
    expect(corpo).not.toHaveProperty('txtComplementoEnderecoCorr')
    // Decisão de 20/10/2026: sem reautenticação por senha.
    expect(corpo).not.toHaveProperty('senha')
  })

  function capturarIp() {
    let ip: string | null = null
    server.use(
      http.post(URL_REQUERIMENTO, ({ request }) => {
        ip = request.headers.get('x-forwarded-for')
        return HttpResponse.json(
          { numProtocoloRequerimentoParcelamento: '125' },
          { status: 201 }
        )
      })
    )
    return () => ip
  }

  test('repassa à API o IP que o mesh viu, não o que o cliente declarou', async () => {
    vi.mocked(headers).mockReturnValueOnce(
      new Headers({
        // Primeiro valor forjado pelo cliente; o Envoy grava o endereço real à parte.
        'x-forwarded-for': '1.1.1.1, 200.1.2.3',
        'x-envoy-external-address': '200.1.2.3',
      }) as never
    )
    const ip = capturarIp()

    await enviarRequerimento(DADOS)

    expect(ip()).toBe('200.1.2.3')
  })

  test('sem o cabeçalho do Envoy, usa o último hop do X-Forwarded-For', async () => {
    vi.mocked(headers).mockReturnValueOnce(
      new Headers({ 'x-forwarded-for': '1.1.1.1, 200.1.2.3' }) as never
    )
    const ip = capturarIp()

    await enviarRequerimento(DADOS)

    expect(ip()).toBe('200.1.2.3')
  })

  test('devolve o prazo da PGM; o comprovante não vai ao cliente', async () => {
    server.use(
      http.post(URL_REQUERIMENTO, () =>
        HttpResponse.json(
          {
            numProtocoloRequerimentoParcelamento: '2026/126',
            datPrevisaoEntrega: '02/11/2026',
            urlComprovante: 'https://daminternethom.rio.rj.gov.br/repo/c.pdf',
          },
          { status: 201 }
        )
      )
    )

    expect(await enviarRequerimento(DADOS)).toEqual({
      success: true,
      data: {
        protocolo: '2026/126',
        prazo: '02/11/2026',
      },
    })
  })

  test('sem a declaração marcada, nem chama a API', async () => {
    let chamou = false
    server.use(
      http.post(URL_REQUERIMENTO, () => {
        chamou = true
        return HttpResponse.json({}, { status: 201 })
      })
    )

    expect(
      (await enviarRequerimento({ ...DADOS, declaracaoAceita: false })).success
    ).toBe(false)
    expect(chamou).toBe(false)
  })

  // O DAM pode ter recebido o pedido: reenviar às cegas duplicaria o requerimento.
  test('falha sem resposta orienta a conferir antes de reenviar', async () => {
    server.use(http.post(URL_REQUERIMENTO, () => HttpResponse.error()))

    const resultado = await enviarRequerimento(DADOS)

    expect(resultado.success).toBe(false)
    expect(!resultado.success && resultado.error).toMatch(
      /Acompanhar requerimento/
    )
  })

  test('correspondência com CNPJ vai com tipoDoc 2', async () => {
    let corpo: Record<string, unknown> = {}
    server.use(
      http.post(URL_REQUERIMENTO, async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { numProtocoloRequerimentoParcelamento: '2026/124' },
          { status: 201 }
        )
      })
    )

    await enviarRequerimento({
      ...DADOS,
      correspondencia: {
        ...CORRESPONDENCIA,
        tipoPessoa: 'JURIDICA',
        documento: '11.222.333/0001-81',
      },
    })

    expect(corpo).toMatchObject({ tipoDoc: '2', numCPFCorr: '11222333000181' })
  })

  test('dados inválidos não chegam à API', async () => {
    let chamou = false
    server.use(
      http.post(URL_REQUERIMENTO, () => {
        chamou = true
        return HttpResponse.json({}, { status: 201 })
      })
    )

    const resultado = await enviarRequerimento({
      ...DADOS,
      correspondencia: { ...CORRESPONDENCIA, documento: '111.111.111-11' },
    })

    expect(resultado.success).toBe(false)
    expect(chamou).toBe(false)
  })

  test('recusa da API chega ao cidadão como ela mandou', async () => {
    server.use(
      http.post(URL_REQUERIMENTO, () =>
        HttpResponse.json(
          { error: 'CDA já possui requerimento de parcelamento em aberto.' },
          { status: 400 }
        )
      )
    )

    expect(await enviarRequerimento(DADOS)).toEqual({
      success: false,
      error: 'CDA já possui requerimento de parcelamento em aberto.',
      status: 400,
    })
  })

  test('envia as parcelas e o valor da simulação feita no servidor', async () => {
    let corpo: Record<string, unknown> = {}
    server.use(
      http.post(URL_REQUERIMENTO, async ({ request }) => {
        corpo = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          { numProtocoloRequerimentoParcelamento: '127' },
          { status: 201 }
        )
      })
    )

    await enviarRequerimento(DADOS)

    expect(corpo).toMatchObject({
      cdas: DADOS.cdas,
      qtdeParcelas: '12',
      dtVencimento: '26/10/2026',
      valor1aParcela: '150.5',
    })
  })

  test('quantidade de parcelas fora da simulação não chega à API', async () => {
    let chamou = false
    server.use(
      http.post(URL_REQUERIMENTO, () => {
        chamou = true
        return HttpResponse.json({}, { status: 201 })
      })
    )

    const resultado = await enviarRequerimento({ ...DADOS, qtdeParcelas: '60' })

    expect(resultado.success).toBe(false)
    expect(chamou).toBe(false)
  })

  test('recusa da simulação chega ao cidadão e não envia', async () => {
    let chamou = false
    server.use(
      http.post(URL_SIMULAR, () =>
        HttpResponse.json(
          { mensagemErro: 'Valor insuficiente para parcelamento.' },
          { status: 200 }
        )
      ),
      http.post(URL_REQUERIMENTO, () => {
        chamou = true
        return HttpResponse.json({}, { status: 201 })
      })
    )

    expect(await enviarRequerimento(DADOS)).toMatchObject({
      success: false,
      error: 'Valor insuficiente para parcelamento.',
    })
    expect(chamou).toBe(false)
  })

  describe('documentos revalidados no servidor', () => {
    const doc = DADOS.documentos[0]

    test.each([
      ['nenhum documento', []],
      ['tipo fora do contrato', [{ ...doc, tipo: 'SELFIE' }]],
      ['dois arquivos do mesmo tipo', [doc, doc]],
      ['extensão fora do contrato', [{ ...doc, nomeArquivo: 'rg.exe' }]],
      ['arquivo sem extensão', [{ ...doc, nomeArquivo: 'rg' }]],
      [
        'identidade acima de 500 KB',
        [{ ...doc, conteudoBase64: dataUri(500 * KB + 1) }],
      ],
      [
        'outro documento acima de 1,5 MB',
        [
          doc,
          {
            tipo: 'OUTROS',
            nomeArquivo: 'extra.pdf',
            conteudoBase64: dataUri(1.5 * 1024 * KB + 1),
          },
        ],
      ],
      [
        'base64 que não decodifica',
        [{ ...doc, conteudoBase64: 'data:application/pdf;base64,@@@@' }],
      ],
      [
        'conteúdo vazio',
        [{ ...doc, conteudoBase64: 'data:application/pdf;base64,' }],
      ],
      [
        'mais arquivos que tipos no contrato',
        Array.from({ length: 11 }, () => doc),
      ],
    ])('recusa %s sem chamar a API', async (_caso, documentos) => {
      let chamou = false
      server.use(
        http.post(URL_REQUERIMENTO, () => {
          chamou = true
          return HttpResponse.json({}, { status: 201 })
        })
      )

      const resultado = await enviarRequerimento({ ...DADOS, documentos })

      expect(resultado).toMatchObject({ success: false, status: 400 })
      expect(chamou).toBe(false)
    })

    test('aceita PNG e GIF, e o limite vale para o arquivo decodificado', async () => {
      let corpo: Record<string, unknown> = {}
      server.use(
        http.post(URL_REQUERIMENTO, async ({ request }) => {
          corpo = (await request.json()) as Record<string, unknown>
          return HttpResponse.json(
            { numProtocoloRequerimentoParcelamento: '128' },
            { status: 201 }
          )
        })
      )

      const documentos = [
        // Exatamente no limite: o base64 passa de 500 KB, o arquivo não.
        {
          tipo: 'IDENTIDADE',
          nomeArquivo: 'RG.PNG',
          conteudoBase64: dataUri(500 * KB, 'image/png'),
        },
        {
          tipo: 'CPF',
          nomeArquivo: 'cpf.gif',
          conteudoBase64: dataUri(KB, 'image/gif'),
        },
      ]
      const resultado = await enviarRequerimento({ ...DADOS, documentos })

      expect(resultado.success).toBe(true)
      expect(corpo.documentos).toEqual(documentos)
    })
  })
})
