// @vitest-environment node
import { beforeEach, describe, expect, test } from 'vitest'
import {
  RATING_LIMITS,
  allowRatingRequest,
  resetRatingRateLimit,
} from '../rate-limit'

const NOW = 1_800_000_000_000
const HOUR_MS = 60 * 60 * 1000

function voter(index: number) {
  return `voter-${String(index).padStart(16, '0')}`
}

describe('allowRatingRequest', () => {
  beforeEach(() => {
    resetRatingRateLimit()
  })

  test('limites: 20 por visitante e 60 por IP a cada hora', () => {
    expect(RATING_LIMITS.perVoter).toEqual({ max: 20, windowMs: HOUR_MS })
    expect(RATING_LIMITS.perIp).toEqual({ max: 60, windowMs: HOUR_MS })
  })

  test('bloqueia o 21º voto do mesmo visitante, mesmo trocando de IP', () => {
    for (let i = 0; i < 20; i++) {
      expect(
        allowRatingRequest({ voterToken: voter(1), ip: `10.0.0.${i}` }, NOW + i)
      ).toBe(true)
    }

    expect(
      allowRatingRequest({ voterToken: voter(1), ip: '10.0.1.1' }, NOW + 20)
    ).toBe(false)
  })

  test('bloqueia o 61º voto do mesmo IP, mesmo trocando de visitante', () => {
    for (let i = 0; i < 60; i++) {
      expect(
        allowRatingRequest({ voterToken: voter(i), ip: '200.1.1.1' }, NOW + i)
      ).toBe(true)
    }

    expect(
      allowRatingRequest({ voterToken: voter(999), ip: '200.1.1.1' }, NOW + 60)
    ).toBe(false)
    expect(
      allowRatingRequest({ voterToken: voter(999), ip: '200.1.1.2' }, NOW + 61)
    ).toBe(true)
  })

  test('libera de novo quando os votos antigos saem da janela de 1 hora', () => {
    for (let i = 0; i < 20; i++) {
      allowRatingRequest({ voterToken: voter(1), ip: '200.1.1.1' }, NOW)
    }
    expect(
      allowRatingRequest(
        { voterToken: voter(1), ip: '200.1.1.1' },
        NOW + HOUR_MS - 1
      )
    ).toBe(false)

    expect(
      allowRatingRequest(
        { voterToken: voter(1), ip: '200.1.1.1' },
        NOW + HOUR_MS
      )
    ).toBe(true)
  })

  test('voto recusado pelo limite não conta para a janela', () => {
    for (let i = 0; i < 20; i++) {
      allowRatingRequest({ voterToken: voter(1), ip: '200.1.1.1' }, NOW)
    }
    // Tentativas bloqueadas ao longo da hora não empurram a liberação.
    for (let i = 1; i <= 10; i++) {
      allowRatingRequest(
        { voterToken: voter(1), ip: '200.1.1.1' },
        NOW + i * 60_000
      )
    }

    expect(
      allowRatingRequest(
        { voterToken: voter(1), ip: '200.1.1.1' },
        NOW + HOUR_MS
      )
    ).toBe(true)
  })

  test('com 10 mil chaves descarta a mais antiga em vez de crescer sem limite', () => {
    // Cada chamada cria 2 chaves (visitante + IP): 5 mil chamadas enchem o mapa.
    for (let i = 0; i < 5_000; i++) {
      allowRatingRequest({ voterToken: voter(i), ip: `ip-${i}` }, NOW)
    }
    for (let i = 0; i < 19; i++) {
      allowRatingRequest({ voterToken: voter(0), ip: 'ip-0' }, NOW)
    }
    expect(allowRatingRequest({ voterToken: voter(0), ip: 'ip-0' }, NOW)).toBe(
      false
    )

    // Chave nova com o mapa cheio derruba a mais antiga (voter-0): o contador dele zera.
    allowRatingRequest({ voterToken: voter(5_000), ip: 'ip-novo' }, NOW)

    expect(
      allowRatingRequest({ voterToken: voter(0), ip: 'ip-outro' }, NOW)
    ).toBe(true)
  })
})
