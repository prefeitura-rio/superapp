'use client'

import {
  cadmicroCatalogBrandsQueryOptions,
  cadmicroCatalogColorsQueryOptions,
  cadmicroCatalogModelsQueryOptions,
} from '@/hooks/cadmicro/cadmicro-fetch'
import { useQuery } from '@tanstack/react-query'

export function useCadmicroVehicleBrands() {
  return useQuery(cadmicroCatalogBrandsQueryOptions())
}

export function useCadmicroVehicleModels(brandId: string | null | undefined) {
  return useQuery({
    ...cadmicroCatalogModelsQueryOptions(brandId ?? ''),
    enabled: Boolean(brandId),
  })
}

export function useCadmicroVehicleColors() {
  return useQuery(cadmicroCatalogColorsQueryOptions())
}
