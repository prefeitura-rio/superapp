import {
  MOCK_VEHICLES,
  getMockVehicleDetail,
} from '@/app/(app)/(logged-in)/carteira/riomob/mocks/vehicles'
import {
  getCitizenCpfVehicles,
  getCitizenCpfVehiclesVehicleId,
  getCitizenCpfVehiclesVehicleIdConductors,
} from '@/http/mobilidade/mobilidade'
import {
  mapVehicleDetailToUi,
  mapVehicleListItemToWalletVehicle,
} from '@/lib/riomob/mappers'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import type { VehicleDetail, WalletVehicle } from '@/lib/riomob/types'

export function getRiomobWalletVehicles(): WalletVehicle[] {
  return isRiomobMocksEnabled() ? MOCK_VEHICLES : []
}

export async function listRiomobVehicles(
  cpf: string
): Promise<WalletVehicle[]> {
  if (isRiomobMocksEnabled()) {
    return MOCK_VEHICLES
  }

  const response = await getCitizenCpfVehicles(cpf, {
    page: 1,
    per_page: 100,
  })

  if (response.status !== 200) {
    throw new Error('Falha ao listar veículos')
  }

  const items = response.data.data ?? []
  return items
    .map(mapVehicleListItemToWalletVehicle)
    .filter((v): v is WalletVehicle => v !== null)
}

export async function getRiomobVehicle(
  cpf: string,
  vehicleId: string
): Promise<VehicleDetail | null> {
  if (isRiomobMocksEnabled()) {
    return getMockVehicleDetail(vehicleId) ?? null
  }

  const [detailResponse, conductorsResponse] = await Promise.all([
    getCitizenCpfVehiclesVehicleId(cpf, vehicleId),
    getCitizenCpfVehiclesVehicleIdConductors(cpf, vehicleId),
  ])

  if (detailResponse.status === 404) return null
  if (detailResponse.status !== 200) {
    throw new Error('Falha ao buscar veículo')
  }

  const conductors =
    conductorsResponse.status === 200
      ? (conductorsResponse.data.data ?? [])
      : []

  return mapVehicleDetailToUi(detailResponse.data, conductors)
}
