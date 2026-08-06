import { parseRiomobObjectUrl } from '@/lib/riomob/gcs'
import { describe, expect, it } from 'vitest'

const BUCKET = 'rj-superapp-staging-prefrio'
const VALID_OBJECT_PATH =
  'riomob/47562396507/vehicle/a0f28c74-b297-482b-b6fd-ed43c58aa6c8.png'
const VALID_URL = `https://storage.googleapis.com/${BUCKET}/${VALID_OBJECT_PATH}`

describe('parseRiomobObjectUrl', () => {
  it('parses a valid RioMob object URL (strips bucket from path)', () => {
    expect(parseRiomobObjectUrl(VALID_URL, BUCKET)).toEqual({
      objectPath: VALID_OBJECT_PATH,
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
