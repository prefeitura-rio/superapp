'use client'

import { chamadosKeys } from '@/lib/chamados/query-keys'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

/**
 * Invalidação do cache de chamados. `invalidateQueries` marca como stale e
 * refaz já só o que está montado; o resto refaz no próximo uso.
 */
export function useInvalidateChamados() {
  const queryClient = useQueryClient()

  /**
   * Depois de abrir um chamado no novo 1746: lista, detalhes e consultas
   * públicas. O histórico SGRC fica de fora (o 1746 legado não recebe
   * chamados novos).
   */
  const invalidateSalesforce = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: chamadosKeys.salesforce() }),
        queryClient.invalidateQueries({ queryKey: chamadosKeys.details() }),
        queryClient.invalidateQueries({
          queryKey: [...chamadosKeys.all, 'publico'],
        }),
      ]),
    [queryClient]
  )

  const invalidateAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: chamadosKeys.all }),
    [queryClient]
  )

  return useMemo(
    () => ({ invalidateSalesforce, invalidateAll }),
    [invalidateSalesforce, invalidateAll]
  )
}
