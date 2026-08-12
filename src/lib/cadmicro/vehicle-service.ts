import {
  MOCK_VEHICLES,
  getMockVehicleDetail,
} from '@/app/(app)/(logged-in)/carteira/cadmicro/mocks/vehicles'
import {
  getCitizenCpfVehicles,
  getCitizenCpfVehiclesVehicleId,
  getCitizenCpfVehiclesVehicleIdConductors,
} from '@/http/mobilidade/mobilidade'
import {
  mapVehicleDetailToUi,
  mapVehicleListItemToWalletVehicle,
} from '@/lib/cadmicro/mappers'
import { isCadmicroMocksEnabled } from '@/lib/cadmicro/mocks-gate'
import type { VehicleDetail, WalletVehicle } from '@/lib/cadmicro/types'

export function getCadmicroWalletVehicles(): WalletVehicle[] {
  return isCadmicroMocksEnabled() ? MOCK_VEHICLES : []
}

export async function listCadmicroVehicles(
  cpf: string
): Promise<WalletVehicle[]> {
  if (isCadmicroMocksEnabled()) {
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

export async function getCadmicroVehicle(
  cpf: string,
  vehicleId: string
): Promise<VehicleDetail | null> {
  if (isCadmicroMocksEnabled()) {
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
