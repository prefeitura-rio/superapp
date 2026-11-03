import {
  getApiPublicEmpregabilidadeVagasId,
  getApiPublicEmpregabilidadeVagasSlugSlug,
} from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveVagaParam } from '../resolve-vaga-param'

vi.mock(
  '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public',
  () => ({
    getApiPublicEmpregabilidadeVagasId: vi.fn(),
    getApiPublicEmpregabilidadeVagasSlugSlug: vi.fn(),
  })
)

const mockGetById = vi.mocked(getApiPublicEmpregabilidadeVagasId)
const mockGetBySlug = vi.mocked(getApiPublicEmpregabilidadeVagasSlugSlug)

const UUID = '45a1378e-9452-44ac-abbe-337e42eae217'
const SLUG = 'agente-de-campo-45a1378e9452'

function vaga(
  overrides: Partial<EmpregabilidadeVaga> = {}
): EmpregabilidadeVaga {
  return {
    id: UUID,
    slug: SLUG,
    titulo: 'Agente de Campo',
    status: 'publicado_ativo',
    ...overrides,
  }
}

function ok(data: EmpregabilidadeVaga) {
  return { status: 200 as const, data, headers: new Headers() }
}

function notFoundResponse() {
  return {
    status: 404 as const,
    data: { error: 'Vaga não encontrada' },
    headers: new Headers(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('resolveVagaParam — URL antiga (UUID)', () => {
  it('redireciona para a URL com slug quando a vaga tem slug', async () => {
    mockGetById.mockResolvedValue(ok(vaga()))

    await expect(resolveVagaParam(UUID)).resolves.toEqual({
      kind: 'redirect',
      path: `/servicos/trabalho/${SLUG}`,
    })
    expect(mockGetById).toHaveBeenCalledWith(UUID)
    expect(mockGetBySlug).not.toHaveBeenCalled()
  })

  it('redireciona também vaga encerrada (a rota por slug aceita publicadas)', async () => {
    mockGetById.mockResolvedValue(ok(vaga({ status: 'publicado_expirado' })))

    await expect(resolveVagaParam(UUID)).resolves.toEqual({
      kind: 'redirect',
      path: `/servicos/trabalho/${SLUG}`,
    })
  })

  it('renderiza pelo id quando a vaga ainda não tem slug', async () => {
    const semSlug = vaga({ slug: undefined })
    mockGetById.mockResolvedValue(ok(semSlug))

    await expect(resolveVagaParam(UUID)).resolves.toEqual({
      kind: 'found',
      vaga: semSlug,
    })
  })

  it('não encontrada quando a API responde 404', async () => {
    mockGetById.mockResolvedValue(notFoundResponse())

    await expect(resolveVagaParam(UUID)).resolves.toEqual({
      kind: 'not_found',
    })
  })
})

describe('resolveVagaParam — slug', () => {
  it('renderiza a vaga quando o slug é o atual', async () => {
    const atual = vaga()
    mockGetBySlug.mockResolvedValue(ok(atual))

    await expect(resolveVagaParam(SLUG)).resolves.toEqual({
      kind: 'found',
      vaga: atual,
    })
    expect(mockGetBySlug).toHaveBeenCalledWith(SLUG)
    expect(mockGetById).not.toHaveBeenCalled()
  })

  it('redireciona slug histórico para o slug atual devolvido pela API', async () => {
    const novoSlug = 'agente-de-campo-senior-45a1378e9452'
    mockGetBySlug.mockResolvedValue(ok(vaga({ slug: novoSlug })))

    await expect(resolveVagaParam(SLUG)).resolves.toEqual({
      kind: 'redirect',
      path: `/servicos/trabalho/${novoSlug}`,
    })
  })

  it('não encontrada quando a API responde 404', async () => {
    mockGetBySlug.mockResolvedValue(notFoundResponse())

    await expect(resolveVagaParam('nao-existe-000000000000')).resolves.toEqual({
      kind: 'not_found',
    })
  })
})

describe('resolveVagaParam — entrada inválida', () => {
  it.each(['..', 'Agente-De-Campo', 'agente de campo', 'agente/../campo', ''])(
    'não chama a API para %j',
    async param => {
      await expect(resolveVagaParam(param)).resolves.toEqual({
        kind: 'not_found',
      })
      expect(mockGetById).not.toHaveBeenCalled()
      expect(mockGetBySlug).not.toHaveBeenCalled()
    }
  )
})
