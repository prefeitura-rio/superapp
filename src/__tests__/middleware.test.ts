import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { middleware } from '../middleware'

function requestFor(path: string): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'))
}

function rewriteTarget(response: Response | undefined): string | null {
  return response?.headers.get('x-middleware-rewrite') ?? null
}

describe('middleware — gating de Dívida Ativa', () => {
  // Ausente é o estado padrão do gating: sem a flag, o módulo não existe para o cidadão.
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA', undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('flag ausente (padrão: módulo oculto)', () => {
    test('reescreve a raiz do módulo para /not-found', async () => {
      const response = await middleware(requestFor('/servicos/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('reescreve uma rota filha para /not-found', async () => {
      const response = await middleware(
        requestFor('/servicos/divida-ativa/imoveis')
      )

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('reescreve uma rota neta para /not-found', async () => {
      const response = await middleware(
        requestFor('/servicos/divida-ativa/parcelamento/01234567890')
      )

      expect(rewriteTarget(response)).toContain('/not-found')
    })

    test('não bloqueia rota que apenas começa com o mesmo texto', async () => {
      const response = await middleware(
        requestFor('/servicos/divida-ativa-simulador')
      )

      expect(rewriteTarget(response)).toBeNull()
    })

    test('não interfere em outros serviços', async () => {
      const response = await middleware(requestFor('/servicos/mei'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('a resposta bloqueada carrega o header de CSP', async () => {
      const response = await middleware(requestFor('/servicos/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
      expect(response?.headers.get('Content-Security-Policy')).toContain(
        "default-src 'self'"
      )
    })
  })

  describe('flag habilitada', () => {
    test('deixa a raiz do módulo passar quando a flag é "true"', async () => {
      process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA = 'true'

      const response = await middleware(requestFor('/servicos/divida-ativa'))

      expect(rewriteTarget(response)).toBeNull()
    })

    test('deixa as rotas filhas passarem quando a flag é "true"', async () => {
      process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA = 'true'

      const response = await middleware(
        requestFor('/servicos/divida-ativa/imoveis')
      )

      expect(rewriteTarget(response)).toBeNull()
    })

    test('mantém o módulo oculto para qualquer valor diferente de "true"', async () => {
      process.env.NEXT_PUBLIC_FEATURE_DIVIDA_ATIVA = 'TRUE'

      const response = await middleware(requestFor('/servicos/divida-ativa'))

      expect(rewriteTarget(response)).toContain('/not-found')
    })
  })
})
