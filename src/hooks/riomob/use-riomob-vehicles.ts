'use client'

import {
  RIOMOB_VEHICLES_STALE_MS,
  fetchRiomobVehicles,
  riomobVehiclesQueryKey,
} from '@/hooks/riomob/riomob-fetch'
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
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
