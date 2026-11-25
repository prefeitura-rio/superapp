// @vitest-environment node
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { resetPrefRioCartaVotacaoTokenCache } from '../../../../../custom-fetch-pref-rio-carta-votacao'
import { submitVote } from '../submit-vote'

/**
 * Integração submitVote → cliente Orval → mutator → Salesforce simulado (MSW).
 * Nada é mockado no nosso código: só a rede.
 */

const SLUG = 'adocao-de-animais-da-fazenda-modelo'
const ARTICLE_ID = 'ka089000000BUO5AAO'
const VOTER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA'
const TOKEN_URL = TEST_ENV.SALESFORCE_VOTACAO_TOKEN_URL
const VOTE_URL = `${TEST_ENV.SALESFORCE_VOTACAO_API_URL}/services/${SLUG}/vote`

/** Resposta do Apex como no contrato oficial (`application/json`). */
const apex = (body: unknown, status: number) =>
  HttpResponse.json(body as Record<string, unknown>, { status })

function mockSalesforce(respond: () => Response) {
  const requests: { body: unknown; authorization: string | null }[] = []
  server.use(
    http.post(TOKEN_URL, () =>
      HttpResponse.json({ access_token: 'token-1', token_type: 'Bearer' })
    ),
    http.post(VOTE_URL, async ({ request }) => {
      requests.push({
        body: await request.json(),
        authorization: request.headers.get('authorization'),
      })
      return respond()
    })
  )
  return requests
}

describe('submitVote', () => {
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetPrefRioCartaVotacaoTokenCache()
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  test('like: envia o corpo do contrato com o token do visitante e devolve ok', async () => {
    const requests = mockSalesforce(() =>
      apex({ data: { up: 3, down: 1, score: 0.75 } }, 200)
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: true })
    expect(requests).toEqual([
      {
        authorization: 'Bearer token-1',
        body: { vote: 'up', articleId: ARTICLE_ID, voterToken: VOTER_TOKEN },
      },
    ])
  })

  test('dislike: envia motivos e comentário só com "Outro motivo"', async () => {
    const requests = mockSalesforce(() =>
      apex({ data: { up: 0, down: 1, score: 0 } }, 200)
    )

    const result = await submitVote(
      SLUG,
      {
        vote: 'down',
        articleId: ARTICLE_ID,
        rejectionReasons: ['Informacao_incorreta', 'Outro_motivo'],
        rejectionDescription: '  O telefone mudou.  ',
      },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: true })
    expect(requests[0].body).toEqual({
      vote: 'down',
      articleId: ARTICLE_ID,
      voterToken: VOTER_TOKEN,
      rejectionReasons: ['Informacao_incorreta', 'Outro_motivo'],
      rejectionDescription: 'O telefone mudou.',
    })
  })

  test('400 do Apex vira invalid_payload e registra o código no log', async () => {
    mockSalesforce(() =>
      apex(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'articleId does not belong to slug',
          },
        },
        400
      )
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 400, code: 'invalid_payload' })
    expect(consoleError).toHaveBeenCalledWith(
      '[avaliacao-servico] voto rejeitado pelo Apex',
      expect.objectContaining({ slug: SLUG, code: 'VALIDATION_ERROR' })
    )
  })

  test('404 do Apex vira not_found', async () => {
    mockSalesforce(() =>
      apex({ error: { code: 'NOT_FOUND', message: 'Service not found' } }, 404)
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 404, code: 'not_found' })
  })

  test('erro da plataforma (lista) vira unavailable 503 e loga o errorCode', async () => {
    mockSalesforce(() =>
      HttpResponse.json(
        [{ message: 'Service unavailable', errorCode: 'SERVER_UNAVAILABLE' }],
        { status: 503 }
      )
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
    expect(consoleError).toHaveBeenCalledWith(
      '[avaliacao-servico] falha no Salesforce',
      expect.objectContaining({ status: 503, errorCode: 'SERVER_UNAVAILABLE' })
    )
  })

  test('401 do Apex (não é sessão expirada) vira unavailable sem renovar o token', async () => {
    const requests = mockSalesforce(() =>
      apex({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, 401)
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
    expect(requests).toHaveLength(1)
  })

  test('500 INTERNAL_ERROR do Apex (application/json) vira unavailable e loga o código', async () => {
    const requests = mockSalesforce(() =>
      HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Falha inesperada' } },
        { status: 500 }
      )
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
    expect(requests).toHaveLength(1)
    expect(consoleError).toHaveBeenCalledWith(
      '[avaliacao-servico] falha no Salesforce',
      expect.objectContaining({ status: 500, errorCode: 'INTERNAL_ERROR' })
    )
  })

  test('403 REQUEST_LIMIT_EXCEEDED (limite de API da org) vira unavailable sem repetir', async () => {
    const requests = mockSalesforce(() =>
      HttpResponse.json(
        [
          {
            message: 'TotalRequests Limit exceeded.',
            errorCode: 'REQUEST_LIMIT_EXCEEDED',
          },
        ],
        { status: 403 }
      )
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
    expect(requests).toHaveLength(1)
    expect(consoleError).toHaveBeenCalledWith(
      '[avaliacao-servico] falha no Salesforce',
      expect.objectContaining({
        status: 403,
        errorCode: 'REQUEST_LIMIT_EXCEEDED',
      })
    )
  })

  test('falha de rede vira unavailable e nunca lança', async () => {
    server.use(
      http.post(TOKEN_URL, () =>
        HttpResponse.json({ access_token: 'token-1', token_type: 'Bearer' })
      ),
      http.post(VOTE_URL, () => HttpResponse.error())
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
    expect(consoleError).toHaveBeenCalledWith(
      '[avaliacao-servico] erro ao chamar o Salesforce',
      expect.objectContaining({ slug: SLUG })
    )
  })

  test('falha ao obter o token vira unavailable', async () => {
    server.use(
      http.post(TOKEN_URL, () =>
        HttpResponse.json({ error: 'invalid_client' }, { status: 400 })
      )
    )

    const result = await submitVote(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      VOTER_TOKEN
    )

    expect(result).toEqual({ ok: false, status: 503, code: 'unavailable' })
  })
})
