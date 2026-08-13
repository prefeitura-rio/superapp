'use client'

import { cadmicroVehicleQueryOptions } from '@/hooks/cadmicro/cadmicro-fetch'
import type { VehicleDetail } from '@/lib/cadmicro/types'
import { useQuery } from '@tanstack/react-query'

export function useCadmicroVehicle(
  vehicleId: string,
  options?: {
    initialData?: VehicleDetail
    enabled?: boolean
  }
) {
  return useQuery({
    ...cadmicroVehicleQueryOptions(vehicleId),
    initialData: options?.initialData,
    enabled: (options?.enabled ?? true) && Boolean(vehicleId),
  })
}
