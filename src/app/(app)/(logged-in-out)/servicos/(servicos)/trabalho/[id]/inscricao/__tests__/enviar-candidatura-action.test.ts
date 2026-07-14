import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { enviarCandidatura } from '../enviar-candidatura-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL

const mockGetUserInfoFromToken = vi.mocked(getUserInfoFromToken)

describe('enviarCandidatura', () => {
  const VAGA_ID = 'vaga-abc-123'

  beforeEach(() => {
    mockGetUserInfoFromToken.mockResolvedValue({
      cpf: '12345678901',
      name: 'Test User',
    })
  })

  describe('sucesso', () => {
    test('retorna success: true quando curriculo e candidatura são criados com sucesso', async () => {
      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({ success: true })
    })

    test('inclui respostas de perguntas adicionais no payload quando fornecidas', async () => {
      let capturedPayload: Record<string, unknown> | null = null

      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>
            return HttpResponse.json({ id: 'candidatura-456' }, { status: 201 })
          }
        )
      )

      const respostas = [
        { id_info: 'info-1', resposta: 'Sim' },
        { id_info: 'info-2', resposta: 'Opção A, Opção B' },
      ]

      await enviarCandidatura(VAGA_ID, respostas)

      expect(capturedPayload).toMatchObject({
        id_vaga: VAGA_ID,
        respostas_info_complementares: respostas,
      })
    })

    test('não envia respostas_info_complementares quando array é vazio', async () => {
      let capturedPayload: Record<string, unknown> | null = null

      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          async ({ request }) => {
            capturedPayload = (await request.json()) as Record<string, unknown>
            return HttpResponse.json({ id: 'candidatura-789' }, { status: 201 })
          }
        )
      )

      await enviarCandidatura(VAGA_ID, [])

      expect(capturedPayload).not.toHaveProperty(
        'respostas_info_complementares'
      )
    })
  })

  describe('erros de candidatura', () => {
    test('retorna error com mensagem customizada em status 400 com message', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          () => {
            return HttpResponse.json(
              { message: 'Usuário já inscrito nesta vaga' },
              { status: 400 }
            )
          }
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        error: 'Usuário já inscrito nesta vaga',
      })
    })

    test('retorna error genérico em status 400 sem message', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          () => {
            return HttpResponse.json({}, { status: 400 })
          }
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        error: 'Oops! Algo deu errado.',
      })
    })

    test('retorna error quando API retorna status inesperado (ex: 500)', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            )
          }
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        error: 'Não foi possível enviar sua candidatura.',
      })
    })

    test('retorna error quando ocorre falha de rede', async () => {
      server.use(
        http.post(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/candidaturas`,
          () => HttpResponse.error()
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('erros de currículo', () => {
    test('retorna error quando currículo não é encontrado (status 404)', async () => {
      server.use(
        http.get(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf`,
          () => {
            return HttpResponse.json(
              { message: 'Currículo não encontrado' },
              { status: 404 }
            )
          }
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        error: 'Não foi possível carregar seu currículo.',
      })
    })

    test('retorna error quando falha ao buscar currículo (rede)', async () => {
      server.use(
        http.get(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf`,
          () => HttpResponse.error()
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('erros de autenticação', () => {
    test('retorna error quando CPF não está presente no token', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: undefined as unknown as string,
        name: 'Test User',
      })

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        error: 'CPF não encontrado. Faça login novamente.',
      })
    })
  })
})
