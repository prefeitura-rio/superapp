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
  /**
   * A trava mais importante deste arquivo. A API devolve **array cru** e o spec do Quarkus
   * tipa objeto singular; o DAL fazia `result.data?.data`, que num array resolve para
   * `undefined` e cairia no `[]` — o cidadão com imóvel veria "nenhum imóvel cadastrado",
   * sem erro nem log. Se alguém reintroduzir o acesso ao envelope, este teste cai.
   */
  test('devolve os imóveis do cidadão a partir do array cru da API', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json(
          [
            {
              id: 32,
              cpf: '16232350731',
              dataInclusao: '2026-06-22T15:40:46.477',
              endereco: 'RUA SANTO AFONSO, 216 / LOJA A - TIJUCA',
              numInscricao: '00000018',
            },
          ],
          { status: 200 }
        )
      )
    )

    const imoveis = await getDalDividaAtivaImoveis(CPF)

    expect(imoveis).toEqual([
      {
        id: 32,
        inscricao: '00000018',
        endereco: 'RUA SANTO AFONSO, 216 / LOJA A - TIJUCA',
        bairro: null,
        proprietario: null,
        possuiDebitos: null,
        cadastradoEm: '2026-06-22',
      },
    ])
  })

  test('devolve lista vazia quando o cidadão não tem imóvel cadastrado', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json([], { status: 200 })
      )
    )

    await expect(getDalDividaAtivaImoveis(CPF)).resolves.toEqual([])
  })

  // A landing não pode cair por causa do contador de imóveis.
  test('devolve lista vazia quando a API falha, em vez de propagar o erro', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () =>
        HttpResponse.json({ error: 'HTTP 401 Unauthorized' }, { status: 401 })
      )
    )

    await expect(getDalDividaAtivaImoveis(CPF)).resolves.toEqual([])
  })

  test('não serve dado pessoal de cache: cada leitura vai à API', async () => {
    let chamadas = 0

    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis`, () => {
        chamadas += 1
        return HttpResponse.json([], { status: 200 })
      })
    )

    await getDalDividaAtivaImoveis(CPF)
    await getDalDividaAtivaImoveis(CPF)

    expect(chamadas).toBe(2)
  })
})

/**
 * ⚠️ Este endpoint consulta um imóvel **já cadastrado** — não é a consulta prévia que a
 * tela "Confirme sua inscrição" precisaria. A premissa P20 está em aberto por causa disso;
 * ver `docs/divida-ativa.md`. Os testes abaixo cobrem o comportamento real da API, não o
 * comportamento que o desenho pressupõe.
 */
describe('getDalDividaAtivaConsultaInscricao', () => {
  beforeEach(() => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/consulta`, ({ params }) =>
        params.inscricao === '00000018'
          ? HttpResponse.json(
              {
                imovel: {
                  id: 32,
                  dataInclusao: '2026-06-22T15:40:46.477',
                  endereco: 'RUA SANTO AFONSO, 216 / LOJA A - TIJUCA',
                  numInscricao: '00000018',
                },
                opcoes: [],
              },
              { status: 200 }
            )
          : // A API real devolve 404 com corpo vazio para inscrição não cadastrada.
            new HttpResponse(null, { status: 404 })
      )
    )
  })

  test('devolve o imóvel cadastrado na linguagem do produto', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('00000018', CPF)

    expect(imovel?.id).toBe(32)
    expect(imovel?.endereco).toBe('RUA SANTO AFONSO, 216 / LOJA A - TIJUCA')
  })

  test('devolve null quando a inscrição não está cadastrada, sem lançar', async () => {
    await expect(
      getDalDividaAtivaConsultaInscricao('99999999', CPF)
    ).resolves.toBeNull()
  })

  // A resposta é `{ imovel, opcoes }`: um 200 sem `imovel` não pode virar um objeto vazio.
  test('devolve null quando o 200 vem sem o imóvel', async () => {
    server.use(
      http.get(`${DIVIDA_ATIVA}/imoveis/:inscricao/consulta`, () =>
        HttpResponse.json({ opcoes: [] }, { status: 200 })
      )
    )

    await expect(
      getDalDividaAtivaConsultaInscricao('00000018', CPF)
    ).resolves.toBeNull()
  })

  test('normaliza a máscara antes de consultar', async () => {
    const imovel = await getDalDividaAtivaConsultaInscricao('0.000.001-8', CPF)

    expect(imovel?.inscricao).toBe('00000018')
  })
})
