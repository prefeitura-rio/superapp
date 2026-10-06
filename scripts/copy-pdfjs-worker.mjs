import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const destination = join(rootDir, 'public', 'pdf.worker.min.mjs')

const source = require.resolve('pdfjs-dist/build/pdf.worker.min.mjs')

mkdirSync(dirname(destination), { recursive: true })
copyFileSync(source, destination)

console.log(
  `Copied pdf.js worker → public/pdf.worker.min.mjs\n  from ${source}`
)
