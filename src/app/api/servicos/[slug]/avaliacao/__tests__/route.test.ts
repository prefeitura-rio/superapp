// @vitest-environment node
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const submitVote = vi.fn()
vi.mock('@/lib/carta-servicos/avaliacao/submit-vote', () => ({
  submitVote: (...args: unknown[]) => submitVote(...args),
}))

import { resetRatingRateLimit } from '@/lib/carta-servicos/avaliacao/rate-limit'
import { VOTER_TOKEN_COOKIE } from '@/lib/carta-servicos/avaliacao/voter-token'
import { POST } from '../route'

const ARTICLE_ID = 'ka089000000BUO5AAO'
const SLUG = 'adocao-de-animais-da-fazenda-modelo'
const EXISTING_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA'

function call(
  body: unknown,
  { slug = SLUG, cookie, ip = '200.1.1.1' } = {} as {
    slug?: string
    cookie?: string
    ip?: string
  }
) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-forwarded-for': ip,
  })
  if (cookie) headers.set('cookie', `${VOTER_TOKEN_COOKIE}=${cookie}`)

  const request = new NextRequest(
    `http://localhost/api/servicos/${slug}/avaliacao`,
    {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }
  )
  return POST(request, { params: Promise.resolve({ slug }) })
}

describe('POST /api/servicos/[slug]/avaliacao', () => {
  beforeEach(() => {
    vi.stubEnv('FEATURE_SALESFORCE', 'true')
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'true')
    submitVote.mockResolvedValue({ ok: true })
    resetRatingRateLimit()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    submitVote.mockReset()
  })

  test('com a flag desligada responde 404 sem chamar o Salesforce', async () => {
    vi.stubEnv('FEATURE_AVALIACAO_SERVICO', 'false')

    const response = await call({ vote: 'up', articleId: ARTICLE_ID })

    expect(response.status).toBe(404)
    expect(submitVote).not.toHaveBeenCalled()
  })

  test('sem FEATURE_SALESFORCE também responde 404', async () => {
    vi.stubEnv('FEATURE_SALESFORCE', 'false')

    const response = await call({ vote: 'up', articleId: ARTICLE_ID })

    expect(response.status).toBe(404)
    expect(submitVote).not.toHaveBeenCalled()
  })

  test('primeiro voto emite o cookie HttpOnly e manda o mesmo token ao Salesforce', async () => {
    const response = await call({ vote: 'up', articleId: ARTICLE_ID })

    expect(response.status).toBe(200)
    const setCookie = response.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain(`${VOTER_TOKEN_COOKIE}=`)
    expect(setCookie).toMatch(/HttpOnly/i)
    expect(setCookie).toMatch(/SameSite=lax/i)
    expect(setCookie).toMatch(/Max-Age=31536000/)

    const token = setCookie.match(
      new RegExp(`${VOTER_TOKEN_COOKIE}=([^;]+)`)
    )?.[1]
    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(submitVote).toHaveBeenCalledWith(
      SLUG,
      { vote: 'up', articleId: ARTICLE_ID },
      token
    )
  })

  test('reaproveita o cookie existente e não emite outro', async () => {
    const response = await call(
      { vote: 'up', articleId: ARTICLE_ID },
      { cookie: EXISTING_TOKEN }
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(submitVote).toHaveBeenCalledWith(
      SLUG,
      expect.anything(),
      EXISTING_TOKEN
    )
  })

  test('cookie forjado com formato inválido é trocado por um token novo', async () => {
    const response = await call(
      { vote: 'up', articleId: ARTICLE_ID },
      { cookie: 'nao-e-um-token' }
    )

    expect(response.headers.get('set-cookie')).toContain(
      `${VOTER_TOKEN_COOKIE}=`
    )
    expect(submitVote.mock.calls[0][2]).not.toBe('nao-e-um-token')
  })

  test.each([
    ['JSON inválido', '{nao e json'],
    [
      'dislike sem motivo',
      { vote: 'down', articleId: ARTICLE_ID, rejectionReasons: [] },
    ],
    ['vote desconhecido', { vote: 'talvez', articleId: ARTICLE_ID }],
  ])('%s → 400 sem chamar o Salesforce', async (_label, body) => {
    const response = await call(body)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ code: 'invalid_payload' })
    expect(submitVote).not.toHaveBeenCalled()
  })

  test('slug com caracteres fora do padrão → 404', async () => {
    const response = await call(
      { vote: 'up', articleId: ARTICLE_ID },
      { slug: '..%2Fadmin' }
    )

    expect(response.status).toBe(404)
    expect(submitVote).not.toHaveBeenCalled()
  })

  test('repassa só o código estável quando o Salesforce falha', async () => {
    submitVote.mockResolvedValue({
      ok: false,
      status: 503,
      code: 'unavailable',
    })

    const response = await call({ vote: 'up', articleId: ARTICLE_ID })

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ code: 'unavailable' })
  })

  test('limita a 20 votos por hora por visitante', async () => {
    for (let index = 0; index < 20; index += 1) {
      const response = await call(
        { vote: 'up', articleId: ARTICLE_ID },
        { cookie: EXISTING_TOKEN, ip: `200.1.1.${index}` }
      )
      expect(response.status).toBe(200)
    }

    const blocked = await call(
      { vote: 'up', articleId: ARTICLE_ID },
      { cookie: EXISTING_TOKEN, ip: '200.1.2.1' }
    )

    expect(blocked.status).toBe(429)
    expect(await blocked.json()).toEqual({ code: 'rate_limited' })
    expect(submitVote).toHaveBeenCalledTimes(20)
  })
})
