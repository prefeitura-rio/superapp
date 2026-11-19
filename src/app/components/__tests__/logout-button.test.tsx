import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoutButton } from '../logout-button'

const GOVBR_LOGOUT_PREFIX =
  'https://sso.example.gov.br/logout?post_logout_redirect_uri='

describe('LogoutButton', () => {
  const assign = vi.fn()
  const fetchMock = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br/')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://app.example.rio/')
    assign.mockReset()
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
    document.body.innerHTML = ''
  })

  function govbrIframe() {
    return document.querySelector<HTMLIFrameElement>(
      `iframe[src^="${GOVBR_LOGOUT_PREFIX}"]`
    )
  }

  it('encerra a sessão pela API, faz o logout do Gov.br num iframe oculto e só então vai para a home', async () => {
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    expect(screen.getByText('Saindo...')).toBeInTheDocument()

    await waitFor(() => expect(govbrIframe()).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
    const iframe = govbrIframe() as HTMLIFrameElement
    expect(iframe.style.display).toBe('none')
    expect(assign).not.toHaveBeenCalled()

    fireEvent.load(iframe)

    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign).toHaveBeenCalledWith('https://app.example.rio/')
    expect(govbrIframe()).toBeNull()
  })

  it('vai para a home mesmo se o iframe do Gov.br não carregar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    await waitFor(() => expect(govbrIframe()).not.toBeNull())

    await vi.advanceTimersByTimeAsync(5000)

    expect(assign).toHaveBeenCalledTimes(1)
    expect(assign).toHaveBeenCalledWith('https://app.example.rio/')
  })

  it('sem Gov.br configurado, vai direto para a home', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://app.example.rio/')
    )
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('se a API de logout falhar, não sai da página e libera o botão', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchMock.mockRejectedValue(new Error('offline'))
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))

    expect(await screen.findByText('Sair')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('ignora cliques repetidos durante o logout', async () => {
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    fireEvent.click(screen.getByText('Saindo...'))

    await waitFor(() => expect(govbrIframe()).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })
})
