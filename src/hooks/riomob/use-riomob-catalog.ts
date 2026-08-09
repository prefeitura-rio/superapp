'use client'

import {
  RIOMOB_CATALOG_STALE_MS,
  fetchRiomobBrands,
  fetchRiomobColors,
  fetchRiomobModels,
  riomobCatalogBrandsQueryKey,
  riomobCatalogColorsQueryKey,
  riomobCatalogModelsQueryKey,
} from '@/hooks/riomob/riomob-fetch'
import { RIOMOB_QUERY_RETRY } from '@/lib/riomob/query-keys'
import { useQuery } from '@tanstack/react-query'

export function useRiomobVehicleBrands() {
  return useQuery({
    queryKey: riomobCatalogBrandsQueryKey(),
    queryFn: fetchRiomobBrands,
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function useRiomobVehicleModels(brandId: string | null | undefined) {
  return useQuery({
    queryKey: riomobCatalogModelsQueryKey(brandId ?? ''),
    queryFn: () => fetchRiomobModels(brandId as string),
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
    enabled: Boolean(brandId),
  })
}

export function useRiomobVehicleColors() {
  return useQuery({
    queryKey: riomobCatalogColorsQueryKey(),
    queryFn: fetchRiomobColors,
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}
