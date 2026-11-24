import { randomBytes } from 'node:crypto'

/**
 * Cookie HttpOnly com o identificador anônimo do visitante (`voterToken`).
 * Emitido pelo servidor no primeiro voto e guardado por 1 ano. Não carrega nome,
 * CPF, e-mail nem IP; o Salesforce grava só o SHA-256 dele.
 */
export const VOTER_TOKEN_COOKIE = 'prefrio_avaliacao_sid'

export const VOTER_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const VOTER_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/

/** 128 bits aleatórios em base64url (22 caracteres). */
export function createVoterToken(): string {
  return randomBytes(16).toString('base64url')
}

export function isValidVoterToken(value: string | undefined): value is string {
  return !!value && VOTER_TOKEN_PATTERN.test(value)
}

export function voterTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: VOTER_TOKEN_MAX_AGE_SECONDS,
  }
}
