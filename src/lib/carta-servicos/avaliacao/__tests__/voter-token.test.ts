// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  VOTER_TOKEN_COOKIE,
  VOTER_TOKEN_MAX_AGE_SECONDS,
  createVoterToken,
  isValidVoterToken,
  voterTokenCookieOptions,
} from '../voter-token'

describe('createVoterToken', () => {
  test('gera 128 bits em base64url (22 caracteres) aceitos pela validação', () => {
    const token = createVoterToken()

    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(Buffer.from(token, 'base64url')).toHaveLength(16)
    expect(isValidVoterToken(token)).toBe(true)
  })

  test('não repete tokens', () => {
    const tokens = new Set(Array.from({ length: 500 }, createVoterToken))

    expect(tokens.size).toBe(500)
  })
})

describe('isValidVoterToken', () => {
  test('recusa ausente, vazio, tamanho errado e caracteres fora do base64url', () => {
    for (const value of [
      undefined,
      '',
      'A'.repeat(21),
      'A'.repeat(23),
      `${'A'.repeat(21)}=`,
      `${'A'.repeat(21)}+`,
      `${'A'.repeat(21)}/`,
      `${'A'.repeat(21)} `,
      `${'A'.repeat(21)};`,
    ]) {
      expect(isValidVoterToken(value)).toBe(false)
    }
  })

  test('aceita base64url com - e _', () => {
    expect(isValidVoterToken('Ab-_0123456789xyzXYZ-_')).toBe(true)
  })
})

describe('voterTokenCookieOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('cookie HttpOnly, SameSite=Lax, no site inteiro, por 1 ano', () => {
    expect(VOTER_TOKEN_COOKIE).toBe('prefrio_avaliacao_sid')
    expect(VOTER_TOKEN_MAX_AGE_SECONDS).toBe(31_536_000)
    expect(voterTokenCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: VOTER_TOKEN_MAX_AGE_SECONDS,
    })
  })

  test('Secure só em produção (localhost em http continua funcionando)', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(voterTokenCookieOptions().secure).toBe(true)

    vi.stubEnv('NODE_ENV', 'development')
    expect(voterTokenCookieOptions().secure).toBe(false)
  })
})
