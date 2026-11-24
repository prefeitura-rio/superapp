import {
  type BrowserWithBrands,
  restoreBrowser,
  stubBrowser,
} from '@/test/browser-brands'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LogoutButton } from '../logout-button'

const GOVBR_LOGOUT_PREFIX =
  'https://sso.example.gov.br/logout?post_logout_redirect_uri='
const SF_LOGOUT_URL =
  'https://1746.example.rio/solicitacaovforcesite/secur/logout.jsp'

describe('LogoutButton', () => {
  const assign = vi.fn()
  const fetchMock = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', 'https://sso.example.gov.br/')
    vi.stubEnv('NEXT_PUBLIC_HOME_URL', 'https://app.example.rio/')
    vi.stubEnv('NEXT_PUBLIC_1746_LOGOUT_URL', SF_LOGOUT_URL)
    // Por padrão, Google Chrome (logout do Gov.br no iframe). Os outros
    // navegadores estão em "fora do Google Chrome", no fim do arquivo.
    stubBrowser('chrome')
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
    restoreBrowser()
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

  it('encerra a sessão pela API, faz logout do 1746 e do Gov.br e vai para o sso-logout', async () => {
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    expect(screen.getByText('Saindo...')).toBeInTheDocument()

    await waitFor(() => expect(govbrIframe()).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
    expect(fetchMock).toHaveBeenCalledWith(SF_LOGOUT_URL, {
      mode: 'no-cors',
      credentials: 'include',
      cache: 'no-store',
      signal: expect.any(AbortSignal),
    })
    const iframe = govbrIframe() as HTMLIFrameElement
    expect(iframe.style.display).toBe('none')
    expect(assign).not.toHaveBeenCalled()

    fireEvent.load(iframe)

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
    expect(assign).toHaveBeenCalledTimes(1)
    expect(govbrIframe()).toBeNull()
  })

  it('vai para o sso-logout mesmo se o iframe do Gov.br não carregar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    await waitFor(() => expect(govbrIframe()).not.toBeNull())

    await vi.advanceTimersByTimeAsync(5000)

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
    expect(assign).toHaveBeenCalledTimes(1)
  })

  it('sem Gov.br configurado, ainda encerra o 1746 e vai para o sso-logout', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
    expect(document.querySelector('iframe')).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(SF_LOGOUT_URL, expect.any(Object))
  })

  it('sem 1746 configurado, ainda faz o logout do Gov.br e vai para o sso-logout', async () => {
    vi.stubEnv('NEXT_PUBLIC_1746_LOGOUT_URL', '')
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))
    await waitFor(() => expect(govbrIframe()).not.toBeNull())

    fireEvent.load(govbrIframe() as HTMLIFrameElement)

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
    expect(fetchMock).not.toHaveBeenCalledWith(
      SF_LOGOUT_URL,
      expect.any(Object)
    )
  })

  it('se o 1746 falhar, ainda vai para o sso-logout', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')
    fetchMock.mockImplementation((url: string) =>
      url === SF_LOGOUT_URL
        ? Promise.reject(new TypeError('Failed to fetch'))
        : Promise.resolve(new Response(null, { status: 204 }))
    )
    render(<LogoutButton />)

    fireEvent.click(screen.getByText('Sair'))

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
    )
    expect(fetchMock).toHaveBeenCalledWith(SF_LOGOUT_URL, expect.any(Object))
  })

  it('sem AbortSignal.timeout (Safari < 16), ainda encerra o 1746 com tempo limite', async () => {
    vi.stubEnv('NEXT_PUBLIC_GOVBR_BASE_URL', '')
    const originalTimeout = AbortSignal.timeout
    Object.defineProperty(AbortSignal, 'timeout', {
      configurable: true,
      writable: true,
      value: undefined,
    })

    try {
      render(<LogoutButton />)
      fireEvent.click(screen.getByText('Sair'))

      await waitFor(() =>
        expect(assign).toHaveBeenCalledWith('/api/auth/sso-logout')
      )
      expect(fetchMock).toHaveBeenCalledWith(SF_LOGOUT_URL, {
        mode: 'no-cors',
        credentials: 'include',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      })
    } finally {
      Object.defineProperty(AbortSignal, 'timeout', {
        configurable: true,
        writable: true,
        value: originalTimeout,
      })
    }
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
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })

  describe('fora do Google Chrome', () => {
    const GOVBR_SSO_LOGOUT = '/api/auth/sso-logout/govbr'

    beforeEach(() => {
      restoreBrowser()
    })

    it.each<[string, BrowserWithBrands | null]>([
      ['Safari, Firefox ou Chrome no iOS (sem userAgentData)', null],
      ['Brave', 'brave'],
      ['Edge', 'edge'],
      ['Samsung Internet', 'samsungInternet'],
      ['WebView do Android', 'androidWebView'],
    ])(
      '%s: encerra a sessão pela API e o 1746 e vai para o logout do Gov.br por navegação de topo, sem iframe',
      async (_name, browser) => {
        if (browser) stubBrowser(browser)
        render(<LogoutButton />)
        const createElement = vi.spyOn(document, 'createElement')

        fireEvent.click(screen.getByText('Sair'))
        expect(screen.getByText('Saindo...')).toBeInTheDocument()

        await waitFor(() =>
          expect(assign).toHaveBeenCalledWith(GOVBR_SSO_LOGOUT)
        )
        expect(assign).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
        expect(fetchMock).toHaveBeenCalledWith(SF_LOGOUT_URL, {
          mode: 'no-cors',
          credentials: 'include',
          cache: 'no-store',
          signal: expect.any(AbortSignal),
        })
        expect(createElement).not.toHaveBeenCalledWith('iframe')
        expect(document.querySelector('iframe')).toBeNull()
      }
    )

    it('espera o 1746 terminar antes da navegação de topo, que cancelaria o fetch', async () => {
      let finish1746: (response: Response) => void = () => {}
      fetchMock.mockImplementation((url: string) =>
        url === SF_LOGOUT_URL
          ? new Promise<Response>(resolve => {
              finish1746 = resolve
            })
          : Promise.resolve(new Response(null, { status: 204 }))
      )
      render(<LogoutButton />)

      fireEvent.click(screen.getByText('Sair'))
      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          SF_LOGOUT_URL,
          expect.any(Object)
        )
      )
      expect(assign).not.toHaveBeenCalled()

      finish1746(new Response(null, { status: 200 }))

      await waitFor(() => expect(assign).toHaveBeenCalledWith(GOVBR_SSO_LOGOUT))
    })

    it('se o 1746 falhar, ainda vai para o logout do Gov.br', async () => {
      fetchMock.mockImplementation((url: string) =>
        url === SF_LOGOUT_URL
          ? Promise.reject(new TypeError('Failed to fetch'))
          : Promise.resolve(new Response(null, { status: 204 }))
      )
      render(<LogoutButton />)

      fireEvent.click(screen.getByText('Sair'))

      await waitFor(() => expect(assign).toHaveBeenCalledWith(GOVBR_SSO_LOGOUT))
    })

    it('sem 1746 configurado, vai direto para o logout do Gov.br', async () => {
      vi.stubEnv('NEXT_PUBLIC_1746_LOGOUT_URL', '')
      render(<LogoutButton />)

      fireEvent.click(screen.getByText('Sair'))

      await waitFor(() => expect(assign).toHaveBeenCalledWith(GOVBR_SSO_LOGOUT))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout')
    })

    it('se a API de logout falhar, não sai da página e libera o botão', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      fetchMock.mockRejectedValue(new Error('offline'))
      render(<LogoutButton />)

      fireEvent.click(screen.getByText('Sair'))

      expect(await screen.findByText('Sair')).toBeInTheDocument()
      expect(assign).not.toHaveBeenCalled()
    })

    it('ignora cliques repetidos durante o logout', async () => {
      render(<LogoutButton />)

      fireEvent.click(screen.getByText('Sair'))
      fireEvent.click(screen.getByText('Saindo...'))

      await waitFor(() => expect(assign).toHaveBeenCalledWith(GOVBR_SSO_LOGOUT))
      expect(assign).toHaveBeenCalledTimes(1)
      expect(
        fetchMock.mock.calls.filter(([url]) => url === '/api/auth/logout')
      ).toHaveLength(1)
    })
  })
})
