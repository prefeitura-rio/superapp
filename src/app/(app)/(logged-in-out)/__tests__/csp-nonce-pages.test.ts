import { describe, expect, it } from 'vitest'

// O middleware gera um nonce da CSP por requisição e o layout raiz o repassa
// ao script da fila de acesso (rio-queue). Uma página `force-static` sai
// pré-renderizada com um nonce fixo, que não bate com o da CSP da requisição,
// e o navegador bloqueia o script da fila.
const pages: Array<[string, () => Promise<Record<string, unknown>>]> = [
  ['/ouvidoria', () => import('../ouvidoria/page')],
  ['/faq/cursos', () => import('../faq/cursos/page')],
  ['/faq/prefrio', () => import('../faq/prefrio/page')],
  ['/faq/trabalho', () => import('../faq/trabalho/page')],
  [
    '/politicas-de-uso-de-cookies',
    () => import('../politicas-de-uso-de-cookies/page'),
  ],
  [
    '/servicos/cursos/faq',
    () => import('../servicos/(servicos)/cursos/faq/page'),
  ],
  [
    '/servicos/trabalho/faq',
    () => import('../servicos/(servicos)/trabalho/faq/page'),
  ],
  ['/servicos/mei/faq', () => import('../servicos/(servicos)/mei/faq/page')],
]

describe('páginas públicas com o script da fila (rio-queue)', () => {
  it.each(pages)(
    '%s não é force-static: precisa do nonce da CSP por requisição',
    async (_route, load) => {
      const pageModule = await load()

      expect(typeof pageModule.default).toBe('function')
      expect(pageModule).not.toHaveProperty('dynamic', 'force-static')
    }
  )
})
