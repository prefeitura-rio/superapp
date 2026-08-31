import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { revalidatePath } from 'next/cache'
import { describe, expect, test, vi } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

describe('adicionarImovel', () => {
  test('envia somente os dígitos da inscrição no campo numInscricao', async () => {
    let bodyRecebido: unknown

    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, async ({ request }) => {
        bodyRecebido = await request.json()
        return HttpResponse.json(
          { id: 32, numInscricao: '00000018' },
          { status: 201 }
        )
      })
    )

    await adicionarImovel('0.521.766-3')

    expect(bodyRecebido).toEqual({ numInscricao: '05217663' })
  })

  test('devolve o imóvel cadastrado na linguagem do produto', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json(
          {
            id: 32,
            cpf: '12345678909',
            dataInclusao: '2026-06-22T15:40:46.477',
            endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
            numInscricao: '00000018',
          },
          { status: 201 }
        )
      )
    )

    const resultado = await adicionarImovel('00000018')

    expect(resultado).toEqual({
      success: true,
      data: {
        id: 32,
        inscricao: '00000018',
        endereco: 'RUA EXEMPLO, 123 / LOJA A - BAIRRO',
        bairro: null,
        proprietario: null,
        possuiDebitos: null,
        cadastradoEm: '2026-06-22',
      },
    })
  })

  // Mensagem real da API, verificada em 17/08/2026: vem em 400, sem acento e em tom de
  // sistema. A tela mostra a copy do produto no lugar.
  test('mostra a copy do produto quando o imóvel já está cadastrado (400)', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json(
          { error: 'Este imovel ja esta cadastrado para o usuario.' },
          { status: 400 }
        )
      )
    )

    const resultado = await adicionarImovel('00000018')

    expect(resultado).toEqual({
      success: false,
      error: 'Este imóvel já está na sua lista.',
      status: 400,
    })
  })

  // O 502 real diz "Falha ao consultar imovel no WS Fazenda IPTU." — nome de sistema
  // interno não vai para a tela do cidadão.
  test('não repassa a mensagem de um 502, que vaza sistema interno', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json(
          { error: 'Falha ao consultar imovel no WS Fazenda IPTU.' },
          { status: 502 }
        )
      )
    )

    const resultado = await adicionarImovel('99999999')

    expect(resultado).toEqual({
      success: false,
      error: 'Não foi possível adicionar o imóvel. Tente novamente mais tarde.',
      status: 502,
    })
  })

  test('recusa uma inscrição fora do formato sem chamar a API', async () => {
    let chamou = false

    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, () => {
        chamou = true
        return HttpResponse.json({}, { status: 201 })
      })
    )

    const resultado = await adicionarImovel('123')

    expect(chamou).toBe(false)
    expect(resultado.success).toBe(false)
  })

  test('revalida a lista e a landing depois de cadastrar', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json({ id: 32, numInscricao: '00000018' }, { status: 201 })
      )
    )

    await adicionarImovel('00000018')

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/divida-ativa/imoveis'
    )
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/divida-ativa')
  })
})
