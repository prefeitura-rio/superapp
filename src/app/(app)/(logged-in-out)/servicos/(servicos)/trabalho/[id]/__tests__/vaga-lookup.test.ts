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

// A resposta real é uma union discriminada por status; para o teste basta a
// forma { status, data } — o cast evita reconstruir o tipo gerado inteiro.
function resp(status: number, data: unknown) {
  return { status, data, headers: new Headers() } as never
}

describe('getPublicVaga', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('UUID → busca por id e retorna a vaga (sem tocar no endpoint de slug)', async () => {
    byId.mockResolvedValue(resp(200, vaga({ slug: 'analista-x-3b03ae90' })))

    const result = await getPublicVaga(UUID)

    expect(byId).toHaveBeenCalledWith(UUID)
    expect(bySlug).not.toHaveBeenCalled()
    expect(result).toEqual({ vaga: expect.objectContaining({ id: UUID }) })
  })

  test('slug atual → retorna a vaga (sem redirect)', async () => {
    bySlug.mockResolvedValue(resp(200, vaga({ slug: 'analista-atual' })))

    const result = await getPublicVaga('analista-atual')

    expect(bySlug).toHaveBeenCalledWith('analista-atual')
    expect(result).toEqual({
      vaga: expect.objectContaining({ slug: 'analista-atual' }),
    })
  })

  test('slug histórico → redirectSlug para o slug canônico (SEO)', async () => {
    // O fetch segue o 301 do app-go-api e retorna a vaga canônica; como o slug
    // canônico difere do pedido, emitimos o redirect.
    bySlug.mockResolvedValue(resp(200, vaga({ slug: 'analista-novo' })))

    const result = await getPublicVaga('analista-antigo')

    expect(result).toEqual({ redirectSlug: 'analista-novo' })
  })

  test('slug não encontrado → null', async () => {
    bySlug.mockResolvedValue(resp(404, { error: 'Vaga não encontrada' }))

    const result = await getPublicVaga('inexistente')

    expect(result).toBeNull()
  })

  test('UUID não encontrado → null', async () => {
    byId.mockResolvedValue(resp(404, { error: 'Vaga não encontrada' }))

    const result = await getPublicVaga(UUID)

    expect(result).toBeNull()
  })
})
