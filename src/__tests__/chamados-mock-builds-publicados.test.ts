// @vitest-environment node
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const WORKFLOWS_DIR = path.resolve(__dirname, '../../.github/workflows')

function valoresDoMockChamados(workflow: string): string[] {
  const source = readFileSync(path.join(WORKFLOWS_DIR, workflow), 'utf8')
  return [
    ...source.matchAll(/NEXT_PUBLIC_USE_MOCK_CHAMADOS[=:]\s*"([^"]*)"/g),
  ].map(match => match[1])
}

// DEV-568 / DEV-612: the SGRC history mock is the same fictitious data for every
// citizen. Until the real integration (PREF-691) filters by the citizen's CPF,
// the builds that reach citizens (staging and production) keep the mock off.
describe('DEV-612: modo mock de chamados desligado nos builds publicados', () => {
  it.each(['deploy-staging.yaml', 'release-production.yaml'])(
    '%s builda com NEXT_PUBLIC_USE_MOCK_CHAMADOS="false"',
    workflow => {
      const valores = valoresDoMockChamados(workflow)

      expect(valores.length).toBeGreaterThan(0)
      expect(valores.every(valor => valor === 'false')).toBe(true)
    }
  )
})
