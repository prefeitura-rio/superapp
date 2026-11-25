import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

/** Client isolado por teste: sem cache compartilhado e sem espera entre retries. */
export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retryDelay: 0, gcTime: Number.POSITIVE_INFINITY },
    },
  })
}

export function renderWithQuery(
  ui: ReactElement,
  {
    queryClient = makeTestQueryClient(),
    ...options
  }: { queryClient?: QueryClient } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}
