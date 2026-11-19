import {
  allowGoogleMapsRequest,
  googleMapsClientIp,
  guardGoogleMapsRequest,
  hasValidSession,
} from '@/lib/google-maps-guard'
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

function base64Url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function syntheticJwt(expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds
  return `${base64Url({ alg: 'none', typ: 'JWT' })}.${base64Url({ exp })}.assinatura`
}

function request(
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {}
): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
  return new NextRequest(
    new URL('/api/address-autocomplete?q=Rua', 'http://localhost:3000'),
    { headers: cookieHeader ? { ...headers, cookie: cookieHeader } : headers }
  )
}

describe('hasValidSession', () => {
  it('recusa sem cookie, com token expirado e com token malformado', () => {
    expect(hasValidSession(request())).toBe(false)
    expect(
      hasValidSession(request({}, { access_token: syntheticJwt(-60) }))
    ).toBe(false)
    expect(hasValidSession(request({}, { access_token: 'nao-e-jwt' }))).toBe(
      false
    )
    expect(
      hasValidSession(request({}, { refresh_token: syntheticJwt(3600) }))
    ).toBe(false)
  })

  it('aceita access_token não expirado', () => {
    expect(
      hasValidSession(request({}, { access_token: syntheticJwt(3600) }))
    ).toBe(true)
  })
})

describe('googleMapsClientIp', () => {
  it('usa o primeiro x-forwarded-for, depois x-real-ip', () => {
    expect(
      googleMapsClientIp(
        request({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' })
      )
    ).toBe('203.0.113.1')
    expect(googleMapsClientIp(request({ 'x-real-ip': '203.0.113.2' }))).toBe(
      '203.0.113.2'
    )
    expect(googleMapsClientIp(request())).toBe('unknown')
  })
})

describe('allowGoogleMapsRequest', () => {
  it('permite 60 requisições por minuto por IP e escopo, depois recusa', () => {
    const now = 1_000_000
    for (let i = 0; i < 60; i++) {
      expect(
        allowGoogleMapsRequest('address_autocomplete', '198.51.100.1', now)
      ).toBe(true)
    }
    expect(
      allowGoogleMapsRequest('address_autocomplete', '198.51.100.1', now)
    ).toBe(false)
    // outro IP e outro escopo têm contadores próprios
    expect(
      allowGoogleMapsRequest('address_autocomplete', '198.51.100.2', now)
    ).toBe(true)
    expect(allowGoogleMapsRequest('cep_lookup', '198.51.100.1', now)).toBe(true)
    // a janela expira
    expect(
      allowGoogleMapsRequest(
        'address_autocomplete',
        '198.51.100.1',
        now + 60_001
      )
    ).toBe(true)
  })
})

describe('guardGoogleMapsRequest', () => {
  it('responde 401 sem sessão, sem consumir o limite', async () => {
    const ip = { 'x-forwarded-for': '198.51.100.10' }
    for (let i = 0; i < 100; i++) {
      const refused = guardGoogleMapsRequest(request(ip), 'cep_lookup')
      expect(refused?.status).toBe(401)
    }
    const refused = guardGoogleMapsRequest(request(ip), 'cep_lookup')
    expect(refused?.headers.get('cache-control')).toContain('no-store')
    expect(await refused?.json()).toEqual({ error: 'Not authenticated' })
    expect(
      guardGoogleMapsRequest(
        request(ip, { access_token: syntheticJwt(3600) }),
        'cep_lookup'
      )
    ).toBeNull()
  })

  it('responde 429 com Retry-After quando a sessão passa do limite', async () => {
    const req = () =>
      request(
        { 'x-forwarded-for': '198.51.100.11' },
        { access_token: syntheticJwt(3600) }
      )
    for (let i = 0; i < 60; i++) {
      expect(guardGoogleMapsRequest(req(), 'address_autocomplete')).toBeNull()
    }
    const refused = guardGoogleMapsRequest(req(), 'address_autocomplete')
    expect(refused?.status).toBe(429)
    expect(refused?.headers.get('retry-after')).toBe('60')
    expect(await refused?.json()).toEqual({ error: 'Too many requests' })
  })
})
