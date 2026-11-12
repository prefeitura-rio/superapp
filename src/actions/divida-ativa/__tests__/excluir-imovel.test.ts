import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { revalidatePath } from 'next/cache'
import { describe, expect, test, vi } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

describe('excluirImovel', () => {
  // A API real remove pelo id local de dbo.tbNC_Imovel, não pela inscrição.
  test('remove o imóvel pelo id local do cadastro', async () => {
    let idRecebido: string | undefined

    server.use(
      http.delete(`${DIVIDA_ATIVA}/imoveis/:id`, ({ params }) => {
        idRecebido = params.id as string
        return new HttpResponse(null, { status: 204 })
      })
    )

    const resultado = await excluirImovel(32)

    expect(idRecebido).toBe('32')
    expect(resultado).toEqual({ success: true, data: null })
  })

  test('exibe a mensagem da API quando a recusa vem com status 400', async () => {
    server.use(
      http.delete(`${DIVIDA_ATIVA}/imoveis/:id`, () =>
        HttpResponse.json(
          { error: 'Imovel vinculado a requerimento em andamento.' },
          { status: 400 }
        )
      )
    )

    const resultado = await excluirImovel(32)

    expect(resultado).toEqual({
      success: false,
      error: 'Imovel vinculado a requerimento em andamento.',
      status: 400,
    })
  })

  // O 404 da API vem com corpo vazio — a copy tem de ser nossa.
  test('usa copy própria quando o imóvel não é encontrado (404 sem corpo)', async () => {
    server.use(
      http.delete(
        `${DIVIDA_ATIVA}/imoveis/:id`,
        () => new HttpResponse(null, { status: 404 })
      )
    )

    const resultado = await excluirImovel(32)

    expect(resultado).toEqual({
      success: false,
      error: 'Não foi possível excluir o imóvel. Tente novamente mais tarde.',
      status: 404,
    })
  })

  test('revalida a lista e a landing depois de excluir', async () => {
    server.use(
      http.delete(
        `${DIVIDA_ATIVA}/imoveis/:id`,
        () => new HttpResponse(null, { status: 204 })
      )
    )

    await excluirImovel(32)

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/divida-ativa/imoveis'
    )
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/divida-ativa')
  })

  test('não chama a API com um id inválido', async () => {
    let chamou = false

    server.use(
      http.delete(`${DIVIDA_ATIVA}/imoveis/:id`, () => {
        chamou = true
        return new HttpResponse(null, { status: 204 })
      })
    )

    const resultado = await excluirImovel(Number.NaN)

    expect(chamou).toBe(false)
    expect(resultado.success).toBe(false)
  })
})
