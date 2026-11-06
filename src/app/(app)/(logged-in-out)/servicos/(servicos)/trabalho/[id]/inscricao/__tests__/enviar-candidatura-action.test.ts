import { getUserInfoFromToken } from '@/lib/user-info'
import { TEST_ENV } from '@/test/mocks/env'
import { MOCK_TIPOS_PCD } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { enviarCandidatura } from '../enviar-candidatura-action'

const COURSES_BASE_URL = TEST_ENV.COURSES_BASE_API_URL
const RMI_BASE_URL = TEST_ENV.BASE_API_URL_RMI

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

  describe('critério PcD com "Todos os tipos"', () => {
    function vagaExclusivaTodosOsTipos(deficiencia: string | null) {
      server.use(
        http.get(
          `${COURSES_BASE_URL}/api/public/empregabilidade/vagas/:id`,
          () =>
            HttpResponse.json(
              {
                id: VAGA_ID,
                titulo: 'Vaga PcD',
                opcao_pcd: 'exclusiva',
                criterios_bloqueio: ['pcd'],
                tipos_pcd: MOCK_TIPOS_PCD.data,
                idiomas_requisito: [],
              },
              { status: 200 }
            )
        ),
        http.get(`${RMI_BASE_URL}/v1/citizen/:cpf`, () =>
          HttpResponse.json(
            { nascimento: { data: '1990-01-01' }, deficiencia },
            { status: 200 }
          )
        )
      )
    }

    test('envia a candidatura de quem declarou deficiência fora dos nomes do catálogo', async () => {
      vagaExclusivaTodosOsTipos('Reabilitado do INSS')

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({ success: true })
    })

    test('bloqueia quem não declarou deficiência com a frase sem os tipos', async () => {
      vagaExclusivaTodosOsTipos('Nenhuma')

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        failedCriterios: [{ slug: 'pcd', label: 'Ser pessoa com deficiência' }],
      })
    })

    test('sem o catálogo de tipos (API fora), mantém a restrição por tipo sem quebrar a candidatura', async () => {
      vagaExclusivaTodosOsTipos('Reabilitado do INSS')
      server.use(
        http.get(`${COURSES_BASE_URL}/api/v1/empregabilidade/tipos-pcd`, () =>
          HttpResponse.json({ error: 'erro' }, { status: 500 })
        )
      )

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        failedCriterios: [
          {
            slug: 'pcd',
            label:
              'Ser pessoa com deficiência (Física, Auditiva, Intelectual, Múltipla ou Visual)',
          },
        ],
      })
    })
  })

  describe('critério experiência em carteira', () => {
    function vagaComExperienciaCarteira(
      experienciaCarteira: string,
      experiencias: unknown,
      criteriosBloqueio: string[] = ['experiencia_carteira']
    ) {
      server.use(
        http.get(
          `${COURSES_BASE_URL}/api/public/empregabilidade/vagas/:id`,
          () =>
            HttpResponse.json(
              {
                id: VAGA_ID,
                titulo: 'Vaga com experiência em carteira',
                experiencia_carteira: experienciaCarteira,
                criterios_bloqueio: criteriosBloqueio,
                idiomas_requisito: [],
              },
              { status: 200 }
            )
        ),
        http.get(
          `${COURSES_BASE_URL}/api/v1/empregabilidade/curriculo/:cpf`,
          () =>
            HttpResponse.json(
              { cpf: '12345678901', experiencias },
              { status: 200 }
            )
        )
      )
    }

    test('soma as experiências em carteira do currículo e envia a candidatura com 6 meses no total', async () => {
      vagaComExperienciaCarteira('minimo_6_meses', [
        { experiencia_comprovada_ct: true, tempo_experiencia_meses: 4 },
        { experiencia_comprovada_ct: false, tempo_experiencia_meses: 24 },
        null,
        { experiencia_comprovada_ct: true, tempo_experiencia_meses: 2 },
      ])

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({ success: true })
    })

    test('bloqueia com a frase do mínimo de 6 meses quando a soma não chega', async () => {
      vagaComExperienciaCarteira('minimo_6_meses', [
        { experiencia_comprovada_ct: true, tempo_experiencia_meses: 5 },
      ])

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        failedCriterios: [
          {
            slug: 'experiencia_carteira',
            label: 'Ter pelo menos 6 meses de experiência em carteira',
          },
        ],
      })
    })

    test('bloqueia com a frase de qualquer tempo quando o currículo não traz experiências', async () => {
      vagaComExperienciaCarteira('qualquer_tempo', undefined)

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({
        success: false,
        failedCriterios: [
          {
            slug: 'experiencia_carteira',
            label: 'Ter experiência em carteira assinada',
          },
        ],
      })
    })

    test('com o bloqueio desligado, envia a candidatura sem experiência em carteira', async () => {
      vagaComExperienciaCarteira('minimo_6_meses', [], [])

      const result = await enviarCandidatura(VAGA_ID)

      expect(result).toEqual({ success: true })
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
