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
      expect(response?.headers.get('Permissions-Policy')).toBe(
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
      )
      expect(response?.headers.get('Cross-Origin-Resource-Policy')).toBe(
        'same-site'
      )
      expect(response?.headers.get('Cross-Origin-Opener-Policy')).toBeNull()
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

describe('middleware — Termos de uso', () => {
  beforeEach(() => {
    // Se a rota caísse no login, o `buildAuthUrl` precisaria destas variáveis.
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

  describe('middleware — superfícies Salesforce', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'false')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    test.each([
      '/minhas-solicitacoes',
      '/consulta-protocolo',
      '/solicitacoes',
      '/solicitacoes/RIO-123',
      '/carta-de-servicos',
      '/carta-de-servicos/2951',
    ])('%s reescreve para /not-found quando desabilitada', async path => {
      const response = await middleware(requestFor(path))

      expect(rewriteTarget(response)).toContain('/not-found')
      expect(redirectTarget(response)).toBeNull()
    })

    test('/servicos permanece acessível pelo fallback legado', async () => {
      const response = await middleware(requestFor('/servicos'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('as rotas Salesforce ficam acessíveis quando habilitada', async () => {
      vi.stubEnv('NEXT_PUBLIC_FEATURE_SALESFORCE', 'true')

      const response = await middleware(requestFor('/ouvidoria'))

      expect(rewriteTarget(response)).toBeNull()
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test.each(['/termos-de-uso', '/termos-de-uso/prefrio-site'])(
    '%s abre sem login',
    async path => {
      const response = await middleware(requestFor(path))

      expect(redirectTarget(response)).toBeNull()
    }
  )
})

describe('middleware — CSP do VLibras', () => {
  test('a rota pública libera o iframe do widget em frame-src', async () => {
    const response = await middleware(requestFor('/'))
    const csp = response?.headers.get('Content-Security-Policy') ?? ''
    const frameSrc = csp
      .split(';')
      .find(directive => directive.includes('frame-src'))

    expect(frameSrc).toContain('https://vlibras.gov.br')
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-eval'/)
  })

  test('a rota pública envia Permissions-Policy e CORP, sem COOP', async () => {
    const response = await middleware(requestFor('/'))

    expect(response?.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    )
    expect(response?.headers.get('Cross-Origin-Resource-Policy')).toBe(
      'same-site'
    )
    expect(response?.headers.get('Cross-Origin-Opener-Policy')).toBeNull()
  })

  test('token inválido na home ainda envia os cabeçalhos', async () => {
    const request = requestFor('/')
    request.cookies.set('access_token', 'nao-e-jwt')

    const response = await middleware(request)

    expect(redirectTarget(response)).toContain('/sessao-expirada')
    expect(response?.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
    )
    expect(response?.headers.get('Cross-Origin-Resource-Policy')).toBe(
      'same-site'
    )
  })
})

describe('middleware — menus por módulo absorvidos pelo menu global', () => {
  beforeEach(() => {
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

  test.each([
    ['/servicos/cursos/opcoes', '/servicos/cursos'],
    ['/servicos/trabalho/menu', '/servicos/trabalho'],
  ])('%s responde 308 para %s', async (from, to) => {
    const response = await middleware(requestFor(from))

    expect(response?.status).toBe(308)
    expect(new URL(redirectTarget(response) ?? '').pathname).toBe(to)
  })

  test('mantém a query string no redirect', async () => {
    const response = await middleware(
      requestFor('/servicos/trabalho/menu?utm_source=app')
    )

    const target = new URL(redirectTarget(response) ?? '')
    expect(target.pathname).toBe('/servicos/trabalho')
    expect(target.searchParams.get('utm_source')).toBe('app')
  })

  test.each([
    '/servicos/cursos',
    '/servicos/trabalho',
    '/servicos/trabalho/menu-de-vagas',
    // A página antiga de termos continua existindo (fonte do texto v1.0).
    '/servicos/trabalho/termos-de-uso',
  ])('%s não é redirecionada', async path => {
    const response = await middleware(requestFor(path))

    expect(response?.status).not.toBe(308)
    expect(redirectTarget(response)).toBeNull()
  })
})
