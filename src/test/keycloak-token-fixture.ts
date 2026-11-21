import { type KeyObject, generateKeyPairSync, sign } from 'node:crypto'

export const KEYCLOAK_TEST_BASE =
  'https://auth.example.gov.br/auth/realms/teste/protocol/openid-connect'
export const KEYCLOAK_TEST_JWKS_URL = `${KEYCLOAK_TEST_BASE}/certs`

export interface TestRealmKey {
  kid: string
  privateKey: KeyObject
  jwk: Record<string, unknown>
}

export function createRealmKey(kid: string): TestRealmKey {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  })
  const jwk = {
    ...publicKey.export({ format: 'jwk' }),
    kid,
    alg: 'RS256',
    use: 'sig',
  }
  return { kid, privateKey, jwk }
}

export function jwksResponse(keys: TestRealmKey[]): Response {
  return new Response(JSON.stringify({ keys: keys.map(key => key.jwk) }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

function base64Url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

/** Synthetic access token signed with `key`; `kid` may name another key. */
export function signAccessToken(
  key: TestRealmKey,
  claims: Record<string, unknown> = {},
  options: { kid?: string; alg?: string; expiresIn?: number } = {}
): string {
  const header = base64Url({
    alg: options.alg ?? 'RS256',
    typ: 'JWT',
    kid: options.kid ?? key.kid,
  })
  const payload = base64Url({
    sub: 'sub-sintetico',
    exp: Math.floor(Date.now() / 1000) + (options.expiresIn ?? 3600),
    ...claims,
  })
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(`${header}.${payload}`),
    key.privateKey
  ).toString('base64url')
  return `${header}.${payload}.${signature}`
}

/** Token anyone can write by hand: valid shape and expiry, no signature. */
export function unsignedAccessToken(claims: Record<string, unknown> = {}) {
  const header = base64Url({ alg: 'none', typ: 'JWT' })
  const payload = base64Url({
    sub: 'sub-forjado',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  })
  return `${header}.${payload}.`
}
