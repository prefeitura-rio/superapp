import { saveCookieConsent } from '@/lib/cookie-consent/browser'
import { sendGAEvent as sendGAEventToDataLayer } from '@next/third-parties/google'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendGAEvent } from '../send-ga-event'
import { trackUserLogin } from '../tracker'

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }))

function clearCookies() {
  for (const row of document.cookie.split(';')) {
    const name = row.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`
  }
}

beforeEach(() => {
  clearCookies()
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(null)))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.mocked(sendGAEventToDataLayer).mockClear()
})

describe('sendGAEvent com consentimento', () => {
  it('sem consentimento de análise o evento é descartado', () => {
    sendGAEvent('event', 'banner_click', { banner: 'x' })
    expect(sendGAEventToDataLayer).not.toHaveBeenCalled()

    saveCookieConsent({ analytics: false })
    sendGAEvent('event', 'banner_click', { banner: 'x' })
    expect(sendGAEventToDataLayer).not.toHaveBeenCalled()
  })

  it('com consentimento de análise repassa os mesmos argumentos', () => {
    saveCookieConsent({ analytics: true })
    sendGAEvent('event', 'banner_click', { banner: 'x' })

    expect(sendGAEventToDataLayer).toHaveBeenCalledWith(
      'event',
      'banner_click',
      { banner: 'x' }
    )
  })
})

describe('trackUserLogin', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_ANALYTICS_ID', 'G-TESTE')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    window.gtag = undefined
  })

  it('não envia nada sem consentimento', () => {
    const gtag = vi.fn()
    window.gtag = gtag

    expect(trackUserLogin('/')).toBe(false)
    expect(gtag).not.toHaveBeenCalled()
  })

  it('envia só o evento de login, sem nome, CPF ou e-mail', () => {
    saveCookieConsent({ analytics: true })
    const gtag = vi.fn()
    window.gtag = gtag

    expect(trackUserLogin('/carteira')).toBe(true)
    expect(gtag).toHaveBeenCalledTimes(1)
    const [, eventName, payload] = gtag.mock.calls[0]
    expect(eventName).toBe('user_login')
    expect(Object.keys(payload).sort()).toEqual(
      ['debug_mode', 'page_path', 'timestamp', 'user_authenticated'].sort()
    )
  })
})
