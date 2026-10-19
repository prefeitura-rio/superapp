import {
  provedorDoToken,
  urlContaIdentidadeCarioca,
} from '@/lib/provedor-login'
import { afterEach, describe, expect, test, vi } from 'vitest'

describe('provedorDoToken', () => {
  test('gov.br pela claim identity_provider', () => {
    expect(provedorDoToken({ identity_provider: 'govbr' })).toBe('govbr')
  })

  test('outro provedor configurado conta como conta Identidade Carioca', () => {
    expect(provedorDoToken({ idp: 'keycloak' })).toBe('identidade-carioca')
  })

  // Sem mapper no realm, ou login local: não dá para saber.
  test('sem claim de provedor, devolve null', () => {
    expect(provedorDoToken({ preferred_username: '52998224725' })).toBeNull()
    expect(provedorDoToken({ identity_provider: '' })).toBeNull()
  })
})

describe('urlContaIdentidadeCarioca', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('troca o endpoint OIDC pelo console de conta do mesmo realm', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL',
      'https://auth-idrio.apps.rio.gov.br/auth/realms/idrio_cidadao/protocol/openid-connect'
    )

    expect(urlContaIdentidadeCarioca()).toBe(
      'https://auth-idrio.apps.rio.gov.br/auth/realms/idrio_cidadao/account'
    )
  })
})
