import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const toastError = vi.fn()
vi.mock('react-hot-toast', () => ({
  default: { error: (message: string) => toastError(message) },
}))

import { DownloadCartaButton } from '../components/download-carta-button'

const HREF = '/api/carta-de-servicos/2951/pdf'
const FILE = 'carta-de-servicos-cet-rio.pdf'

describe('DownloadCartaButton', () => {
  let anchorClick: ReturnType<typeof vi.spyOn>
  let createObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    toastError.mockReset()
    createObjectURL = vi.fn(() => 'blob:carta')
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() })
    // O clique no <a> temporário dispararia navegação no jsdom.
    anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('sem JS continua sendo um link de download para a rota do PDF', () => {
    render(<DownloadCartaButton href={HREF} fileName={FILE} />)
    const link = screen.getByRole('link', { name: 'Baixar documento' })
    expect(link).toHaveAttribute('href', HREF)
    expect(link).toHaveAttribute('download', FILE)
  })

  it('mostra "Gerando documento…" e baixa o arquivo com o nome certo', async () => {
    let resolveFetch: (value: Response) => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>(resolve => {
            resolveFetch = resolve
          })
      )
    )
    const user = userEvent.setup()
    render(<DownloadCartaButton href={HREF} fileName={FILE} />)

    await user.click(screen.getByRole('link', { name: 'Baixar documento' }))

    const busy = await screen.findByRole('link', { name: 'Gerando documento…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(fetch).toHaveBeenCalledWith(HREF)

    resolveFetch(
      new Response(new Blob(['%PDF-'], { type: 'application/pdf' }), {
        status: 200,
      })
    )

    await waitFor(() => expect(anchorClick).toHaveBeenCalledTimes(1))
    const temporary = anchorClick.mock.contexts[0] as HTMLAnchorElement
    expect(temporary.download).toBe(FILE)
    expect(temporary.href).toBe('blob:carta')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByRole('link', { name: 'Baixar documento' })
    ).toHaveAttribute('aria-busy', 'false')
    expect(toastError).not.toHaveBeenCalled()
  })

  it('erro do servidor vira aviso e o botão volta ao normal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 502 }))
    )
    const user = userEvent.setup()
    render(<DownloadCartaButton href={HREF} fileName={FILE} />)

    await user.click(screen.getByRole('link', { name: 'Baixar documento' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        'Não foi possível gerar o documento. Tente novamente.'
      )
    )
    expect(anchorClick).not.toHaveBeenCalled()
    expect(
      screen.getByRole('link', { name: 'Baixar documento' })
    ).toBeInTheDocument()
  })
})
