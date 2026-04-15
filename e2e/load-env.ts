import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Loads KEY=VALUE pairs from .env files into process.env when the key is missing or empty.
 * Order: .env.e2e → .env.local → .env (first wins for each key among files, but does not override existing process.env).
 */
export function loadEnvFiles(): void {
  for (const name of ['.env.e2e', '.env.local', '.env']) {
    const filePath = resolve(process.cwd(), name)
    if (!existsSync(filePath)) continue

    for (const rawLine of readFileSync(filePath, 'utf8').split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      const current = process.env[key]
      if (current === undefined || current === '') {
        process.env[key] = value
      }
    }
  }
}
