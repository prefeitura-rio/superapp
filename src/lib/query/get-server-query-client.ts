import { cache } from 'react'
import { makeQueryClient } from './query-client'

/**
 * `QueryClient` por requisição para Server Components. `cache()` do React tem
 * escopo de uma única requisição, então nada vaza entre usuários.
 *
 * Só importar em Server Components: `cache` não existe no bundle do client.
 * Nos Server Components, tratar o `QueryClient` como lugar de *prefetch*, sem
 * renderizar o resultado no servidor (senão server e client divergem após um
 * refetch).
 */
export const getServerQueryClient = cache(makeQueryClient)
