export const CADMICRO_VEHICLES_STALE_MS = 5 * 60 * 1000
export const CADMICRO_INVITATIONS_STALE_MS = 5 * 60 * 1000
export const CADMICRO_CATALOG_STALE_MS = 30 * 60 * 1000
/** One retry after the first failure (2 attempts total). */
export const CADMICRO_QUERY_RETRY = 1

export function cadmicroVehiclesQueryKey() {
  return ['cadmicro', 'vehicles'] as const
}

export function cadmicroVehicleQueryKey(vehicleId: string) {
  return ['cadmicro', 'vehicle', vehicleId] as const
}

export function cadmicroInvitationsQueryKey() {
  return ['cadmicro', 'invitations'] as const
}

export function cadmicroCatalogBrandsQueryKey() {
  return ['cadmicro', 'catalog', 'brands'] as const
}

export function cadmicroCatalogModelsQueryKey(brandId: string) {
  return ['cadmicro', 'catalog', 'models', brandId] as const
}

export function cadmicroCatalogColorsQueryKey() {
  return ['cadmicro', 'catalog', 'colors'] as const
}
