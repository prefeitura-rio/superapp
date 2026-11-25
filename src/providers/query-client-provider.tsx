'use client'

import { getQueryClient } from '@/lib/query/query-client'
import { QueryClientProvider } from '@tanstack/react-query'

export function ReactQueryProvider({
  children,
}: { children: React.ReactNode }) {
  // Sem `useState`: se o React suspender na renderização inicial e não houver
  // um <Suspense> abaixo, ele descartaria o client (e o cache hidratado).
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
