// @vitest-environment node
import { TEST_ENV } from '@/test/mocks/env'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, test } from 'vitest'
import {
  customFetchPrefRioCartaVotacao,
  resetPrefRioCartaVotacaoTokenCache,
} from '../../custom-fetch-pref-rio-carta-votacao'

const TOKEN_URL = TEST_ENV.SALESFORCE_VOTACAO_TOKEN_URL
const VOTE_URL = `${TEST_ENV.SALESFORCE_VOTACAO_API_URL}/services/servico-teste/vote`

type FetchResult = { status: number; data: unknown }

const invalidSession = () =>
  HttpResponse.json(
    [
      {
        message: 'Session expired or invalid',
        errorCode: 'INVALID_SESSION_ID',
      },
    ],
    { status: 401 }
  )

/** O Apex responde com este Content-Type inválido; o corpo é JSON mesmo assim. */
const octetstream = (body: unknown, status = 200) =>
  new HttpResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/octetstream' },
  })

function mockToken(tokens: string[]) {
  const issued: string[] = []
  server.use(
    http.post(TOKEN_URL, async ({ request }) => {
      const form = new URLSearchParams(await request.text())
      expect(form.get('grant_type')).toBe('client_credentials')
      expect(form.get('client_id')).toBe(TEST_ENV.SALESFORCE_VOTACAO_CLIENT_ID)
      expect(form.get('client_secret')).toBe(
        TEST_ENV.SALESFORCE_VOTACAO_CLIENT_SECRET
      )
      const token = tokens[issued.length] ?? 'token-extra'
      issued.push(token)
      return HttpResponse.json({ access_token: token, token_type: 'Bearer' })
    })
  )
  return issued
}

function vote() {
  return customFetchPrefRioCartaVotacao<FetchResult>(
    '/services/servico-teste/vote',
    { method: 'POST', body: JSON.stringify({ vote: 'up' }) }
  )
}

describe('customFetchPrefRioCartaVotacao', () => {
  beforeEach(() => {
    resetPrefRioCartaVotacaoTokenCache()
  })

  test('pede o token uma vez e reaproveita nas chamadas seguintes', async () => {
    const issued = mockToken(['token-1'])
    const authHeaders: (string | null)[] = []
    server.use(
      http.post(VOTE_URL, ({ request }) => {
        authHeaders.push(request.headers.get('authorization'))
        return octetstream({ data: { up: 1, down: 0, score: 1 } })
      })
    )

    await vote()
    await vote()

    expect(issued).toEqual(['token-1'])
    expect(authHeaders).toEqual(['Bearer token-1', 'Bearer token-1'])
  })

  test('lê como JSON a resposta do Apex com Content-Type application/octetstream', async () => {
    mockToken(['token-1'])
    server.use(
      http.post(VOTE_URL, () =>
        octetstream({ data: { up: 1, down: 0, score: 1 } })
      )
    )

    const response = await vote()

    expect(response).toMatchObject({
      status: 200,
      data: { data: { up: 1, down: 0, score: 1 } },
    })
  })

  test('em 401 INVALID_SESSION_ID renova o token e repete uma vez', async () => {
    const issued = mockToken(['token-velho', 'token-novo'])
    const authHeaders: (string | null)[] = []
    server.use(
      http.post(VOTE_URL, ({ request }) => {
        const auth = request.headers.get('authorization')
        authHeaders.push(auth)
        return auth === 'Bearer token-velho'
          ? invalidSession()
          : octetstream({ data: { up: 1, down: 0, score: 1 } })
      })
    )

    const response = await vote()

    expect(response.status).toBe(200)
    expect(issued).toEqual(['token-velho', 'token-novo'])
    expect(authHeaders).toEqual(['Bearer token-velho', 'Bearer token-novo'])
  })

  test('não entra em loop se o token novo também for recusado', async () => {
    mockToken(['token-1', 'token-2', 'token-3'])
    let calls = 0
    server.use(
      http.post(VOTE_URL, () => {
        calls += 1
        return invalidSession()
      })
    )

    const response = await vote()

    expect(response.status).toBe(401)
    expect(calls).toBe(2)
  })

  test('401 do próprio Apex (formato do contrato) não renova o token', async () => {
    const issued = mockToken(['token-1', 'token-2'])
    server.use(
      http.post(VOTE_URL, () =>
        octetstream({ error: { code: 'UNAUTHORIZED', message: 'guest' } }, 401)
      )
    )

    const response = await vote()

    expect(response.status).toBe(401)
    expect(issued).toEqual(['token-1'])
  })

  test('falha ao emitir o token lança erro', async () => {
    server.use(
      http.post(TOKEN_URL, () =>
        HttpResponse.json({ error: 'invalid_client' }, { status: 400 })
      )
    )

    await expect(vote()).rejects.toThrow(/invalid_client/)
  })
})
