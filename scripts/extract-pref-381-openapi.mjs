import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const SOURCE_FILE =
  process.env.APP_GO_API_OPENAPI ?? '../app-go-api/docs/openapi-v3.json'
const OUTPUT_FILE = './.tmp/pref-381-openapi.json'
const ORVAL_OUTPUT_DIR = './.tmp/orval-pref-381'

// Limpa somente os artefatos temporários da PREF-381.
await rm(OUTPUT_FILE, { force: true })
await rm(ORVAL_OUTPUT_DIR, { recursive: true, force: true })

const OPERATIONS = [
  {
    method: 'get',
    path: '/api/v1/empregabilidade/habilidades/areas-atuacao-habilidades',
  },
  {
    method: 'get',
    path: '/api/v1/empregabilidade/comportamentos-atitudes',
  },
  {
    method: 'get',
    path: '/api/v1/empregabilidade/curriculo/{cpf}',
  },
  {
    method: 'put',
    path: '/api/v1/empregabilidade/curriculo',
  },
]

const source = JSON.parse(await readFile(SOURCE_FILE, 'utf8'))

const result = {
  openapi: source.openapi,
  info: source.info,
  paths: {},
  components: {},
}

for (const { method, path } of OPERATIONS) {
  const pathItem = source.paths?.[path]

  if (!pathItem) {
    throw new Error(`Path não encontrado no OpenAPI: ${path}`)
  }

  const operation = pathItem[method]

  if (!operation) {
    throw new Error(
      `Operação não encontrada no OpenAPI: ${method.toUpperCase()} ${path}`
    )
  }

  result.paths[path] ??= {}

  // Parâmetros podem estar declarados no próprio Path Item.
  if (pathItem.parameters) {
    result.paths[path].parameters = pathItem.parameters
  }

  result.paths[path][method] = operation

  if (method === 'put' && path === '/api/v1/empregabilidade/curriculo') {
    result.paths[path][method] = {
      ...operation,
      tags: ['empregabilidade-curriculo-itens'],
    }
  }
}

const references = new Set()

function collectReferences(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectReferences(item)
    }

    return
  }

  if (!value || typeof value !== 'object') {
    return
  }

  if (typeof value.$ref === 'string') {
    references.add(value.$ref)
  }

  for (const child of Object.values(value)) {
    collectReferences(child)
  }
}

function resolveReference(ref) {
  if (!ref.startsWith('#/')) {
    throw new Error(`$ref externo não suportado: ${ref}`)
  }

  const parts = ref
    .slice(2)
    .split('/')
    .map(part => part.replaceAll('~1', '/').replaceAll('~0', '~'))

  let value = source

  for (const part of parts) {
    value = value?.[part]

    if (value === undefined) {
      throw new Error(`$ref não encontrado: ${ref}`)
    }
  }

  return {
    parts,
    value,
  }
}

function copyReference(ref) {
  const { parts, value } = resolveReference(ref)

  let target = result

  for (let index = 0; index < parts.length - 1; index++) {
    const part = parts[index]

    target[part] ??= {}
    target = target[part]
  }

  target[parts.at(-1)] = value

  collectReferences(value)
}

// Primeiro coletamos os refs das quatro operações.
collectReferences(result.paths)

// Depois seguimos transitivamente os refs encontrados.
// O Set pode crescer durante a iteração.
const processedReferences = new Set()

while (true) {
  const pendingReferences = [...references].filter(
    ref => !processedReferences.has(ref)
  )

  if (pendingReferences.length === 0) {
    break
  }

  for (const ref of pendingReferences) {
    copyReference(ref)
    processedReferences.add(ref)
  }
}

// Mantém securitySchemes referenciados pelas operações.
if (source.components?.securitySchemes) {
  result.components ??= {}
  result.components.securitySchemes = source.components.securitySchemes
}

await mkdir(dirname(OUTPUT_FILE), { recursive: true })

await writeFile(OUTPUT_FILE, `${JSON.stringify(result, null, 2)}\n`, 'utf8')

console.log('PREF-381 OpenAPI extraído com sucesso.')
console.log(`Operações: ${OPERATIONS.length}`)
console.log(`Referências copiadas: ${processedReferences.size}`)
console.log(`Arquivo: ${OUTPUT_FILE}`)
