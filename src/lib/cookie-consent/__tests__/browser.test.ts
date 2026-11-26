import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanUpTrackingData,
  getCookieConsent,
  hasAnalyticsConsent,
  saveCookieConsent,
  subscribeCookieConsent,
} from '../browser'
import { COOKIE_CONSENT_COOKIE, COOKIE_CONSENT_VERSION } from '../consent'

function clearCookies() {
  for (const row of document.cookie.split(';')) {
    const name = row.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`
  }
}

function cookieNames() {
  return document.cookie
    .split(';')
    .map(row => row.split('=')[0]?.trim())
    .filter(Boolean)
}

const fetchMock = vi.fn(() => Promise.resolve(new Response(null)))

beforeEach(() => {
  clearCookies()
  localStorage.clear()
  sessionStorage.clear()
  window.dataLayer = []
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockClear()
})

describe('consentimento de cookies no navegador', () => {
  it('sem cookie não há escolha nem consentimento de análise', () => {
    expect(getCookieConsent()).toBeNull()
    expect(hasAnalyticsConsent()).toBe(false)
  })

  it('grava a escolha com versão e data, e avisa quem está ouvindo', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeCookieConsent(listener)

    const { record, revoked } = saveCookieConsent({ analytics: true })
    unsubscribe()

    expect(revoked).toEqual([])
    expect(record.version).toBe(COOKIE_CONSENT_VERSION)
    expect(Number.isNaN(Date.parse(record.updatedAt))).toBe(false)
    expect(document.cookie).toContain(`${COOKIE_CONSENT_COOKIE}=`)
    expect(getCookieConsent()).toEqual(record)
    expect(hasAnalyticsConsent()).toBe(true)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('devolve o mesmo objeto enquanto o cookie não muda (estável para useSyncExternalStore)', () => {
    saveCookieConsent({ analytics: false })
    expect(getCookieConsent()).toBe(getCookieConsent())
  })

  it('atualiza o Consent Mode do Google sem nunca liberar publicidade', () => {
    saveCookieConsent({ analytics: true })

    const last = Array.from(window.dataLayer?.at(-1) as ArrayLike<unknown>)
    expect(last).toEqual([
      'consent',
      'update',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      },
    ])
  })

  it('registra a escolha no servidor sem dados pessoais', () => {
    saveCookieConsent({ analytics: false })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/cookies/consent',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          version: COOKIE_CONSENT_VERSION,
          analytics: false,
        }),
      })
    )
  })

  it('ao revogar, apaga os cookies e o armazenamento do Google Analytics', () => {
    saveCookieConsent({ analytics: true })
    document.cookie = '_ga=GA1.1.123; Path=/'
    document.cookie = '_ga_6FY8VVMJ5T=GS1.1.1; Path=/'
    document.cookie = 'access_token=jwt; Path=/'
    localStorage.setItem('theme', 'dark')

    const { revoked } = saveCookieConsent({ analytics: false })

    expect(revoked).toEqual(['analytics'])
    expect(cookieNames()).not.toContain('_ga')
    expect(cookieNames()).not.toContain('_ga_6FY8VVMJ5T')
    // Cookies necessários e preferências ficam.
    expect(cookieNames()).toContain('access_token')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('recusar na primeira escolha também apaga cookies do GA de antes do banner', () => {
    document.cookie = '_ga=GA1.1.antigo; Path=/'

    const { revoked } = saveCookieConsent({ analytics: false })

    // Não é revogação (não recarrega a página), mas limpa mesmo assim.
    expect(revoked).toEqual([])
    expect(cookieNames()).not.toContain('_ga')
  })
})

describe('cleanUpTrackingData (carga do app)', () => {
  it('apaga o que o Hotjar deixou, de todo visitante', () => {
    saveCookieConsent({ analytics: true })
    document.cookie = '_hjSessionUser_6494379=abc; Path=/'
    document.cookie = '_hjSession_6494379=def; Path=/'
    localStorage.setItem('_hjSessionStorageTest', '1')
    sessionStorage.setItem('_hjViewportId', 'x')
    document.cookie = '_ga=GA1.1.123; Path=/'

    cleanUpTrackingData()

    expect(cookieNames().filter(name => name.startsWith('_hj'))).toEqual([])
    expect(localStorage.getItem('_hjSessionStorageTest')).toBeNull()
    expect(sessionStorage.getItem('_hjViewportId')).toBeNull()
    // Com consentimento de análise, o GA fica.
    expect(cookieNames()).toContain('_ga')
  })

  it('sem consentimento de análise, apaga cookies antigos do GA', () => {
    document.cookie = '_ga=GA1.1.antigo; Path=/'
    document.cookie = '_ga_6FY8VVMJ5T=GS1.1.1; Path=/'
    document.cookie = 'access_token=jwt; Path=/'

    cleanUpTrackingData()

    expect(cookieNames()).not.toContain('_ga')
    expect(cookieNames()).not.toContain('_ga_6FY8VVMJ5T')
    expect(cookieNames()).toContain('access_token')
  })
})
