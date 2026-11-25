import ConsultaProtocoloPage from '@/app/(app)/(logged-in-out)/consulta-protocolo/page'
import { renderWithQuery } from '@/test/render-with-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * DEV-789 — `/consulta-protocolo` não é subpágina de Ouvidoria: a trilha é
 * `Página inicial > Consulte seu protocolo` em todos os estados da página
 * (formulário, carregando, erro e resultados).
 */

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/consulta-protocolo',
}))

vi.mock('@/app/components/header-wrapper-client', () => ({
  default: () => <header data-testid="header" />,
}))
vi.mock('@/app/components/float-navigation-wrapper', () => ({
  FloatNavigationWrapper: () => null,
}))

const EXPECTED_TRAIL = ['Página inicial', 'Consulte seu protocolo']

function breadcrumbTrail(): string[] {
  const nav = screen.getByRole('navigation', { name: 'Navegação estrutural' })
  return Array.from(nav.querySelectorAll('li')).map(li =>
    (li.textContent ?? '').replace(/^>/, '').trim()
  )
}

function expectTrailWithoutOuvidoria() {
  expect(breadcrumbTrail()).toEqual(EXPECTED_TRAIL)
  const nav = screen.getByRole('navigation', { name: 'Navegação estrutural' })
  expect(nav.querySelector('a[href="/ouvidoria"]')).toBeNull()
  expect(nav).not.toHaveTextContent('Ouvidoria')
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function submitProtocolo(container: HTMLElement) {
  fireEvent.change(screen.getByLabelText('Número de protocolo'), {
    target: { value: 'RIO-2026-00000001' },
  })
  fireEvent.submit(container.querySelector('form') as HTMLFormElement)
}

describe('DEV-789 — breadcrumb de /consulta-protocolo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('estado inicial (formulário) não mostra Ouvidoria na trilha', () => {
    renderWithQuery(<ConsultaProtocoloPage />)
    expectTrailWithoutOuvidoria()
  })

  it('estado de erro não mostra Ouvidoria na trilha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 }))
    )
    const { container } = renderWithQuery(<ConsultaProtocoloPage />)
    submitProtocolo(container)

    await waitFor(() =>
      expect(container).toHaveTextContent(
        'Nenhuma solicitação encontrada para este protocolo.'
      )
    )
    expectTrailWithoutOuvidoria()
  })

  it('estado de resultados não mostra Ouvidoria na trilha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          protocolo: 'RIO-2026-00000001',
          status: 'Aberto',
          dataAbertura: '2026-01-02T10:00:00Z',
          ordens_de_servico: [
            {
              codigoOs: '00000001',
              servico: 'Reparo de iluminação',
              subtema: 'Iluminação',
              categoria: 'Serviço',
              status: 'Aberto',
            },
            {
              codigoOs: '00000002',
              servico: 'Poda de árvore',
              subtema: 'Árvores',
              categoria: 'Serviço',
              status: 'Aberto',
            },
          ],
        })
      )
    )
    const { container } = renderWithQuery(<ConsultaProtocoloPage />)
    submitProtocolo(container)

    await waitFor(() => expect(container).toHaveTextContent('2 solicitações'))
    expectTrailWithoutOuvidoria()
  })
})
