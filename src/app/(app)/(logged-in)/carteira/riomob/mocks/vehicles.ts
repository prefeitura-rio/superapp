import type { VehicleType } from '../adicionar-veiculo/mocks/vehicle-catalog'

export type VehicleCategory = 'proprietaria' | 'condutor'

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  proprietaria: 'Proprietária',
  condutor: 'Condutor',
}

export interface WalletVehicle {
  id: string
  displayName: string
  vehicleType: VehicleType
  registrationNumber: string
  category: VehicleCategory
  photoUrl: string
}

/** Mock temporário — substituir por GET de veículos do cidadão. */
export const MOCK_VEHICLES: WalletVehicle[] = [
  {
    id: 'vehicle-autopropelido-1',
    displayName: 'Bike da Jéssica',
    vehicleType: 'autopropelido',
    registrationNumber: 'RJ-E-001234',
    category: 'proprietaria',
    photoUrl: 'https://img.olx.com.br/images/71/718601428868369.webp',
  },
  {
    id: 'vehicle-bike-1',
    displayName: 'Possante',
    vehicleType: 'bicicleta_eletrica',
    registrationNumber: 'RJ-E-001567',
    category: 'proprietaria',
    photoUrl: 'https://img.olx.com.br/images/49/495633791766824.webp',
  },
  {
    id: 'vehicle-ciclomotor-1',
    displayName: 'Veloz',
    vehicleType: 'ciclomotor',
    registrationNumber: 'RJ-E-001890',
    category: 'condutor',
    photoUrl: 'https://img.olx.com.br/images/53/530637174492274.webp',
  },
]
