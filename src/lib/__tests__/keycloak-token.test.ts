import {
  KEYCLOAK_TEST_BASE,
  KEYCLOAK_TEST_JWKS_URL,
  createRealmKey,
  jwksResponse,
  signAccessToken,
  unsignedAccessToken,
} from '@/test/keycloak-token-fixture'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const realmKey = createRealmKey('kid-realm')
const otherKey = createRealmKey('kid-outro')

async function loadModule() {
  vi.resetModules()
  return import('@/lib/keycloak-token')
}

describe('verifyAccessToken', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', KEYCLOAK_TEST_BASE)
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => jwksResponse([realmKey]))
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('aceita token assinado pela chave do realm e devolve o sub', async () => {
    const { verifyAccessToken } = await loadModule()

    const result = await verifyAccessToken(signAccessToken(realmKey))

    expect(result?.sub).toBe('sub-sintetico')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toBe(KEYCLOAK_TEST_JWKS_URL)
  })

  it('reaproveita as chaves em cache entre chamadas', async () => {
    const { verifyAccessToken } = await loadModule()

    await verifyAccessToken(signAccessToken(realmKey))
    await verifyAccessToken(signAccessToken(realmKey))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('recusa token sem assinatura, com alg none, mesmo com exp no futuro', async () => {
    const { verifyAccessToken } = await loadModule()

    expect(await verifyAccessToken(unsignedAccessToken())).toBeNull()
    expect(
      await verifyAccessToken(signAccessToken(realmKey, {}, { alg: 'none' }))
    ).toBeNull()
  })

  it('recusa token assinado por outra chave com o kid do realm', async () => {
    const { verifyAccessToken } = await loadModule()

    const forged = signAccessToken(otherKey, {}, { kid: realmKey.kid })

    expect(await verifyAccessToken(forged)).toBeNull()
  })

  it('recusa payload adulterado depois da assinatura', async () => {
    const { verifyAccessToken } = await loadModule()
    const [header, , signature] = signAccessToken(realmKey).split('.')
    const payload = Buffer.from(
      JSON.stringify({ sub: 'outro', exp: Math.floor(Date.now() / 1000) + 60 })
    ).toString('base64url')

    expect(
      await verifyAccessToken(`${header}.${payload}.${signature}`)
    ).toBeNull()
  })

  it('recusa token expirado, ausente, malformado e sem identidade', async () => {
    const { verifyAccessToken } = await loadModule()

    expect(
      await verifyAccessToken(signAccessToken(realmKey, {}, { expiresIn: -60 }))
    ).toBeNull()
    expect(await verifyAccessToken(undefined)).toBeNull()
    expect(await verifyAccessToken('nao-e-jwt')).toBeNull()
    expect(
      await verifyAccessToken(signAccessToken(realmKey, { sub: '' }))
    ).toBeNull()
  })

  it('usa preferred_username quando o token não traz sub', async () => {
    const { verifyAccessToken } = await loadModule()

    const result = await verifyAccessToken(
      signAccessToken(realmKey, {
        sub: undefined,
        preferred_username: 'usuario-sintetico',
      })
    )

    expect(result?.sub).toBe('usuario-sintetico')
  })

  it('kid desconhecido recarrega as chaves no máximo uma vez por minuto', async () => {
    const { verifyAccessToken } = await loadModule()
    const now = Date.now()

    await verifyAccessToken(signAccessToken(realmKey), now)
    for (let i = 0; i < 20; i++) {
      const token = signAccessToken(otherKey, {}, { kid: `kid-aleatorio-${i}` })
      expect(await verifyAccessToken(token, now + 1_000)).toBeNull()
    }

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('aceita a chave nova do realm depois da rotação', async () => {
    const { verifyAccessToken } = await loadModule()
    const now = Date.now()
    await verifyAccessToken(signAccessToken(realmKey), now)

    fetchMock.mockImplementation(async () => jwksResponse([realmKey, otherKey]))
    const result = await verifyAccessToken(
      signAccessToken(otherKey),
      now + 61_000
    )

    expect(result?.sub).toBe('sub-sintetico')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('lança JwksUnavailableError quando as chaves não carregam', async () => {
    const { verifyAccessToken, JwksUnavailableError } = await loadModule()
    fetchMock.mockImplementation(
      async () => new Response('erro', { status: 502 })
    )

    await expect(
      verifyAccessToken(signAccessToken(realmKey))
    ).rejects.toBeInstanceOf(JwksUnavailableError)
  })

  it('lança JwksUnavailableError sem a URL base do realm', async () => {
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL', '')
    const { verifyAccessToken, JwksUnavailableError } = await loadModule()

    await expect(
      verifyAccessToken(signAccessToken(realmKey))
    ).rejects.toBeInstanceOf(JwksUnavailableError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('segue verificando com as chaves já carregadas se o endpoint cair', async () => {
    const { verifyAccessToken } = await loadModule()
    const now = Date.now()
    await verifyAccessToken(signAccessToken(realmKey), now)

    fetchMock.mockImplementation(async () => {
      throw new Error('rede fora')
    })
    const result = await verifyAccessToken(
      signAccessToken(realmKey),
      now + 11 * 60_000
    )

    expect(result?.sub).toBe('sub-sintetico')
  })
})
