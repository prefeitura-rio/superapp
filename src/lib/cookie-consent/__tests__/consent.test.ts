import { describe, expect, it } from 'vitest'
import {
  COOKIE_CONSENT_VERSION,
  type CookieConsentRecord,
  getDeniedCategories,
  getRevokedCategories,
  hasConsentFor,
  parseCookieConsent,
  serializeCookieConsent,
} from '../consent'

const record: CookieConsentRecord = {
  version: COOKIE_CONSENT_VERSION,
  updatedAt: '2026-11-26T12:00:00.000Z',
  analytics: true,
}

describe('parseCookieConsent', () => {
  it('lê de volta o que serializeCookieConsent gravou', () => {
    expect(parseCookieConsent(serializeCookieConsent(record))).toEqual(record)
  })

  it('aceita o valor já decodificado (como o servidor entrega)', () => {
    const decoded = decodeURIComponent(serializeCookieConsent(record))
    expect(parseCookieConsent(decoded)).toEqual(record)
  })

  it('sem cookie não há escolha', () => {
    expect(parseCookieConsent(undefined)).toBeNull()
    expect(parseCookieConsent('')).toBeNull()
  })

  it('o cookie do banner antigo ("true") não vale como consentimento', () => {
    expect(parseCookieConsent('true')).toBeNull()
  })

  it('escolha feita em outra versão da política é pedida de novo', () => {
    const outraVersao = serializeCookieConsent({
      ...record,
      version: COOKIE_CONSENT_VERSION + 1,
    })
    expect(parseCookieConsent(outraVersao)).toBeNull()
  })

  it('ignora campos de categorias que deixaram de existir', () => {
    const comCampoAntigo = encodeURIComponent(
      JSON.stringify({
        v: COOKIE_CONSENT_VERSION,
        at: record.updatedAt,
        analytics: false,
        recording: true,
      })
    )
    expect(parseCookieConsent(comCampoAntigo)).toEqual({
      ...record,
      analytics: false,
    })
  })

  it('valor corrompido ou incompleto é ignorado', () => {
    expect(parseCookieConsent('%7Bquebrado')).toBeNull()
    expect(
      parseCookieConsent(
        encodeURIComponent(JSON.stringify({ v: COOKIE_CONSENT_VERSION }))
      )
    ).toBeNull()
    expect(
      parseCookieConsent(
        encodeURIComponent(
          JSON.stringify({
            v: COOKIE_CONSENT_VERSION,
            at: 'x',
            analytics: 'sim',
          })
        )
      )
    ).toBeNull()
  })
})

describe('hasConsentFor', () => {
  it('só é verdadeiro com a categoria permitida', () => {
    expect(hasConsentFor(record, 'analytics')).toBe(true)
    expect(hasConsentFor({ ...record, analytics: false }, 'analytics')).toBe(
      false
    )
    expect(hasConsentFor(null, 'analytics')).toBe(false)
    expect(hasConsentFor(undefined, 'analytics')).toBe(false)
  })
})

describe('getRevokedCategories', () => {
  it('lista o que estava permitido e deixou de estar', () => {
    expect(
      getRevokedCategories({ analytics: true }, { analytics: false })
    ).toEqual(['analytics'])
  })

  it('primeira escolha ou nova permissão não é revogação', () => {
    expect(getRevokedCategories(null, { analytics: false })).toEqual([])
    expect(
      getRevokedCategories({ analytics: false }, { analytics: true })
    ).toEqual([])
  })
})

describe('getDeniedCategories', () => {
  it('sem escolha ou com recusa, a categoria conta como negada', () => {
    expect(getDeniedCategories(null)).toEqual(['analytics'])
    expect(getDeniedCategories({ analytics: false })).toEqual(['analytics'])
    expect(getDeniedCategories({ analytics: true })).toEqual([])
  })
})
