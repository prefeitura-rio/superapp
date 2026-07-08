import {
  getApiPublicEmpregabilidadeVagasId,
  getApiPublicEmpregabilidadeVagasSlugSlug,
} from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { getPublicVaga } from '../vaga-lookup'

vi.mock(
  '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public',
  () => ({
    getApiPublicEmpregabilidadeVagasId: vi.fn(),
    getApiPublicEmpregabilidadeVagasSlugSlug: vi.fn(),
  })
)

const byId = vi.mocked(getApiPublicEmpregabilidadeVagasId)
const bySlug = vi.mocked(getApiPublicEmpregabilidadeVagasSlugSlug)

const UUID = '3b03ae90-0000-4000-8000-000000000000'

function vaga(
  overrides: Partial<EmpregabilidadeVaga> = {}
): EmpregabilidadeVaga {
  return { id: UUID, status: 'publicado_ativo', ...overrides }
}

type ByIdResponse = Awaited<
  ReturnType<typeof getApiPublicEmpregabilidadeVagasId>
>
type BySlugResponse = Awaited<
  ReturnType<typeof getApiPublicEmpregabilidadeVagasSlugSlug>
>

// A resposta real é uma union discriminada por status; para o teste basta a
// forma { status, data }. O cast via `unknown` fecha no tipo de resposta real
// de cada endpoint (em vez de `never`), então um `data` incompatível com o
// endpoint mockado ainda seria pego em uso — só a forma parcial é permitida.
function respById(status: number, data: unknown): ByIdResponse {
  return { status, data, headers: new Headers() } as unknown as ByIdResponse
}

function respBySlug(status: number, data: unknown): BySlugResponse {
  return { status, data, headers: new Headers() } as unknown as BySlugResponse
}

describe('getPublicVaga', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('UUID com slug disponível → redirectSlug para a URL SEO (sem tocar no endpoint de slug)', async () => {
    byId.mockResolvedValue(respById(200, vaga({ slug: 'analista-x-3b03ae90' })))

    const result = await getPublicVaga(UUID)

    expect(byId).toHaveBeenCalledWith(UUID)
    expect(bySlug).not.toHaveBeenCalled()
    expect(result).toEqual({ redirectSlug: 'analista-x-3b03ae90' })
  })

  test('UUID sem slug disponível → retorna a vaga (sem redirect)', async () => {
    byId.mockResolvedValue(respById(200, vaga()))

    const result = await getPublicVaga(UUID)

    expect(result).toEqual({ vaga: expect.objectContaining({ id: UUID }) })
  })

  test('slug atual → retorna a vaga (sem redirect)', async () => {
    bySlug.mockResolvedValue(respBySlug(200, vaga({ slug: 'analista-atual' })))

    const result = await getPublicVaga('analista-atual')

    expect(bySlug).toHaveBeenCalledWith('analista-atual')
    expect(result).toEqual({
      vaga: expect.objectContaining({ slug: 'analista-atual' }),
    })
  })

  test('slug histórico → redirectSlug para o slug canônico (SEO)', async () => {
    // O fetch segue o 301 do app-go-api e retorna a vaga canônica; como o slug
    // canônico difere do pedido, emitimos o redirect.
    bySlug.mockResolvedValue(respBySlug(200, vaga({ slug: 'analista-novo' })))

    const result = await getPublicVaga('analista-antigo')

    expect(result).toEqual({ redirectSlug: 'analista-novo' })
  })

  test('slug não encontrado → null', async () => {
    bySlug.mockResolvedValue(respBySlug(404, { error: 'Vaga não encontrada' }))

    const result = await getPublicVaga('inexistente')

    expect(result).toBeNull()
  })

  test('UUID não encontrado → null', async () => {
    byId.mockResolvedValue(respById(404, { error: 'Vaga não encontrada' }))

    const result = await getPublicVaga(UUID)

    expect(result).toBeNull()
  })
})
