'use client'

import { riomobVehicleQueryOptions } from '@/hooks/riomob/riomob-fetch'
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
    ...riomobVehicleQueryOptions(vehicleId),
    initialData: options?.initialData,
    enabled: (options?.enabled ?? true) && Boolean(vehicleId),
  })
}
