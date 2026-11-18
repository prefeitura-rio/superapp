// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '../..')
const E2E_DIR = path.join(ROOT, 'e2e')
const QUALITY_GATE = path.join(ROOT, '.github/workflows/pr-quality-gate.yaml')

function e2eSources(): Array<{ file: string; source: string }> {
  return readdirSync(E2E_DIR, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('.ts'))
    .map(file => ({
      file,
      source: readFileSync(path.join(E2E_DIR, file), 'utf8'),
    }))
}

/**
 * Returns the `env:` block of the "Run E2E tests" step: the lines after its
 * `env:` key, up to the next step (`- name:`).
 */
function runE2EStepEnv(): string {
  const source = readFileSync(QUALITY_GATE, 'utf8')
  const start = source.indexOf('- name: Run E2E tests')
  expect(start).toBeGreaterThan(-1)
  const rest = source.slice(start + 1)
  const next = rest.indexOf('- name:')
  const step = next === -1 ? rest : rest.slice(0, next)
  const envStart = step.indexOf('env:')
  expect(envStart).toBeGreaterThan(-1)
  return step.slice(envStart)
}

// DEV-643: FEATURE_SALESFORCE and USE_MOCK_CHAMADOS are read by the server at
// runtime (no NEXT_PUBLIC_ prefix since PREF-408). The e2e skips must follow the
// current name, and the step that starts the server and Playwright must carry
// the flags, or the Atendimentos / Minhas solicitações blocks are always skipped.
describe('DEV-643: e2e segue as flags de runtime de Salesforce', () => {
  it('nenhum arquivo de e2e lê os nomes antigos NEXT_PUBLIC_*', () => {
    const offenders = e2eSources()
      .filter(({ source }) =>
        /NEXT_PUBLIC_(FEATURE_SALESFORCE|USE_MOCK_CHAMADOS)/.test(source)
      )
      .map(({ file }) => file)

    expect(offenders).toEqual([])
  })

  it('home.spec.ts decide os blocos de Atendimentos por FEATURE_SALESFORCE', () => {
    const source = readFileSync(path.join(E2E_DIR, 'home.spec.ts'), 'utf8')

    expect(source).toMatch(/process\.env\.FEATURE_SALESFORCE/)
  })

  it('o passo "Run E2E tests" liga FEATURE_SALESFORCE e USE_MOCK_CHAMADOS em runtime', () => {
    const env = runE2EStepEnv()

    expect(env).toMatch(/^\s+FEATURE_SALESFORCE:\s*"true"\s*$/m)
    expect(env).toMatch(/^\s+USE_MOCK_CHAMADOS:\s*"true"\s*$/m)
  })
})
