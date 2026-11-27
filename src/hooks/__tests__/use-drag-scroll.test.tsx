import { MostAccessedScrollContainer } from '@/app/components/most-accessed-scroll-container'
import { fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalMatchMedia = window.matchMedia

beforeEach(() => {
  // Arraste com mouse só vale em ponteiro fino (desktop).
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(pointer: fine)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

function renderContainer() {
  const { container } = render(
    <MostAccessedScrollContainer>
      <a href="/servicos/iptu">
        <img src="https://example.com/iptu.png" alt="" />
        IPTU
      </a>
    </MostAccessedScrollContainer>
  )
  const scroller = container.firstElementChild as HTMLDivElement
  const link = container.querySelector('a') as HTMLAnchorElement
  const image = container.querySelector('img') as HTMLImageElement
  return { scroller, link, image }
}

describe('useDragScroll (faixa "Mais acessados")', () => {
  it('mostra o cursor de arraste ao apertar o botão e o devolve ao soltar', () => {
    const { scroller } = renderContainer()

    fireEvent.mouseDown(scroller, { pageX: 100 })
    expect(scroller.style.cursor).toBe('grabbing')

    fireEvent.mouseUp(scroller)
    expect(scroller.style.cursor).toBe('')
  })

  it('cancela o drag nativo do navegador sobre o ícone e sobre o link do cartão', () => {
    const { image, link } = renderContainer()

    // fireEvent devolve false quando o evento teve o default cancelado.
    expect(fireEvent.dragStart(image)).toBe(false)
    expect(fireEvent.dragStart(link)).toBe(false)
  })

  it('encerra o arraste quando o mouseup chega só à window, fora do contêiner', () => {
    const { scroller, image } = renderContainer()

    fireEvent.mouseDown(image, { pageX: 100 })
    expect(scroller.style.cursor).toBe('grabbing')

    fireEvent.mouseUp(window)
    expect(scroller.style.cursor).toBe('')

    // Sem arraste ativo, mover o mouse não rola a faixa.
    scroller.scrollLeft = 0
    fireEvent.mouseMove(scroller, { pageX: 20 })
    expect(scroller.scrollLeft).toBe(0)
  })

  it('para de escutar a window quando o contêiner sai da tela', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(
      <MostAccessedScrollContainer>
        <span>conteúdo</span>
      </MostAccessedScrollContainer>
    )

    unmount()
    expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
    removeSpy.mockRestore()
  })
})
