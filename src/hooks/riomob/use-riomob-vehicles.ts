'use client'

import {
  RIOMOB_VEHICLES_STALE_MS,
  fetchRiomobVehicles,
  riomobVehiclesQueryKey,
} from '@/hooks/riomob/riomob-fetch'
import { RIOMOB_QUERY_RETRY } from '@/lib/riomob/query-keys'
import type { WalletVehicle } from '@/lib/riomob/types'
import { useQuery } from '@tanstack/react-query'

export function useRiomobVehicles(options?: {
  initialData?: WalletVehicle[]
  enabled?: boolean
}) {
  return useQuery({
    queryKey: riomobVehiclesQueryKey(),
    queryFn: fetchRiomobVehicles,
    staleTime: RIOMOB_VEHICLES_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
