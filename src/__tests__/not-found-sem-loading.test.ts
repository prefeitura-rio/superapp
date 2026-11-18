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
 *
 * Exceções intencionais (SOFT_404_ALLOWED): páginas onde o skeleton instantâneo
 * via `loading.tsx` tem prioridade sobre o status HTTP exato. O Next.js injeta
 * automaticamente `<meta name="robots" content="noindex">` nessas respostas,
 * evitando indexação incorreta. Ver seção "Status codes" da doc acima.
 *   - Rotas autenticadas: o status HTTP 404 não tem relevância para SEO.
 *   - Rotas públicas com skeleton crítico para UX: o `noindex` meta é suficiente.
 */

const APP_DIR = path.resolve(__dirname, '../app')
const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js'])
const LOADING_FILES = ['loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js']

/**
 * Páginas com soft 404 intencional: têm `loading.tsx` ancestor para skeleton
 * instantâneo e aceitam status HTTP 200 no lugar de 404.
 */
const SOFT_404_ALLOWED = new Set([
  // Rota autenticada — status HTTP 404 não tem relevância para SEO.
  '(app)/(logged-in)/carteira/cadmicro/[vehicleId]/page.tsx',
  '(app)/(logged-in)/carteira/cadmicro/[vehicleId]/editar/page.tsx',
  // Rota pública — skeleton crítico para UX; Next.js adiciona noindex no soft 404.
  '(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/page.tsx',
])

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

// Caminhos sempre com `/`, para casar com as constantes abaixo também no Windows.
const pagesWithNotFound = findPages(APP_DIR)
  .filter(file => readFileSync(file, 'utf8').includes('notFound()'))
  .map(file => path.relative(APP_DIR, file).split(path.sep).join('/'))

const INSCRICAO_VAGA =
  '(app)/(logged-in-out)/servicos/(servicos)/trabalho/[id]/inscricao/page.tsx'
const NOME_IMOVEL = '(app)/(logged-in)/divida-ativa/imoveis/[id]/nome/page.tsx'

describe('páginas que chamam notFound()', () => {
  it('inclui as páginas de inscrição em vaga e de nome do imóvel', () => {
    expect(pagesWithNotFound).toEqual(
      expect.arrayContaining([INSCRICAO_VAGA, NOME_IMOVEL])
    )
  })

  it.each(pagesWithNotFound.filter(p => !SOFT_404_ALLOWED.has(p)))(
    '%s não fica dentro de um loading.* (o 404 sai antes do stream)',
    page => {
      expect(loadingFilesAbove(path.join(APP_DIR, page))).toEqual([])
    }
  )
})

describe('soft 404 intencionais (loading.tsx + notFound())', () => {
  it.each([...SOFT_404_ALLOWED])(
    '%s tem loading.tsx ancestor (skeleton instantâneo — soft 404 documentado)',
    page => {
      expect(loadingFilesAbove(path.join(APP_DIR, page))).not.toEqual([])
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
