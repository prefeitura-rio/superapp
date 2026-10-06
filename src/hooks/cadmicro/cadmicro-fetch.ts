import {
  CADMICRO_CATALOG_STALE_MS,
  CADMICRO_INVITATIONS_STALE_MS,
  CADMICRO_QUERY_RETRY,
  CADMICRO_VEHICLES_STALE_MS,
  cadmicroCatalogBrandsQueryKey,
  cadmicroCatalogColorsQueryKey,
  cadmicroCatalogModelsQueryKey,
  cadmicroInvitationsQueryKey,
  cadmicroVehicleQueryKey,
  cadmicroVehiclesQueryKey,
} from '@/lib/cadmicro/query-keys'
import type { PendingConductorInvite } from '@/lib/cadmicro/types'
import type { VehicleDetail } from '@/lib/cadmicro/types'
import type {
  VehicleBrandOption,
  VehicleModelOption,
  WalletVehicle,
} from '@/lib/cadmicro/types'
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

export async function fetchCadmicroVehicles(): Promise<WalletVehicle[]> {
  const data = await fetchJson<{ vehicles: WalletVehicle[] }>(
    '/api/cadmicro/vehicles'
  )
  return data.vehicles
}

export async function fetchCadmicroVehicle(
  vehicleId: string
): Promise<VehicleDetail> {
  const data = await fetchJson<{ vehicle: VehicleDetail }>(
    `/api/cadmicro/vehicles/${vehicleId}`
  )
  return data.vehicle
}

export async function fetchCadmicroInvitations(): Promise<
  PendingConductorInvite[]
> {
  const data = await fetchJson<{ invitations: PendingConductorInvite[] }>(
    '/api/cadmicro/invitations'
  )
  return data.invitations
}

export async function fetchCadmicroBrands(): Promise<VehicleBrandOption[]> {
  const data = await fetchJson<{ brands: VehicleBrandOption[] }>(
    '/api/cadmicro/catalog/brands'
  )
  return data.brands
}

export async function fetchCadmicroModels(
  brandId: string
): Promise<VehicleModelOption[]> {
  const params = new URLSearchParams({ brand_id: brandId })
  const data = await fetchJson<{ models: VehicleModelOption[] }>(
    `/api/cadmicro/catalog/models?${params}`
  )
  return data.models
}

export async function fetchCadmicroColors(): Promise<string[]> {
  const data = await fetchJson<{ colors: string[] }>(
    '/api/cadmicro/catalog/colors'
  )
  return data.colors
}

/** Shared options for SSR prefetch / client hooks (P11). */
export function cadmicroVehiclesQueryOptions() {
  return queryOptions({
    queryKey: cadmicroVehiclesQueryKey(),
    queryFn: fetchCadmicroVehicles,
    staleTime: CADMICRO_VEHICLES_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export function cadmicroVehicleQueryOptions(vehicleId: string) {
  return queryOptions({
    queryKey: cadmicroVehicleQueryKey(vehicleId),
    queryFn: () => fetchCadmicroVehicle(vehicleId),
    staleTime: CADMICRO_VEHICLES_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export function cadmicroInvitationsQueryOptions() {
  return queryOptions({
    queryKey: cadmicroInvitationsQueryKey(),
    queryFn: fetchCadmicroInvitations,
    staleTime: CADMICRO_INVITATIONS_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export function cadmicroCatalogBrandsQueryOptions() {
  return queryOptions({
    queryKey: cadmicroCatalogBrandsQueryKey(),
    queryFn: fetchCadmicroBrands,
    staleTime: CADMICRO_CATALOG_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export function cadmicroCatalogModelsQueryOptions(brandId: string) {
  return queryOptions({
    queryKey: cadmicroCatalogModelsQueryKey(brandId),
    queryFn: () => fetchCadmicroModels(brandId),
    staleTime: CADMICRO_CATALOG_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export function cadmicroCatalogColorsQueryOptions() {
  return queryOptions({
    queryKey: cadmicroCatalogColorsQueryKey(),
    queryFn: fetchCadmicroColors,
    staleTime: CADMICRO_CATALOG_STALE_MS,
    retry: CADMICRO_QUERY_RETRY,
  })
}

export {
  CADMICRO_CATALOG_STALE_MS,
  CADMICRO_INVITATIONS_STALE_MS,
  CADMICRO_VEHICLES_STALE_MS,
  cadmicroCatalogBrandsQueryKey,
  cadmicroCatalogColorsQueryKey,
  cadmicroCatalogModelsQueryKey,
  cadmicroInvitationsQueryKey,
  cadmicroVehicleQueryKey,
  cadmicroVehiclesQueryKey,
}
