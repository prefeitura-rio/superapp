import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { middleware } from '../middleware'

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'))
}

function rewriteTarget(response: Response | undefined): string | null {
  return response?.headers.get('x-middleware-rewrite') ?? null
}

function redirectTarget(response: Response | undefined): string | null {
  return response?.headers.get('location') ?? null
}

describe('middleware — gating de Dívida Ativa', () => {
  beforeEach(() => {
    // Ausente é o estado padrão do gating: sem a flag, o módulo não existe para o cidadão.
    vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', undefined)

    // `/divida-ativa` está fora da allowlist pública, então todo teste com a flag ligada e
    // sem cookie termina no redirect de login. Sem estas variáveis o `buildAuthUrl` monta
    // "undefined/auth?..." e o middleware estoura com Invalid URL.
    vi.stubEnv(
      'NEXT_PUBLIC_IDENTIDADE_CARIOCA_BASE_URL',
      'https://auth.example.gov.br/realms/idrio/protocol/openid-connect'
    )
    vi.stubEnv('NEXT_PUBLIC_IDENTIDADE_CARIOCA_CLIENT_ID', 'test-client')
    vi.stubEnv(
      'NEXT_PUBLIC_IDENTIDADE_CARIOCA_REDIRECT_URI',
      'http://localhost:3000/auth/callback'
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('flag ausente (padrão: módulo oculto)', () => {
    test('reescreve a raiz do módulo para /not-found', async () => {
      const response = await middleware(requestFor('/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('reescreve uma rota filha para /not-found', async () => {
      const response = await middleware(requestFor('/divida-ativa/imoveis'))

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('reescreve uma rota neta para /not-found', async () => {
      const response = await middleware(
        requestFor('/divida-ativa/parcelamento/01234567890')
      )

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('não bloqueia rota que apenas começa com o mesmo texto', async () => {
      const response = await middleware(requestFor('/divida-ativa-simulador'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('não interfere em outros serviços', async () => {
      const response = await middleware(requestFor('/servicos/mei'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('a resposta bloqueada carrega o header de CSP', async () => {
      const response = await middleware(requestFor('/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
      expect(response?.headers.get('Content-Security-Policy')).toContain(
        "default-src 'self'"
      )
    })

    test('o gating vem antes da checagem de auth: anônimo não é mandado ao login', async () => {
      const response = await middleware(requestFor('/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
      expect(redirectTarget(response)).toBeNull()
    })
  })

  describe('flag habilitada', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', 'true')
    })

    test('a raiz do módulo não é mais reescrita para /not-found', async () => {
      const response = await middleware(requestFor('/divida-ativa'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('as rotas filhas não são mais reescritas para /not-found', async () => {
      const response = await middleware(requestFor('/divida-ativa/imoveis'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('mantém o módulo oculto para qualquer valor diferente de "true"', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', 'TRUE')

      const response = await middleware(requestFor('/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
    })
  })

  // O módulo exige login. A proteção não vem do grupo de rotas `(logged-in)` — nome de pasta
  // não tem efeito no middleware — e sim de `/divida-ativa` estar FORA da allowlist
  // `publicRoutes`. Mover o módulo para baixo de `/servicos/*` o tornaria público de novo.
  describe('login obrigatório (flag habilitada, cidadão anônimo)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', 'true')
    })

    test('redireciona a raiz do módulo para o login', async () => {
      const response = await middleware(requestFor('/divida-ativa'))

      expect(redirectTarget(response)).toContain('auth.example.gov.br')
    })

    test('redireciona rota filha para o login', async () => {
      const response = await middleware(requestFor('/divida-ativa/imoveis'))

      expect(redirectTarget(response)).toContain('auth.example.gov.br')
    })

    test('preserva a rota de origem para voltar depois do login', async () => {
      const response = await middleware(
        requestFor('/divida-ativa/parcelamento/01234567890')
      )

      // `state` sai com dois níveis de encode: `buildAuthUrl` chama `encodeURIComponent` e
      // o `URLSearchParams` codifica de novo ao serializar. É o formato que o callback espera.
      const state = new URL(redirectTarget(response) ?? '').searchParams.get(
        'state'
      )

      expect(decodeURIComponent(state ?? '')).toBe(
        '/divida-ativa/parcelamento/01234567890'
      )
    })

    test('a rota pública de serviços continua acessível sem login', async () => {
      const response = await middleware(requestFor('/servicos/mei'))

      expect(redirectTarget(response)).toBeNull()
    })
  })
})
