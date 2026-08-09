import {
  canSignedReadObjectUrl,
  objectUrlBelongsToVehicle,
  parseRiomobObjectUrl,
} from '@/lib/riomob/gcs'
import { describe, expect, it } from 'vitest'

const BUCKET = 'rj-superapp-staging-prefrio'
const OWNER_CPF = '47562396507'
const VALID_OBJECT_PATH = `riomob/${OWNER_CPF}/vehicle/a0f28c74-b297-482b-b6fd-ed43c58aa6c8.png`
const VALID_URL = `https://storage.googleapis.com/${BUCKET}/${VALID_OBJECT_PATH}`
const SERIAL_URL = `https://storage.googleapis.com/${BUCKET}/riomob/${OWNER_CPF}/serial/b1f28c74-b297-482b-b6fd-ed43c58aa6c8.pdf`
const OTHER_URL = `https://storage.googleapis.com/${BUCKET}/riomob/${OWNER_CPF}/invoice/c2f28c74-b297-482b-b6fd-ed43c58aa6c8.png`

describe('parseRiomobObjectUrl', () => {
  it('parses a valid RioMob object URL (strips bucket from path)', () => {
    expect(parseRiomobObjectUrl(VALID_URL, BUCKET)).toEqual({
      objectPath: VALID_OBJECT_PATH,
      cpfDigits: OWNER_CPF,
    })
  })

  it('returns null when bucket does not match', () => {
    expect(parseRiomobObjectUrl(VALID_URL, 'other-bucket')).toBeNull()
  })

  it('returns null when path is not under riomob/', () => {
    const url = `https://storage.googleapis.com/${BUCKET}/superapp/images/courses/a0f28c74-b297-482b-b6fd-ed43c58aa6c8.png`
    expect(parseRiomobObjectUrl(url, BUCKET)).toBeNull()
  })

  it('returns null for a non-GCS host', () => {
    const url = `https://example.com/${BUCKET}/${VALID_OBJECT_PATH}`
    expect(parseRiomobObjectUrl(url, BUCKET)).toBeNull()
  })

  it('returns null for malformed URL', () => {
    expect(parseRiomobObjectUrl('not-a-url', BUCKET)).toBeNull()
  })
})

describe('objectUrlBelongsToVehicle', () => {
  it('returns true when objectUrl matches a vehicle photo URL', () => {
    expect(
      objectUrlBelongsToVehicle(VALID_URL, {
        serial_number_photo_url: SERIAL_URL,
        vehicle_photo_url: VALID_URL,
        invoice_photo_url: null,
      })
    ).toBe(true)
  })

  it('returns false when objectUrl is not on the vehicle', () => {
    expect(
      objectUrlBelongsToVehicle(OTHER_URL, {
        serial_number_photo_url: SERIAL_URL,
        vehicle_photo_url: VALID_URL,
      })
    ).toBe(false)
  })
})

describe('canSignedReadObjectUrl', () => {
  it('allows when path CPF matches JWT CPF', () => {
    expect(
      canSignedReadObjectUrl({
        jwtCpfDigits: OWNER_CPF,
        pathCpfDigits: OWNER_CPF,
        objectUrl: VALID_URL,
      })
    ).toBe(true)
  })

  it('denies cross-user read without vehicle membership urls', () => {
    expect(
      canSignedReadObjectUrl({
        jwtCpfDigits: '39876543260',
        pathCpfDigits: OWNER_CPF,
        objectUrl: VALID_URL,
      })
    ).toBe(false)
  })

  it('allows accepted conductor when objectUrl belongs to the vehicle', () => {
    expect(
      canSignedReadObjectUrl({
        jwtCpfDigits: '39876543260',
        pathCpfDigits: OWNER_CPF,
        objectUrl: VALID_URL,
        vehiclePhotoUrls: {
          vehicle_photo_url: VALID_URL,
          serial_number_photo_url: SERIAL_URL,
        },
      })
    ).toBe(true)
  })

  it('denies when membership vehicle does not contain the objectUrl', () => {
    expect(
      canSignedReadObjectUrl({
        jwtCpfDigits: '39876543260',
        pathCpfDigits: OWNER_CPF,
        objectUrl: OTHER_URL,
        vehiclePhotoUrls: {
          vehicle_photo_url: VALID_URL,
          serial_number_photo_url: SERIAL_URL,
        },
      })
    ).toBe(false)
  })
})
