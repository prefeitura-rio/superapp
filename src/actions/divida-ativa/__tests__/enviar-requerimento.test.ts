import { enviarRequerimento } from '@/actions/divida-ativa/enviar-requerimento'
import type {
  DadosCorrespondencia,
  DadosRequerente,
} from '@/app/components/divida-ativa/dados-requerimento-schema'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { headers } from 'next/headers'
import { describe, expect, test, vi } from 'vitest'

const URL_REQUERIMENTO = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/requerimentos`

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
    { tipo: 'IDENTIDADE', nomeArquivo: 'rg.pdf', conteudoBase64: 'AAAA' },
  ],
  declaracaoAceita: true,
}

describe('enviarRequerimento', () => {
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
      data: { protocolo: '2026/123', prazo: null, urlComprovante: null },
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

  test('repassa o IP do cidadão à API, que o registra no requerimento', async () => {
    vi.mocked(headers).mockReturnValueOnce(
      new Headers({ 'x-forwarded-for': '200.1.2.3, 10.0.0.1' }) as never
    )
    let ip: string | null = null
    server.use(
      http.post(URL_REQUERIMENTO, ({ request }) => {
        ip = request.headers.get('x-forwarded-for')
        return HttpResponse.json(
          { numProtocoloRequerimentoParcelamento: '2026/125' },
          { status: 201 }
        )
      })
    )

    await enviarRequerimento(DADOS)

    expect(ip).toBe('200.1.2.3')
  })

  test('devolve o prazo da PGM e o comprovante quando o DAM os informa', async () => {
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
        urlComprovante: 'https://daminternethom.rio.rj.gov.br/repo/c.pdf',
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
})
