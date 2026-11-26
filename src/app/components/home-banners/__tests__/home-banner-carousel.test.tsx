import { sendGAEvent } from '@/lib/analytics/send-ga-event'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HomeBannerCarousel } from '../home-banner-carousel'
import { HOME_BANNER_AUTOPLAY_MS } from '../home-banners'

vi.mock('@/lib/analytics/send-ga-event', () => ({ sendGAEvent: vi.fn() }))
vi.mock('@/providers/auth-status-provider', () => ({
  useAuthStatus: () => ({ isLoggedIn: false, isLoading: false }),
}))

const reducedMotion = { current: false }

function activeLink() {
  // Os banners fora da tela ficam aria-hidden: só o ativo tem papel de link.
  const links = screen.getAllByRole('link')
  expect(links).toHaveLength(1)
  return links[0]
}

function dot(position: number) {
  return screen.getByRole('button', {
    name: `Mostrar banner ${position} de 3`,
  })
}

describe('HomeBannerCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    reducedMotion.current = false
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches:
            query === '(prefers-reduced-motion: reduce)' &&
            reducedMotion.current,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('começa no banner de boas-vindas, com link para /servicos', () => {
    render(<HomeBannerCarousel />)

    const link = activeLink()
    expect(link).toHaveTextContent('Carioca Digital e 1746 agora são Pref.Rio')
    expect(link).toHaveTextContent('Saiba mais')
    expect(link).toHaveAttribute('href', '/servicos')
    expect(dot(1)).toHaveAttribute('aria-current', 'true')
  })

  it('troca sozinho a cada 8 segundos, em repetição contínua', () => {
    render(<HomeBannerCarousel />)

    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS - 1))
    expect(activeLink()).toHaveAttribute('href', '/servicos')

    act(() => vi.advanceTimersByTime(1))
    expect(activeLink()).toHaveAttribute('href', '/servicos/trabalho')
    expect(activeLink()).toHaveTextContent('Ver vagas')

    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS))
    expect(activeLink()).toHaveAttribute('href', '/servicos/cursos')
    expect(activeLink()).toHaveTextContent('Ver cursos')

    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS))
    expect(activeLink()).toHaveAttribute('href', '/servicos')
  })

  it('o indicador mostra o banner correspondente e reinicia a contagem', () => {
    render(<HomeBannerCarousel />)

    act(() => vi.advanceTimersByTime(5000))
    fireEvent.click(dot(3))
    expect(activeLink()).toHaveAttribute('href', '/servicos/cursos')
    expect(dot(3)).toHaveAttribute('aria-current', 'true')
    expect(dot(1)).not.toHaveAttribute('aria-current')

    // Os 3s que faltavam na contagem anterior não trocam o banner.
    act(() => vi.advanceTimersByTime(3000))
    expect(activeLink()).toHaveAttribute('href', '/servicos/cursos')

    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS - 3000))
    expect(activeLink()).toHaveAttribute('href', '/servicos')
  })

  it('pausa com o foco dentro do carrossel e volta a trocar quando o foco sai', () => {
    render(<HomeBannerCarousel />)

    act(() => activeLink().focus())
    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS * 2))
    expect(activeLink()).toHaveAttribute('href', '/servicos')

    // Foco passando de um elemento do carrossel para outro não retoma.
    act(() => dot(1).focus())
    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS))
    expect(activeLink()).toHaveAttribute('href', '/servicos')

    act(() => dot(1).blur())
    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS))
    expect(activeLink()).toHaveAttribute('href', '/servicos/trabalho')
  })

  it('pausa com o mouse em cima e volta a trocar quando o mouse sai', () => {
    render(<HomeBannerCarousel />)
    const carousel = screen.getByRole('region', { name: 'Destaques' })

    fireEvent.mouseEnter(carousel)
    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS * 2))
    expect(activeLink()).toHaveAttribute('href', '/servicos')

    fireEvent.mouseLeave(carousel)
    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS))
    expect(activeLink()).toHaveAttribute('href', '/servicos/trabalho')
  })

  it('tem subtítulo curto até 767px e longo a partir de 768px', () => {
    render(<HomeBannerCarousel />)
    const link = activeLink()

    // jsdom não aplica media queries: confere as duas versões e as classes
    // que escondem cada uma (o layout real é coberto no E2E).
    const short = within(link).getByText('Acesse tudo em um só lugar')
    const wide = within(link).getByText(
      'Acesse tudo o que você precisa da Prefeitura em um só lugar'
    )
    expect(short).toHaveClass('md:hidden')
    expect(wide).toHaveClass('hidden', 'md:inline')
  })

  it('não troca sozinho com movimento reduzido', () => {
    reducedMotion.current = true
    render(<HomeBannerCarousel />)

    act(() => vi.advanceTimersByTime(HOME_BANNER_AUTOPLAY_MS * 2))
    expect(activeLink()).toHaveAttribute('href', '/servicos')

    fireEvent.click(dot(2))
    expect(activeLink()).toHaveAttribute('href', '/servicos/trabalho')
  })

  it('arrastar para o lado troca de banner sem abrir o link', () => {
    render(<HomeBannerCarousel />)
    const link = activeLink()

    fireEvent.pointerDown(link, { clientX: 200 })
    fireEvent.pointerUp(link, { clientX: 100 })
    const clickAllowed = fireEvent.click(link)

    expect(clickAllowed).toBe(false)
    expect(sendGAEvent).not.toHaveBeenCalled()
    expect(activeLink()).toHaveAttribute('href', '/servicos/trabalho')

    fireEvent.pointerDown(activeLink(), { clientX: 100 })
    fireEvent.pointerUp(activeLink(), { clientX: 200 })
    expect(activeLink()).toHaveAttribute('href', '/servicos')
  })

  it('registra o clique no banner no GA', () => {
    render(<HomeBannerCarousel />)
    fireEvent.click(dot(2))
    fireEvent.click(activeLink())

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'banner_click',
      expect.objectContaining({
        id: 'trabalho',
        title: 'Encontre seu trabalho',
        link: '/servicos/trabalho',
        position: 2,
        isLoggedIn: false,
        ehFixo: true,
      })
    )
  })
})
