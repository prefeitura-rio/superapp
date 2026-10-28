// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Um `loading.tsx` vira um `<Suspense>` que envolve a página do segmento e
 * todas as rotas filhas. Quando o fallback renderiza, o Next.js abre o stream
 * e fixa o status em 200: um `notFound()` chamado depois disso renderiza a UI
 * de 404, mas a resposta HTTP continua 200 (soft 404). Ver "Status codes" em
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`.
 *
 * As páginas de detalhe abaixo chamam `notFound()` para slug inexistente, então
 * nenhum diretório entre `src/app` e elas pode ter `loading.*`.
 */

const APP_DIR = path.resolve(__dirname, '../app')
const SERVICOS = '(app)/(logged-in-out)/servicos'
const LOADING_FILES = ['loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js']

const detailPages = [
  `${SERVICOS}/(servicos)/trabalho/[id]`,
  `${SERVICOS}/(servicos)/cursos/[slug]`,
  `${SERVICOS}/(servicos)/mei/[slug]`,
  `${SERVICOS}/categoria/[category-slug]/[...service-params]/(service-detail)`,
  `${SERVICOS}/(servicos)/empresas/[cnpj]`,
]

const listingPages = [
  `${SERVICOS}/(servicos)/trabalho/(main)`,
  `${SERVICOS}/(servicos)/cursos/(main)`,
  `${SERVICOS}/(servicos)/mei/(main)`,
  `${SERVICOS}/categoria/[category-slug]/(main)`,
]

function loadingFilesAbove(routeDir: string): string[] {
  const found: string[] = []
  let current = APP_DIR
  for (const segment of routeDir.split('/')) {
    current = path.join(current, segment)
    for (const file of LOADING_FILES) {
      if (existsSync(path.join(current, file))) {
        found.push(path.relative(APP_DIR, path.join(current, file)))
      }
    }
  }
  return found
}

describe('páginas de /servicos que chamam notFound()', () => {
  it.each(detailPages)('%s chama notFound() na página', routeDir => {
    const source = readFileSync(
      path.join(APP_DIR, routeDir, 'page.tsx'),
      'utf8'
    )
    expect(source).toContain('notFound()')
  })

  it.each(detailPages)(
    '%s não fica dentro de um loading.* (o 404 sai antes do stream)',
    routeDir => {
      expect(loadingFilesAbove(routeDir)).toEqual([])
    }
  )
})

describe('listagens de /servicos', () => {
  it.each(listingPages)(
    '%s mantém o loading.tsx junto da página, no route group',
    routeDir => {
      expect(existsSync(path.join(APP_DIR, routeDir, 'page.tsx'))).toBe(true)
      expect(existsSync(path.join(APP_DIR, routeDir, 'loading.tsx'))).toBe(true)
    }
  )
})
