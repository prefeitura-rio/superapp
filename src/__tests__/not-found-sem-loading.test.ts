// @vitest-environment node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Um `loading.tsx` vira um `<Suspense>` que envolve a página do segmento e
 * todas as rotas filhas. Quando o fallback renderiza, o Next.js abre o stream
 * e fixa o status em 200: um `notFound()` chamado depois disso renderiza a UI
 * de 404, mas a resposta HTTP continua 200 (soft 404). Ver "Status codes" em
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`.
 *
 * Por isso nenhuma página do app que chama `notFound()` pode ter `loading.*`
 * em qualquer diretório entre `src/app` e ela. Uma listagem que queira manter
 * o skeleton fica num route group `(main)` junto do seu `loading.tsx`.
 */

const APP_DIR = path.resolve(__dirname, '../app')
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js'])
const LOADING_FILES = ['loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js']

function findPages(dir: string): string[] {
  const pages: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...findPages(full))
    } else if (PAGE_FILES.has(entry.name)) {
      pages.push(full)
    }
  }
  return pages
}

function loadingFilesAbove(pageFile: string): string[] {
  const found: string[] = []
  const segments = path
    .relative(APP_DIR, path.dirname(pageFile))
    .split(path.sep)
  let current = APP_DIR
  for (const segment of ['', ...segments]) {
    current = path.join(current, segment)
    for (const file of LOADING_FILES) {
      if (existsSync(path.join(current, file))) {
        found.push(path.relative(APP_DIR, path.join(current, file)))
      }
    }
  }
  return found
}

const pagesWithNotFound = findPages(APP_DIR)
  .filter(file => readFileSync(file, 'utf8').includes('notFound()'))
  .map(file => path.relative(APP_DIR, file))

const INSCRICAO_VAGA =
  '(app)/(logged-in-out)/servicos/(servicos)/trabalho/[id]/inscricao/page.tsx'
const NOME_IMOVEL = '(app)/(logged-in)/divida-ativa/imoveis/[id]/nome/page.tsx'

describe('páginas que chamam notFound()', () => {
  it('inclui as páginas de inscrição em vaga e de nome do imóvel', () => {
    expect(pagesWithNotFound).toEqual(
      expect.arrayContaining([INSCRICAO_VAGA, NOME_IMOVEL])
    )
  })

  it.each(pagesWithNotFound)(
    '%s não fica dentro de um loading.* (o 404 sai antes do stream)',
    page => {
      expect(loadingFilesAbove(path.join(APP_DIR, page))).toEqual([])
    }
  )
})

describe('listagens de /divida-ativa', () => {
  it.each([
    '(app)/(logged-in)/divida-ativa/(main)',
    '(app)/(logged-in)/divida-ativa/imoveis/(main)',
  ])('%s mantém o loading.tsx junto da página, no route group', routeDir => {
    expect(existsSync(path.join(APP_DIR, routeDir, 'page.tsx'))).toBe(true)
    expect(existsSync(path.join(APP_DIR, routeDir, 'loading.tsx'))).toBe(true)
  })
})
