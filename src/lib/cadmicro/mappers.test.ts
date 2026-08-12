import { createVehiclePayloadSchema } from '@/lib/cadmicro/action-schemas'
import { isOtherBrand, isOtherModel } from '@/lib/cadmicro/catalog-constants'
import { isImageAsset, isPdfName } from '@/lib/cadmicro/file-utils'
import {
  formatFileSizeLabel,
  mapInvitationItemToPending,
  mapVehicleListItemToWalletVehicle,
} from '@/lib/cadmicro/mappers'
import { describe, expect, it } from 'vitest'

describe('formatFileSizeLabel', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatFileSizeLabel(0)).toBe('0B')
    expect(formatFileSizeLabel(500)).toBe('500B')
    expect(formatFileSizeLabel(1536)).toBe('1.50KB')
    expect(formatFileSizeLabel(2 * 1024 * 1024)).toBe('2.00MB')
  })
})

describe('file-utils', () => {
  it('detects pdf names and image assets', () => {
    expect(isPdfName('nota.pdf')).toBe(true)
    expect(isPdfName('foto.PNG')).toBe(false)
    expect(isImageAsset('foto.jpg', 'https://example.com/a.jpg')).toBe(true)
    expect(isImageAsset('nota.pdf', 'https://example.com/a.pdf')).toBe(false)
  })
})

describe('catalog-constants', () => {
  it('identifies other brand/model ids', () => {
    expect(isOtherBrand('brand_outro')).toBe(true)
    expect(isOtherBrand('brand_caloi')).toBe(false)
    expect(isOtherModel('model_outro')).toBe(true)
  })
})

describe('mapVehicleListItemToWalletVehicle', () => {
  it('returns null without id', () => {
    expect(mapVehicleListItemToWalletVehicle({})).toBeNull()
  })

  it('maps list item to wallet vehicle', () => {
    const mapped = mapVehicleListItemToWalletVehicle({
      id: 'v1',
      display_name: 'Minha Bike',
      vehicle_type: 'bicicleta_eletrica',
      registration_number: 'RM-1',
      role: 'owner',
      vehicle_photo_url: 'https://storage.googleapis.com/b/a.png',
    })
    expect(mapped).toMatchObject({
      id: 'v1',
      displayName: 'Minha Bike',
      vehicleType: 'bicicleta_eletrica',
      category: 'proprietaria',
      registrationNumber: 'RM-1',
    })
    expect(mapped?.conductorId).toBeUndefined()
  })

  it('maps conductor_id when role is conductor', () => {
    const mapped = mapVehicleListItemToWalletVehicle({
      id: 'v2',
      display_name: 'Bike do Dono',
      vehicle_type: 'autopropelido',
      registration_number: 'RM-2',
      role: 'conductor',
      conductor_id: 'link-abc',
      vehicle_photo_url: 'https://storage.googleapis.com/b/b.png',
    })
    expect(mapped).toMatchObject({
      id: 'v2',
      category: 'condutor',
      conductorId: 'link-abc',
    })
  })
})

describe('mapInvitationItemToPending', () => {
  it('filters non-pending invitations', () => {
    expect(
      mapInvitationItemToPending({
        id: 'i1',
        status: 'accepted',
        vehicle_id: 'v1',
      })
    ).toBeNull()
  })

  it('maps pending invitation', () => {
    const mapped = mapInvitationItemToPending({
      id: 'i1',
      status: 'pending',
      vehicle_id: 'v1',
      owner_name: 'Maria Silva',
      created_at: '2026-01-01T00:00:00Z',
      vehicle: { display_name: 'Scooter' },
    })
    expect(mapped).toMatchObject({
      id: 'i1',
      inviterDisplayName: 'Maria',
      vehicleDisplayName: 'Scooter',
      vehicleId: 'v1',
    })
  })
})

describe('createVehiclePayloadSchema', () => {
  const base = {
    display_name: 'Bike',
    brand_id: 'brand_caloi',
    brand_other: null,
    model_id: 'model_e_vibe',
    model_other: null,
    color: 'Preto',
    serial_number: 'ABC123',
    serial_number_photo_url:
      'https://storage.googleapis.com/bucket/mobilidade/1/serial/a.png',
    vehicle_photo_url:
      'https://storage.googleapis.com/bucket/mobilidade/1/vehicle/b.png',
    has_invoice: false,
    self_declaration: true as const,
    serial_number_photo_file_name: 'serial.png',
    serial_number_photo_file_size: 1024,
    vehicle_photo_file_name: 'vehicle.png',
    vehicle_photo_file_size: 2048,
  }

  it('accepts a valid payload', () => {
    expect(createVehiclePayloadSchema.safeParse(base).success).toBe(true)
  })

  it('rejects blob urls', () => {
    const result = createVehiclePayloadSchema.safeParse({
      ...base,
      vehicle_photo_url: 'blob:http://localhost/x',
    })
    expect(result.success).toBe(false)
  })

  it('requires invoice url when has_invoice is true', () => {
    const result = createVehiclePayloadSchema.safeParse({
      ...base,
      has_invoice: true,
    })
    expect(result.success).toBe(false)
  })
})
