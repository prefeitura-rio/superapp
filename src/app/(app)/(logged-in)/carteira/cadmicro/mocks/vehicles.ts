import type {
  VehicleDetail,
  VehicleType,
  WalletVehicle,
} from '@/lib/cadmicro/types'

export type { VehicleType }
export type {
  VehicleCategory,
  WalletVehicle,
  VehicleDocument,
  VehiclePhoto,
  AuthorizedConductor,
  CirculationRule,
  VehicleDetail,
} from '@/lib/cadmicro/types'
export { VEHICLE_CATEGORY_LABELS } from '@/lib/cadmicro/types'

/** Mock temporário — substituir por GET de veículos do cidadão. */
const MOCK_INVOICE_PDF_URL =
  'https://storage.googleapis.com/rj-superapp-staging-prefrio/cadmicro/47562396507/invoice/b7621c93-3744-40f6-819c-573dfa1aa48c.pdf'

export const MOCK_VEHICLES: WalletVehicle[] = [
  {
    id: 'vehicle-autopropelido-1',
    displayName: 'Autopropelido da Jéssica',
    vehicleType: 'autopropelido',
    registrationNumber: 'RJ-E-001234',
    category: 'proprietaria',
    photoUrl:
      'https://storage.googleapis.com/rj-superapp-staging-prefrio/cadmicro/47562396507/vehicle/4e1a7e67-5417-4572-8fad-9061b495da03.png',
  },
  {
    id: 'vehicle-bike-1',
    displayName: 'Possante',
    vehicleType: 'bicicleta_eletrica',
    registrationNumber: 'RJ-E-001567',
    category: 'proprietaria',
    photoUrl:
      'https://storage.googleapis.com/rj-superapp-staging-prefrio/cadmicro/47562396507/vehicle/ac6754ea-90b7-4943-90be-f47d8e99d59e.png',
  },
  {
    id: 'vehicle-ciclomotor-1',
    displayName: 'Veloz',
    vehicleType: 'ciclomotor',
    registrationNumber: 'RJ-E-001890',
    category: 'condutor',
    photoUrl:
      'https://storage.googleapis.com/rj-superapp-staging-prefrio/cadmicro/47562396507/vehicle/6186e621-f77c-4e4d-9b88-ef6ca70e2c52.png',
  },
]

export const CIRCULATION_RULES = [
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
] as const

const MOCK_VEHICLE_DETAILS: Record<string, VehicleDetail> = {
  'vehicle-autopropelido-1': {
    ...MOCK_VEHICLES[0],
    owner: {
      name: 'Jéssica Rangel Azevedo',
      cpf: '475.623.965-07',
      phone: '(21) 99876 5432',
      email: 'j.rangel@gmail.com',
    },
    brandModel: 'Xiaomi Mi Electric Scooter 4',
    brandId: 'brand_xiaomi',
    brandOther: '',
    modelId: 'model_mi_scooter_4',
    modelOther: '',
    color: 'Preto',
    serialNumber: 'A1F9K73P4826',
    serialNumberDocument: {
      fileName: 'serie-autopropelido.png',
      fileSizeLabel: '2.89MB',
      fileSizeBytes: 2_890_000,
      url: MOCK_VEHICLES[0].photoUrl,
      verified: true,
    },
    invoiceDocument: {
      fileName: 'nf-autopropelido.pdf',
      fileSizeLabel: '2.89MB',
      fileSizeBytes: 2_890_000,
      url: MOCK_INVOICE_PDF_URL,
      verified: true,
    },
    vehiclePhoto: {
      url: MOCK_VEHICLES[0].photoUrl,
      fileName: 'veiculo-autopropelido.png',
      fileSizeBytes: 2_890_000,
    },
    authorizedConductors: [
      {
        id: 'conductor-1',
        name: 'José Rangel Azevedo',
        cpf: '398.765.432-60',
        phone: '(21) 99876 5432',
        email: 'jose.rangel@email.com',
      },
      {
        id: 'conductor-2',
        name: 'Luana Martins Sales',
        cpf: '398.765.432-60',
        phone: '(21) 99876 5432',
        email: 'luana.martins@email.com',
      },
    ],
  },
  'vehicle-bike-1': {
    ...MOCK_VEHICLES[1],
    owner: {
      name: 'Jéssica Rangel Azevedo',
      cpf: '475.623.965-07',
      phone: '(21) 99876 5432',
      email: 'j.rangel@gmail.com',
    },
    brandModel: 'Sense Impulse Evo',
    brandId: 'brand_sense',
    brandOther: '',
    modelId: 'model_impulse',
    modelOther: '',
    color: 'Azul',
    serialNumber: 'B2G8L84Q5937',
    serialNumberDocument: {
      fileName: 'serie-possante.png',
      fileSizeLabel: '1.42MB',
      fileSizeBytes: 1_420_000,
      url: MOCK_VEHICLES[1].photoUrl,
      verified: true,
    },
    invoiceDocument: {
      fileName: 'nf-possante.pdf',
      fileSizeLabel: '3.10MB',
      fileSizeBytes: 3_100_000,
      url: MOCK_INVOICE_PDF_URL,
      verified: true,
    },
    vehiclePhoto: {
      url: MOCK_VEHICLES[1].photoUrl,
      fileName: 'possante.png',
      fileSizeBytes: 1_420_000,
    },
    authorizedConductors: [
      {
        id: 'conductor-3',
        name: 'Carlos Eduardo Lima',
        cpf: '412.887.654-10',
        phone: '(21) 98765 4321',
        email: 'carlos.lima@email.com',
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
    brandModel: 'Segway Ninebot F40',
    brandId: 'brand_segway',
    brandOther: '',
    modelId: 'model_ninebot_f40',
    modelOther: '',
    color: 'Vermelho',
    serialNumber: 'C3H7M95R6048',
    serialNumberDocument: {
      fileName: 'serie-veloz.png',
      fileSizeLabel: '2.05MB',
      fileSizeBytes: 2_050_000,
      url: MOCK_VEHICLES[2].photoUrl,
      verified: true,
    },
    invoiceDocument: {
      fileName: 'nf-veloz.pdf',
      fileSizeLabel: '2.55MB',
      fileSizeBytes: 2_550_000,
      url: MOCK_INVOICE_PDF_URL,
      verified: true,
    },
    vehiclePhoto: {
      url: MOCK_VEHICLES[2].photoUrl,
      fileName: 'veloz.png',
      fileSizeBytes: 2_050_000,
    },
    authorizedConductors: [],
  },
}

export function getMockVehicleDetail(id: string): VehicleDetail | undefined {
  return MOCK_VEHICLE_DETAILS[id]
}
