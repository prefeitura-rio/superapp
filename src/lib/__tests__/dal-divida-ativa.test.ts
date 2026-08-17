import {
  getDalDividaAtivaConsultaInscricao,
  getDalDividaAtivaImoveis,
} from '@/lib/dal'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA
const CPF = '12345678901'

describe('getDalDividaAtivaImoveis', () => {
  test('devolve os imóveis do cidadão já na linguagem do produto', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json(
          {
            data: [
              {
                inscricaoImobiliaria: '05217663',
                endereco: 'Rua Barata Ribeiro, 586 - A 501',
                bairro: 'Copacabana',
                proprietario: 'Bruno Rocha Menezes',
                possuiDebitos: true,
              },
            ],
          },
          { status: 200 }
        )
      )
    )

    const imoveis = await getDalDividaAtivaImoveis(CPF)

    expect(imoveis).toEqual([
      {
        inscricao: '05217663',
        endereco: 'Rua Barata Ribeiro, 586 - A 501',
        bairro: 'Copacabana',
        proprietario: 'Bruno Rocha Menezes',
        possuiDebitos: true,
        cadastradoEm: null,
      },
    ])
  })

  test('devolve lista vazia quando o cidadão não tem imóvel cadastrado', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, () =>
        HttpResponse.json({ data: [] }, { status: 200 })
      )
    )

    await expect(getDalDividaAtivaImoveis(CPF)).resolves.toEqual([])
  })

  test('não serve dado pessoal de cache: cada leitura vai à API', async () => {
    let chamadas = 0

    server.use(
      http.get(`${DIVIDA_ATIVA}/v1/imoveis`, () => {
        chamadas += 1
        return HttpResponse.json({ data: [] }, { status: 200 })
      })
    )

    await getDalDividaAtivaImoveis(CPF)
    await getDalDividaAtivaImoveis(CPF)

    expect(chamadas).toBe(2)
  })
})

describe('getDalDividaAtivaConsultaInscricao', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${DIVIDA_ATIVA}/v1/imoveis/consulta/:inscricao`,
        ({ params }) =>
          params.inscricao === '05217663'
            ? HttpResponse.json(
                {
                  inscricaoImobiliaria: '05217663',
                  endereco: 'Rua Barata Ribeiro, 586 - A 501',
                  bairro: 'Copacabana',
                  proprietario: 'Bruno Rocha Menezes',
                },
                { status: 200 }
              )
            : HttpResponse.json(
                { errors: [{ code: 'NAO_ENCONTRADO', message: 'não existe' }] },
                { status: 404 }
              )
      )
    )
  })

  test('consulta a inscrição no sistema fiscal sem cadastrar nada', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('05217663', CPF)

    expect(imovel?.endereco).toBe('Rua Barata Ribeiro, 586 - A 501')
    expect(imovel?.proprietario).toBe('Bruno Rocha Menezes')
  })

  test('devolve null quando a inscrição não existe, sem lançar', async () => {
    await expect(
      getDalDividaAtivaConsultaInscricao('99999999', CPF)
    ).resolves.toBeNull()
  })

  test('normaliza a máscara antes de consultar', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('0.521.766-3', CPF)

    expect(imovel?.inscricao).toBe('05217663')
  })
})
