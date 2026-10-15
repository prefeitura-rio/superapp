import { emitirGuiaAvista } from '@/actions/divida-ativa/emitir-guia-avista'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

const URL_EMITIR = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/avista/emitir`
const CDAS = ['01/137861/2025-00']

describe('emitirGuiaAvista', () => {
  test('emite pelas CDAs com a data da revisão e devolve o PDF', async () => {
    let corpo: unknown
    server.use(
      http.post(URL_EMITIR, async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json(
          {
            numeroGuia: '2026/0980866',
            linhaDigitavel:
              '81680000018-3 57853659202-0 61015494100-5 11098086626-0',
            urlPdf: 'https://daminternethom.rio.rj.gov.br/repo/guia.pdf',
          },
          { status: 200 }
        )
      })
    )

    const resultado = await emitirGuiaAvista(CDAS, '15/10/2026')

    expect(corpo).toEqual({ cdas: CDAS, dataVencimento: '15/10/2026' })
    expect(resultado).toEqual({
      success: true,
      data: { urlPdf: 'https://daminternethom.rio.rj.gov.br/repo/guia.pdf' },
    })
  })

  test('recusa do DAM com 400 chega ao cidadão como a API mandou', async () => {
    server.use(
      http.post(URL_EMITIR, () =>
        HttpResponse.json(
          { error: 'Data de vencimento inválida.' },
          { status: 400 }
        )
      )
    )

    expect(await emitirGuiaAvista(CDAS, '15/10/2026')).toEqual({
      success: false,
      error: 'Data de vencimento inválida.',
      status: 400,
    })
  })

  test('guia emitida sem PDF não é sucesso, mas informa o número da guia', async () => {
    server.use(
      http.post(URL_EMITIR, () =>
        HttpResponse.json({ numeroGuia: '2026/0980866' }, { status: 200 })
      )
    )

    const resultado = await emitirGuiaAvista(CDAS, '15/10/2026')

    expect(resultado.success).toBe(false)
    expect(!resultado.success && resultado.error).toContain('2026/0980866')
  })

  test('5xx vira copy própria, sem vazar a mensagem do sistema', async () => {
    server.use(
      http.post(URL_EMITIR, () =>
        HttpResponse.json(
          { error: 'Servico de Divida Ativa indisponivel no momento.' },
          { status: 503 }
        )
      )
    )

    expect(await emitirGuiaAvista(CDAS, '15/10/2026')).toEqual({
      success: false,
      error:
        'Não foi possível emitir a guia agora. Tente novamente em alguns minutos.',
      status: 503,
    })
  })
})
