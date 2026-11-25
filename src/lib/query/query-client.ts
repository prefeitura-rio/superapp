import {
  QueryClient,
  defaultShouldDehydrateQuery,
  environmentManager,
} from '@tanstack/react-query'

/**
 * Fábrica única do `QueryClient`, usada no navegador (`getQueryClient`) e nos
 * Server Components (`getServerQueryClient`).
 *
 * Guia oficial: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Com SSR, o staleTime precisa ser > 0 para o client não refazer
        // imediatamente o que o servidor acabou de buscar.
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      dehydrate: {
        // Prefetch sem `await` no servidor: a query ainda `pending` segue para
        // o client como Promise e o dado chega por streaming.
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * No servidor, um client novo a cada chamada (nunca compartilhar cache entre
 * requisições: são dados de cidadãos diferentes). No navegador, um singleton,
 * para que o React não descarte o cache se suspender na renderização inicial.
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
