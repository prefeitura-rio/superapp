import { spawnSync } from 'node:child_process'
import { constants } from 'node:fs'
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const STAGING = '.tmp/orval-pref-381'
const DESTINATION = 'src/http-courses'
const MODELS_INDEX = `${DESTINATION}/models/index.ts`

const CLIENTS = [
  'empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes.ts',
  'empregabilidade-curriculo-itens/empregabilidade-curriculo-itens.ts',
  'empregabilidade-habilidades/empregabilidade-habilidades.ts',
]

const MODELS = [
  'empregabilidadeAreaAtuacao.ts',
  'empregabilidadeAreaAtuacaoHabilidade.ts',
  'empregabilidadeComportamentoAtitudes.ts',
  'empregabilidadeCurriculoItensReplaceAll.ts',
  'empregabilidadeHabilidade.ts',
  'getApiV1EmpregabilidadeComportamentosAtitudesParams.ts',
  'putApiV1EmpregabilidadeCurriculo200.ts',
  'putApiV1EmpregabilidadeCurriculo400.ts',
  'putApiV1EmpregabilidadeCurriculo403.ts',
  'putApiV1EmpregabilidadeCurriculo500.ts',
  'responseErrorResponse.ts',
  'responseListComportamentoAtitudesPaginatedResponse.ts',
]

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`)

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error(`Comando falhou: ${command} ${args.join(' ')}`)
  }
}

async function exists(path) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function validateStaging() {
  for (const client of CLIENTS) {
    const path = join(STAGING, client)

    if (!(await exists(path))) {
      throw new Error(`Client esperado não foi gerado: ${path}`)
    }
  }

  for (const model of MODELS) {
    const path = join(STAGING, 'models', model)

    if (!(await exists(path))) {
      throw new Error(`Model esperado não foi gerado: ${path}`)
    }
  }
}

async function promoteClients() {
  for (const client of CLIENTS) {
    const source = join(STAGING, client)
    const destination = join(DESTINATION, client)

    await mkdir(dirname(destination), { recursive: true })
    await copyFile(source, destination)

    console.log(`✓ client: ${destination}`)
  }
}

async function promoteModels() {
  for (const model of MODELS) {
    const source = join(STAGING, 'models', model)
    const destination = join(DESTINATION, 'models', model)

    await copyFile(source, destination)

    console.log(`✓ model: ${destination}`)
  }
}

async function updateModelsIndex() {
  let index = await readFile(MODELS_INDEX, 'utf8')

  for (const model of MODELS) {
    const name = model.replace(/\.ts$/, '')
    const exportLine = `export * from './${name}'`

    const lines = index.split(/\r?\n/)

    if (!lines.includes(exportLine)) {
      if (!index.endsWith('\n')) {
        index += '\n'
      }

      index += `${exportLine}\n`
      console.log(`✓ export: ${exportLine}`)
    }
  }

  await writeFile(MODELS_INDEX, index)
}

console.log('🔧 Extracting PREF-381 OpenAPI...')
run('node', ['scripts/extract-pref-381-openapi.mjs'])

console.log('\n⚙️ Generating isolated Orval client...')
run('npx', ['orval', '--project', 'appGoApi'])

console.log('\n🔍 Validating generated staging files...')
await validateStaging()

console.log('\n📦 Promoting authorized clients...')
await promoteClients()

console.log('\n📦 Promoting authorized models...')
await promoteModels()

console.log('\n📚 Updating models barrel...')
await updateModelsIndex()

console.log('\n🧹 Formatting controlled files...')
run('npx', [
  'biome',
  'check',
  '--write',
  ...CLIENTS.map(file => join(DESTINATION, file)),
  ...MODELS.map(file => join(DESTINATION, 'models', file)),
  MODELS_INDEX,
])

console.log('\n🔎 Running TypeScript validation...')
run('npm', ['run', 'typecheck'])

console.log('\n✅ app-go-api client generated successfully.')
