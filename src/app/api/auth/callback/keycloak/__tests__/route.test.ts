import { LOGIN_MARKER_COOKIE } from '@/lib/analytics/login-marker'
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_VERSION,
  serializeCookieConsent,
} from '@/lib/cookie-consent/consent'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

// JWT com nome, CPF e e-mail no payload: nada disso pode sair no marcador.
const ACCESS_TOKEN = [
  'eyJhbGciOiJIUzI1NiJ9',
  btoa(
    JSON.stringify({
      name: 'Maria da Silva',
      preferred_username: '12345678901',
      email: 'maria@example.com',
    })
  ),
  'assinatura',
].join('.')

function callbackRequest(consent?: { analytics: boolean }) {
  const headers = new Headers()
  if (consent) {
    headers.set(
      'cookie',
      `${COOKIE_CONSENT_COOKIE}=${serializeCookieConsent({
        version: COOKIE_CONSENT_VERSION,
        updatedAt: '2026-11-26T12:00:00.000Z',
        ...consent,
      })}`
    )
  }
  return new NextRequest(
    'http://localhost:3000/api/auth/callback/keycloak?code=abc&state=%2Fcarteira',
    { headers }
  )
}

beforeEach(() => {
  vi.stubEnv(
    'NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL',
    'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
  )
  vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'superapp')
  vi.stubEnv('IDENTIDADE_CARIOCA_CLIENT_SECRET', 'segredo')
  vi.stubEnv(
    'NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI',
    'http://localhost:3000/api/auth/callback/keycloak'
  )
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      Response.json({ access_token: ACCESS_TOKEN, refresh_token: 'refresh' })
    )
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('callback do Keycloak — marcador de login para o GA', () => {
  it('sem consentimento de análise não cria o marcador', async () => {
    const res = await GET(callbackRequest())

    expect(res.headers.get('location')).toBe('http://localhost:3000/carteira')
    expect(res.cookies.get('access_token')?.value).toBe(ACCESS_TOKEN)
    expect(res.cookies.get(LOGIN_MARKER_COOKIE)).toBeUndefined()
  })

  it('com recusa de análise não cria o marcador', async () => {
    const res = await GET(callbackRequest({ analytics: false }))

    expect(res.cookies.get(LOGIN_MARKER_COOKIE)).toBeUndefined()
  })

  it('com consentimento cria o marcador sem nenhum dado pessoal', async () => {
    const res = await GET(callbackRequest({ analytics: true }))

    const marker = res.cookies.get(LOGIN_MARKER_COOKIE)
    expect(marker?.value).toBe('1')
    const setCookie = res.headers.get('set-cookie') ?? ''
    for (const pii of ['Maria', '12345678901', '123.456.789-01', 'maria@']) {
      expect(setCookie).not.toContain(pii)
    }
  })
})
