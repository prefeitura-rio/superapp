import {
  closeCookiePreferences,
  getCookieConsent,
  openCookiePreferences,
  saveCookieConsent,
} from '@/lib/cookie-consent/browser'
import { reloadPage } from '@/lib/cookie-consent/reload'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsent } from '../cookie-consent'
import { CookiePreferencesButton } from '../cookie-preferences-button'

vi.mock('@/lib/cookie-consent/reload', () => ({ reloadPage: vi.fn() }))

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
  act(() => closeCookiePreferences())
  vi.unstubAllGlobals()
  vi.mocked(reloadPage).mockClear()
})

describe('CookieConsent — banner (primeiro nível)', () => {
  it('aparece para quem ainda não escolheu, com rejeitar, aceitar e o link da política', async () => {
    render(<CookieConsent />)

    const banner = await screen.findByRole('region', {
      name: 'Consentimento de cookies',
    })
    expect(
      within(banner)
        .getAllByRole('button')
        .map(button => button.textContent)
    ).toEqual(['Apenas essenciais', 'Aceitar todos'])
    expect(
      within(banner).getByRole('link', { name: 'Política de Cookies' })
    ).toHaveAttribute('href', '/politicas-de-uso-de-cookies')
  })

  it('não promete finalidades que o site não tem (publicidade)', async () => {
    render(<CookieConsent />)

    const banner = await screen.findByRole('region', {
      name: 'Consentimento de cookies',
    })
    expect(banner).toHaveTextContent('analisar nosso tráfego')
    expect(banner).not.toHaveTextContent(/anúncio|publicidade/i)
  })

  it('com uma única categoria opcional, o banner não tem "Personalizar"', async () => {
    render(<CookieConsent />)
    const banner = await screen.findByRole('region', {
      name: 'Consentimento de cookies',
    })

    expect(
      within(banner).queryByRole('button', { name: 'Personalizar' })
    ).not.toBeInTheDocument()
  })

  it('"Apenas essenciais" grava a recusa e o banner some', async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    await user.click(screen.getByRole('button', { name: 'Apenas essenciais' }))

    expect(getCookieConsent()).toMatchObject({ analytics: false })
    expect(
      screen.queryByRole('region', { name: 'Consentimento de cookies' })
    ).not.toBeInTheDocument()
    expect(reloadPage).not.toHaveBeenCalled()
  })

  it('"Aceitar todos" grava o consentimento de análise', async () => {
    const user = userEvent.setup()
    render(<CookieConsent />)
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    await user.click(screen.getByRole('button', { name: 'Aceitar todos' }))

    expect(getCookieConsent()).toMatchObject({ analytics: true })
  })

  it('não aparece para quem já escolheu', () => {
    saveCookieConsent({ analytics: false })
    render(<CookieConsent />)

    expect(
      screen.queryByRole('region', { name: 'Consentimento de cookies' })
    ).not.toBeInTheDocument()
  })
})

describe('CookieConsent — preferências (segundo nível)', () => {
  it('o botão do rodapé abre a categoria Análise desligada por padrão e salva a escolha', async () => {
    const user = userEvent.setup()
    render(
      <>
        <CookieConsent />
        <CookiePreferencesButton />
      </>
    )
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    await user.click(
      screen.getByRole('button', { name: 'Preferências de cookies' })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Preferências de cookies',
    })

    expect(within(dialog).getByText('Sempre ativos')).toBeInTheDocument()
    const switches = within(dialog).getAllByRole('switch')
    expect(switches).toHaveLength(1)
    const analise = within(dialog).getByRole('switch', {
      name: 'Análise (Google Analytics)',
    })
    expect(analise).not.toBeChecked()
    expect(dialog).not.toHaveTextContent(/hotjar|grava[cç][aã]o de sess/i)

    await user.click(analise)
    await user.click(
      within(dialog).getByRole('button', { name: 'Salvar preferências' })
    )

    expect(getCookieConsent()).toMatchObject({ analytics: true })
    expect(
      screen.queryByRole('dialog', { name: 'Preferências de cookies' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Consentimento de cookies' })
    ).not.toBeInTheDocument()
  })

  it('reabre as preferências com a escolha salva', async () => {
    const user = userEvent.setup()
    saveCookieConsent({ analytics: true })
    render(
      <>
        <CookieConsent />
        <CookiePreferencesButton />
      </>
    )

    await user.click(
      screen.getByRole('button', { name: 'Preferências de cookies' })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Preferências de cookies',
    })

    expect(
      within(dialog).getByRole('switch', { name: 'Análise (Google Analytics)' })
    ).toBeChecked()
  })

  it('revogar a análise recarrega a página para descarregar o GA', async () => {
    const user = userEvent.setup()
    saveCookieConsent({ analytics: true })
    render(<CookieConsent />)

    act(() => openCookiePreferences())
    const dialog = await screen.findByRole('dialog', {
      name: 'Preferências de cookies',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Apenas essenciais' })
    )

    expect(getCookieConsent()).toMatchObject({ analytics: false })
    expect(reloadPage).toHaveBeenCalledTimes(1)
  })

  it('com o painel aberto, o banner fica oculto (senão ficaria por cima)', async () => {
    render(<CookieConsent />)
    await screen.findByRole('region', { name: 'Consentimento de cookies' })

    act(() => openCookiePreferences())
    await screen.findByRole('dialog', { name: 'Preferências de cookies' })

    expect(
      screen.getByRole('region', {
        name: 'Consentimento de cookies',
        hidden: true,
      })
    ).toHaveClass('hidden')
  })
})
