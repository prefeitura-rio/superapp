export type VehicleType = 'bicicleta_eletrica' | 'autopropelido' | 'ciclomotor'

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

export interface VehicleDocument {
  fileName: string
  fileSizeLabel: string
  fileSizeBytes: number
  url: string
  verified: true
}

export interface VehiclePhoto {
  url: string
  fileName: string
  fileSizeBytes: number
}

export interface AuthorizedConductor {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
}

export interface CirculationRule {
  title: string
  description: string
}

export interface VehicleDetail extends WalletVehicle {
  owner: {
    name: string
    cpf: string
    phone: string
    email: string
  }
  brandModel: string
  brandId: string
  modelId: string
  color: string
  serialNumber: string
  serialNumberDocument: VehicleDocument
  invoiceDocument: VehicleDocument
  vehiclePhoto: VehiclePhoto
  authorizedConductors: AuthorizedConductor[]
}

export interface PendingConductorInvite {
  id: string
  inviterDisplayName: string
  vehicleDisplayName: string
  vehicleId: string
  /** ISO timestamp — used to pick the most recent invite. */
  invitedAt: string
}

export interface VehicleBrandOption {
  id: string
  name: string
  isOther?: boolean
}

export interface VehicleModelOption {
  id: string
  brand_id: string
  name: string
  vehicle_type: VehicleType
  isOther?: boolean
}
