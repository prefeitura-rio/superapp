import { saveCookieConsent } from '@/lib/cookie-consent/browser'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConsentGatedAnalytics } from '../consent-gated-analytics'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga" data-ga-id={gaId} />
  ),
}))

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

function renderAnalytics() {
  return render(<ConsentGatedAnalytics gaId="G-TESTE" />)
}

beforeEach(() => {
  clearCookies()
  localStorage.clear()
  window.dataLayer = []
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(null)))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ConsentGatedAnalytics', () => {
  it('sem escolha não carrega o GA', () => {
    renderAnalytics()

    expect(screen.queryByTestId('ga')).not.toBeInTheDocument()
  })

  it('com recusa não carrega o GA', () => {
    saveCookieConsent({ analytics: false })
    renderAnalytics()

    expect(screen.queryByTestId('ga')).not.toBeInTheDocument()
  })

  it('o Consent Mode padrão entra no dataLayer negando tudo', () => {
    renderAnalytics()

    const first = Array.from(window.dataLayer?.[0] as ArrayLike<unknown>)
    expect(first).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      },
    ])
  })

  it('com consentimento de análise carrega o GA', () => {
    saveCookieConsent({ analytics: true })
    renderAnalytics()

    expect(screen.getByTestId('ga')).toHaveAttribute('data-ga-id', 'G-TESTE')
  })

  it('sem ID do GA configurado não carrega nada, mesmo com consentimento', () => {
    saveCookieConsent({ analytics: true })
    render(<ConsentGatedAnalytics />)

    expect(screen.queryByTestId('ga')).not.toBeInTheDocument()
  })

  it('carrega assim que o cidadão aceita, sem recarregar a página', () => {
    renderAnalytics()
    expect(screen.queryByTestId('ga')).not.toBeInTheDocument()

    act(() => {
      saveCookieConsent({ analytics: true })
    })

    expect(screen.getByTestId('ga')).toBeInTheDocument()
  })

  it('na carga apaga cookies do Hotjar e do GA de quem não consentiu', () => {
    document.cookie = '_hjSessionUser_6494379=abc; Path=/'
    document.cookie = '_ga=GA1.1.antigo; Path=/'
    localStorage.setItem('_hjSessionStorageTest', '1')

    renderAnalytics()

    expect(cookieNames().filter(name => /^_(hj|ga)/.test(name))).toEqual([])
    expect(localStorage.getItem('_hjSessionStorageTest')).toBeNull()
  })
})
