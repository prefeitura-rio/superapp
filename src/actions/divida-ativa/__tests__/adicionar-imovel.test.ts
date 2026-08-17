import { adicionarImovel } from '@/actions/divida-ativa/adicionar-imovel'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { revalidatePath } from 'next/cache'
import { describe, expect, test, vi } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

describe('adicionarImovel', () => {
  test('envia somente os dígitos da inscrição, sem a máscara de exibição', async () => {
    let bodyRecebido: unknown

    server.use(
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, async ({ request }) => {
        bodyRecebido = await request.json()
        return HttpResponse.json(
          { inscricaoImobiliaria: '05217663' },
          { status: 201 }
        )
      })
    )

    await adicionarImovel('0.521.766-3')

    expect(bodyRecebido).toEqual({ inscricaoImobiliaria: '05217663' })
  })

  test('devolve o imóvel cadastrado na linguagem do produto', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json(
          {
            inscricaoImobiliaria: '05217663',
            endereco: 'Rua Barata Ribeiro, 586 - A 501',
            bairro: 'Copacabana',
            proprietario: 'Bruno Rocha Menezes',
          },
          { status: 201 }
        )
      )
    )

    const resultado = await adicionarImovel('05217663')

    expect(resultado).toEqual({
      success: true,
      data: {
        inscricao: '05217663',
        endereco: 'Rua Barata Ribeiro, 586 - A 501',
        bairro: 'Copacabana',
        proprietario: 'Bruno Rocha Menezes',
        possuiDebitos: false,
        cadastradoEm: null,
      },
    })
  })

  test('reflete a mensagem da API quando o imóvel já está cadastrado (409)', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'IMOVEL_JA_CADASTRADO',
                message: 'Este imóvel já está na sua lista.',
              },
            ],
          },
          { status: 409 }
        )
      )
    )

    const resultado = await adicionarImovel('05217663')

    expect(resultado).toEqual({
      success: false,
      error: 'Este imóvel já está na sua lista.',
      status: 409,
    })
  })

  test('não inventa motivo quando a API falha sem mensagem exibível (500)', async () => {
    server.use(
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    )

    const resultado = await adicionarImovel('05217663')

    expect(resultado.success).toBe(false)
    expect(resultado).toMatchObject({ status: 500 })
  })

  test('recusa uma inscrição fora do formato sem chamar a API', async () => {
    let chamou = false

    server.use(
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, () => {
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
      http.post(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json({ inscricaoImobiliaria: '05217663' }, { status: 201 })
      )
    )

    await adicionarImovel('05217663')

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/divida-ativa/imoveis'
    )
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/divida-ativa')
  })
})
