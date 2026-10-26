import { getDalDividaAtivaRequerimentos } from '@/lib/dal'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

const URL = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/requerimentos`
const CPF = '12345678901'

const REQUERIMENTO = {
  numProtocoloRequerimentoParcelamento: '000146679',
  anoRequerimento: '2026',
  dataSolicitacao: '23/07/2026',
  datPrevisaoEntrega: '30/07/2026',
  situacaoId: '1',
  descricaoSituacao: 'Em análise',
  nomeContribuinte: 'FULANO DE TAL',
}

describe('getDalDividaAtivaRequerimentos', () => {
  test('lista os requerimentos do CPF a partir do array cru da API', async () => {
    server.use(
      http.get(URL, ({ request }) => {
        // Sem protocolo: a API lista pelo CPF do token, e nada vai na query.
        expect(
          new globalThis.URL(request.url).searchParams.has('protocolo')
        ).toBe(false)
        return HttpResponse.json([REQUERIMENTO], { status: 200 })
      })
    )

    const consulta = await getDalDividaAtivaRequerimentos(CPF)

    expect(consulta.situacao).toBe('ok')
    if (consulta.situacao !== 'ok') return
    expect(consulta.requerimentos).toHaveLength(1)
    expect(consulta.requerimentos[0]).toMatchObject({
      protocolo: '000146679',
      ano: '2026',
      abertoEm: '2026-07-23',
      situacao: 'Em análise',
    })
  })

  test('consulta por protocolo leva o número na query', async () => {
    server.use(
      http.get(URL, ({ request }) => {
        expect(
          new globalThis.URL(request.url).searchParams.get('protocolo')
        ).toBe('146679')
        return HttpResponse.json([REQUERIMENTO], { status: 200 })
      })
    )

    const consulta = await getDalDividaAtivaRequerimentos(CPF, '146679')

    expect(consulta.situacao).toBe('ok')
  })

  /**
   * "Não há" é 200 com um item só de mensagem — para CPF sem requerimento, protocolo
   * inexistente e protocolo de outro CPF. A mensagem vai para a tela como a API mandou.
   */
  test('item só com mensagem é vazio, com a mensagem da API', async () => {
    server.use(
      http.get(URL, () =>
        HttpResponse.json(
          [
            {
              mensagemErro: 'Requerimento não associado ao CPF do requerente.',
            },
          ],
          { status: 200 }
        )
      )
    )

    await expect(
      getDalDividaAtivaRequerimentos(CPF, '146679')
    ).resolves.toEqual({
      situacao: 'vazio',
      mensagem: 'Requerimento não associado ao CPF do requerente.',
    })
  })

  test('lista crua vazia é vazio sem mensagem', async () => {
    server.use(http.get(URL, () => HttpResponse.json([], { status: 200 })))

    await expect(getDalDividaAtivaRequerimentos(CPF)).resolves.toEqual({
      situacao: 'vazio',
      mensagem: null,
    })
  })

  test('400 com texto do DAM é vazio com essa mensagem', async () => {
    server.use(
      http.get(URL, () =>
        HttpResponse.json(
          { error: 'Protocolo inválido para o exercício.' },
          { status: 400 }
        )
      )
    )

    await expect(
      getDalDividaAtivaRequerimentos(CPF, '146679')
    ).resolves.toEqual({
      situacao: 'vazio',
      mensagem: 'Protocolo inválido para o exercício.',
    })
  })

  test('503 do DAM é indisponível', async () => {
    server.use(
      http.get(URL, () =>
        HttpResponse.json(
          { error: 'Servico de Divida Ativa indisponivel no momento.' },
          { status: 503 }
        )
      )
    )

    await expect(getDalDividaAtivaRequerimentos(CPF)).resolves.toEqual({
      situacao: 'indisponivel',
    })
  })
})
