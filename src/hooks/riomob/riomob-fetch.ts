import {
  RIOMOB_CATALOG_STALE_MS,
  RIOMOB_INVITATIONS_STALE_MS,
  RIOMOB_QUERY_RETRY,
  RIOMOB_VEHICLES_STALE_MS,
  riomobCatalogBrandsQueryKey,
  riomobCatalogColorsQueryKey,
  riomobCatalogModelsQueryKey,
  riomobInvitationsQueryKey,
  riomobVehicleQueryKey,
  riomobVehiclesQueryKey,
} from '@/lib/riomob/query-keys'
import type { PendingConductorInvite } from '@/lib/riomob/types'
import type { VehicleDetail } from '@/lib/riomob/types'
import type {
  VehicleBrandOption,
  VehicleModelOption,
  WalletVehicle,
} from '@/lib/riomob/types'
import { queryOptions } from '@tanstack/react-query'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchRiomobVehicles(): Promise<WalletVehicle[]> {
  const data = await fetchJson<{ vehicles: WalletVehicle[] }>(
    '/api/riomob/vehicles'
  )
  return data.vehicles
}

export async function fetchRiomobVehicle(
  vehicleId: string
): Promise<VehicleDetail> {
  const data = await fetchJson<{ vehicle: VehicleDetail }>(
    `/api/riomob/vehicles/${vehicleId}`
  )
  return data.vehicle
}

export async function fetchRiomobInvitations(): Promise<
  PendingConductorInvite[]
> {
  const data = await fetchJson<{ invitations: PendingConductorInvite[] }>(
    '/api/riomob/invitations'
  )
  return data.invitations
}

export async function fetchRiomobBrands(): Promise<VehicleBrandOption[]> {
  const data = await fetchJson<{ brands: VehicleBrandOption[] }>(
    '/api/riomob/catalog/brands'
  )
  return data.brands
}

export async function fetchRiomobModels(
  brandId: string
): Promise<VehicleModelOption[]> {
  const params = new URLSearchParams({ brand_id: brandId })
  const data = await fetchJson<{ models: VehicleModelOption[] }>(
    `/api/riomob/catalog/models?${params}`
  )
  return data.models
}

export async function fetchRiomobColors(): Promise<string[]> {
  const data = await fetchJson<{ colors: string[] }>(
    '/api/riomob/catalog/colors'
  )
  return data.colors
}

/** Shared options for SSR prefetch / client hooks (P11). */
export function riomobVehiclesQueryOptions() {
  return queryOptions({
    queryKey: riomobVehiclesQueryKey(),
    queryFn: fetchRiomobVehicles,
    staleTime: RIOMOB_VEHICLES_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function riomobVehicleQueryOptions(vehicleId: string) {
  return queryOptions({
    queryKey: riomobVehicleQueryKey(vehicleId),
    queryFn: () => fetchRiomobVehicle(vehicleId),
    staleTime: RIOMOB_VEHICLES_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function riomobInvitationsQueryOptions() {
  return queryOptions({
    queryKey: riomobInvitationsQueryKey(),
    queryFn: fetchRiomobInvitations,
    staleTime: RIOMOB_INVITATIONS_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function riomobCatalogBrandsQueryOptions() {
  return queryOptions({
    queryKey: riomobCatalogBrandsQueryKey(),
    queryFn: fetchRiomobBrands,
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function riomobCatalogModelsQueryOptions(brandId: string) {
  return queryOptions({
    queryKey: riomobCatalogModelsQueryKey(brandId),
    queryFn: () => fetchRiomobModels(brandId),
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export function riomobCatalogColorsQueryOptions() {
  return queryOptions({
    queryKey: riomobCatalogColorsQueryKey(),
    queryFn: fetchRiomobColors,
    staleTime: RIOMOB_CATALOG_STALE_MS,
    retry: RIOMOB_QUERY_RETRY,
  })
}

export {
  RIOMOB_CATALOG_STALE_MS,
  RIOMOB_INVITATIONS_STALE_MS,
  RIOMOB_VEHICLES_STALE_MS,
  riomobCatalogBrandsQueryKey,
  riomobCatalogColorsQueryKey,
  riomobCatalogModelsQueryKey,
  riomobInvitationsQueryKey,
  riomobVehicleQueryKey,
  riomobVehiclesQueryKey,
}
