import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { MinhasCandidaturasPageClient } from '../minhas-candidaturas-page-client'

vi.mock('@/app/components/oportunidades/oportunidades-sub-header', () => ({
  OportunidadesSubHeader: () => null,
}))

const CANDIDATURAS_URL = '/api/user/empregos/candidaturas'
const VISUALIZAR_URL = '/api/user/empregos/candidaturas/visualizar'

function responder(atualizacoes: number) {
  const marcacoes: number[] = []
  server.use(
    http.get(CANDIDATURAS_URL, () =>
      HttpResponse.json({
        candidaturas: [],
        hasCandidaturas: false,
        total: 0,
        atualizacoes,
      })
    ),
    http.put(VISUALIZAR_URL, () => {
      marcacoes.push(1)
      return new HttpResponse(null, { status: 204 })
    })
  )
  return marcacoes
}

function renderPagina() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MinhasCandidaturasPageClient />
    </QueryClientProvider>
  )
  return queryClient
}

describe('MinhasCandidaturasPageClient', () => {
  it('abrir a lista marca as atualizações como vistas e zera a contagem do card', async () => {
    const marcacoes = responder(2)

    const queryClient = renderPagina()

    await waitFor(() => expect(marcacoes).toHaveLength(1))
    await waitFor(() =>
      expect(
        queryClient.getQueryData<{ atualizacoes: number }>(['candidaturas'])
          ?.atualizacoes
      ).toBe(0)
    )
  })

  it('sem atualização não vista não grava nada', async () => {
    const marcacoes = responder(0)

    renderPagina()

    expect(
      await screen.findByText(/Você ainda não possui candidaturas/)
    ).toBeInTheDocument()
    expect(marcacoes).toHaveLength(0)
  })
})
