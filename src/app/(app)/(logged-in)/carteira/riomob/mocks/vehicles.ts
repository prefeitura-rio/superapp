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

export interface VehicleDocument {
  fileName: string
  fileSizeLabel: string
  verified: true
}

export interface AuthorizedConductor {
  id: string
  name: string
  cpf: string
  phone: string
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
  serialNumber: string
  serialNumberDocument: VehicleDocument
  invoiceDocument: VehicleDocument
  authorizedConductors: AuthorizedConductor[]
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

export const CIRCULATION_RULES: CirculationRule[] = [
  {
    title: 'Calçadas',
    description:
      'Permitido somente quando houver autorização local e com velocidade máxima de 6 km/h, respeitando o pedestre.',
  },
  {
    title: 'Ciclovias e Ciclofaixas',
    description:
      'Bicicletas elétricas e autopropelidos podem circular respeitando a velocidade da via. Ciclomotores são proibidos.',
  },
  {
    title: 'Ruas e Avenidas (Até 40km/h)',
    description:
      'Autopropelidos e bicicletas elétricas podem circular em vias com limite de até 40km/h, se não houver ciclovia. Ciclomotores podem circular normalmente.',
  },
  {
    title: 'Vias de Trânsito Rápido e Rodovias',
    description:
      'É proibida a circulação de ciclomotores, exceto se houver acostamento. Autopropelidos e bicicletas elétricas nunca podem circular nestas vias.',
  },
]

const MOCK_VEHICLE_DETAILS: Record<string, VehicleDetail> = {
  'vehicle-autopropelido-1': {
    ...MOCK_VEHICLES[0],
    owner: {
      name: 'Jéssica Rangel Azevedo',
      cpf: '398.765.432-60',
      phone: '(21) 99876 5432',
      email: 'j.rangel@gmail.com',
    },
    brandModel: 'Caloi E-Vibe City',
    serialNumber: 'A1F9K73P4826',
    serialNumberDocument: {
      fileName: 'NF0456634.png',
      fileSizeLabel: '2.89MB',
      verified: true,
    },
    invoiceDocument: {
      fileName: 'NF0456634.png',
      fileSizeLabel: '2.89MB',
      verified: true,
    },
    authorizedConductors: [
      {
        id: 'conductor-1',
        name: 'José Rangel Azevedo',
        cpf: '398.765.432-60',
        phone: '(21) 99876 5432',
      },
      {
        id: 'conductor-2',
        name: 'Luana Martins Sales',
        cpf: '398.765.432-60',
        phone: '(21) 99876 5432',
      },
    ],
  },
  'vehicle-bike-1': {
    ...MOCK_VEHICLES[1],
    owner: {
      name: 'Jéssica Rangel Azevedo',
      cpf: '398.765.432-60',
      phone: '(21) 99876 5432',
      email: 'j.rangel@gmail.com',
    },
    brandModel: 'Sense Impulse Evo',
    serialNumber: 'B2G8L84Q5937',
    serialNumberDocument: {
      fileName: 'serie-possante.png',
      fileSizeLabel: '1.42MB',
      verified: true,
    },
    invoiceDocument: {
      fileName: 'nf-possante.png',
      fileSizeLabel: '3.10MB',
      verified: true,
    },
    authorizedConductors: [
      {
        id: 'conductor-3',
        name: 'Carlos Eduardo Lima',
        cpf: '412.887.654-10',
        phone: '(21) 98765 4321',
      },
    ],
  },
  'vehicle-ciclomotor-1': {
    ...MOCK_VEHICLES[2],
    owner: {
      name: 'Marcos Vinícius Costa',
      cpf: '221.334.556-78',
      phone: '(21) 97654 3210',
      email: 'marcos.costa@email.com',
    },
    brandModel: 'Shineray XY 50Q',
    serialNumber: 'C3H7M95R6048',
    serialNumberDocument: {
      fileName: 'serie-veloz.png',
      fileSizeLabel: '2.05MB',
      verified: true,
    },
    invoiceDocument: {
      fileName: 'nf-veloz.png',
      fileSizeLabel: '2.55MB',
      verified: true,
    },
    authorizedConductors: [],
  },
}

export function getMockVehicleDetail(id: string): VehicleDetail | undefined {
  return MOCK_VEHICLE_DETAILS[id]
}
