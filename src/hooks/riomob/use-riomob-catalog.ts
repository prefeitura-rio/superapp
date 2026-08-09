'use client'

import {
  riomobCatalogBrandsQueryOptions,
  riomobCatalogColorsQueryOptions,
  riomobCatalogModelsQueryOptions,
} from '@/hooks/riomob/riomob-fetch'
import { useQuery } from '@tanstack/react-query'

export function useRiomobVehicleBrands() {
  return useQuery(riomobCatalogBrandsQueryOptions())
}

export function useRiomobVehicleModels(brandId: string | null | undefined) {
  return useQuery({
    ...riomobCatalogModelsQueryOptions(brandId ?? ''),
    enabled: Boolean(brandId),
  })
}

export function useRiomobVehicleColors() {
  return useQuery(riomobCatalogColorsQueryOptions())
}
