import { getApiV1EmpregabilidadeCandidaturasUsuarioCpf } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/user-info', () => ({ getUserInfoFromToken: vi.fn() }))
vi.mock(
  '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas',
  () => ({ getApiV1EmpregabilidadeCandidaturasUsuarioCpf: vi.fn() })
)

const mockUser = vi.mocked(getUserInfoFromToken)
const mockList = vi.mocked(getApiV1EmpregabilidadeCandidaturasUsuarioCpf)

const request = () =>
  new NextRequest('http://localhost/api/user/empregos/candidaturas')

describe('candidaturas route — lista completa', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.mockResolvedValue({ cpf: '529.982.247-25' } as never)
  })

  it('devolve o total de candidaturas da API, não só o da página', async () => {
    mockList.mockResolvedValue({
      status: 200,
      data: { data: [], meta: { page: 1, page_size: 50, total: 73 } },
    } as never)

    const body = await (await GET(request())).json()

    expect(mockList).toHaveBeenCalledWith('52998224725', {
      page: 1,
      pageSize: 50,
    })
    expect(body.total).toBe(73)
  })

  it('sem meta na resposta, o total é o tamanho da lista', async () => {
    mockList.mockResolvedValue({
      status: 200,
      data: { data: [] },
    } as never)

    const body = await (await GET(request())).json()

    expect(body.total).toBe(0)
    expect(body.hasCandidaturas).toBe(false)
  })
})
