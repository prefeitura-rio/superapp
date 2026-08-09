'use client'

import {
  RIOMOB_VEHICLES_STALE_MS,
  fetchRiomobVehicle,
  riomobVehicleQueryKey,
} from '@/hooks/riomob/riomob-fetch'
import { RIOMOB_QUERY_RETRY } from '@/lib/riomob/query-keys'
import type { VehicleDetail } from '@/lib/riomob/types'
import { useQuery } from '@tanstack/react-query'

export function useRiomobVehicle(
  vehicleId: string,
  options?: {
    initialData?: VehicleDetail
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: riomobVehicleQueryKey(vehicleId),
    queryFn: () => fetchRiomobVehicle(vehicleId),
    staleTime: RIOMOB_VEHICLES_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
    initialData: options?.initialData,
    enabled: (options?.enabled ?? true) && Boolean(vehicleId),
  })
}
