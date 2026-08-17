import { excluirImovel } from '@/actions/divida-ativa/excluir-imovel'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { revalidatePath } from 'next/cache'
import { describe, expect, test, vi } from 'vitest'

const DIVIDA_ATIVA = TEST_ENV.BASE_API_URL_DIVIDA_ATIVA

describe('excluirImovel', () => {
  test('remove o imóvel pela inscrição normalizada', async () => {
    let inscricaoRecebida: string | undefined

    server.use(
      http.delete(`${DIVIDA_ATIVA}/v1/imoveis/:inscricao`, ({ params }) => {
        inscricaoRecebida = params.inscricao as string
        return new HttpResponse(null, { status: 204 })
      })
    )

    const resultado = await excluirImovel('0.521.766-3')

    expect(inscricaoRecebida).toBe('05217663')
    expect(resultado).toEqual({ success: true, data: null })
  })

  test('reflete a mensagem da API quando a exclusão é recusada (409)', async () => {
    server.use(
      http.delete(`${DIVIDA_ATIVA}/v1/imoveis/:inscricao`, () =>
        HttpResponse.json(
          {
            errors: [
              {
                code: 'REQUERIMENTO_EM_ANDAMENTO',
                message:
                  'Não é possível excluir: há um requerimento em andamento para este imóvel.',
              },
            ],
          },
          { status: 409 }
        )
      )
    )

    const resultado = await excluirImovel('05217663')

    expect(resultado).toEqual({
      success: false,
      error:
        'Não é possível excluir: há um requerimento em andamento para este imóvel.',
      status: 409,
    })
  })

  test('revalida a lista e a landing depois de excluir', async () => {
    server.use(
      http.delete(
        `${DIVIDA_ATIVA}/v1/imoveis/:inscricao`,
        () => new HttpResponse(null, { status: 204 })
      )
    )

    await excluirImovel('05217663')

    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith(
      '/divida-ativa/imoveis'
    )
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/divida-ativa')
  })

  test('não chama a API com uma inscrição fora do formato', async () => {
    let chamou = false

    server.use(
      http.delete(`${DIVIDA_ATIVA}/v1/imoveis/:inscricao`, () => {
        chamou = true
        return new HttpResponse(null, { status: 204 })
      })
    )

    const resultado = await excluirImovel('12')

    expect(chamou).toBe(false)
    expect(resultado.success).toBe(false)
  })
})
