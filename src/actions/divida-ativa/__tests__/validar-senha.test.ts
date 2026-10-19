import { validarSenha } from '@/actions/divida-ativa/validar-senha'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, test } from 'vitest'

const URL_VALIDAR = `${TEST_ENV.BASE_API_URL_DIVIDA_ATIVA}/divida-ativa/validar-senha`

describe('validarSenha', () => {
  test('senha aceita', async () => {
    let corpo: unknown
    server.use(
      http.post(URL_VALIDAR, async ({ request }) => {
        corpo = await request.json()
        return HttpResponse.json({ valida: true, mensagem: null })
      })
    )

    expect(await validarSenha('certa')).toEqual({
      success: true,
      data: { valida: true, mensagem: null },
    })
    expect(corpo).toEqual({ senha: 'certa' })
  })

  // A API responde 200 também para senha recusada: o resultado está em `valida`.
  test('senha recusada vem com 200 e valida: false', async () => {
    server.use(
      http.post(URL_VALIDAR, () =>
        HttpResponse.json({ valida: false, mensagem: 'Senha inválida.' })
      )
    )

    expect(await validarSenha('errada')).toEqual({
      success: true,
      data: { valida: false, mensagem: 'Senha inválida.' },
    })
  })

  test('Keycloak indisponível chega como erro da chamada', async () => {
    server.use(
      http.post(URL_VALIDAR, () =>
        HttpResponse.json(
          {
            error:
              'Validação de senha indisponível no momento. Tente novamente.',
          },
          { status: 503 }
        )
      )
    )

    const resultado = await validarSenha('certa')

    expect(resultado.success).toBe(false)
    expect(!resultado.success && resultado.status).toBe(503)
  })

  test('senha vazia não chama a API', async () => {
    expect(await validarSenha('')).toEqual({
      success: true,
      data: { valida: false, mensagem: 'Por favor, informe a senha.' },
    })
  })
})
