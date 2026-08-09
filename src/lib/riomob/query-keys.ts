export const RIOMOB_VEHICLES_STALE_MS = 5 * 60 * 1000
export const RIOMOB_INVITATIONS_STALE_MS = 5 * 60 * 1000
export const RIOMOB_CATALOG_STALE_MS = 30 * 60 * 1000
/** One retry after the first failure (2 attempts total). */
export const RIOMOB_QUERY_RETRY = 1

export function riomobVehiclesQueryKey() {
  return ['riomob', 'vehicles'] as const
}

export function riomobVehicleQueryKey(vehicleId: string) {
  return ['riomob', 'vehicle', vehicleId] as const
}

export function riomobInvitationsQueryKey() {
  return ['riomob', 'invitations'] as const
}

export function riomobCatalogBrandsQueryKey() {
  return ['riomob', 'catalog', 'brands'] as const
}

export function riomobCatalogModelsQueryKey(brandId: string) {
  return ['riomob', 'catalog', 'models', brandId] as const
}

export function riomobCatalogColorsQueryKey() {
  return ['riomob', 'catalog', 'colors'] as const
}
