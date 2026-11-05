import { getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import { getUserInfoFromToken } from '@/lib/user-info'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../route'

vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn(),
}))

vi.mock(
  '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades',
  () => ({
    getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades: vi.fn(),
  })
)

const mockGetUserInfoFromToken = vi.mocked(getUserInfoFromToken)
const mockGetHabilidadesDaArea = vi.mocked(
  getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades
)

const chamar = (id: string) =>
  GET(new Request('http://localhost'), { params: Promise.resolve({ id }) })

describe('conhecimentos da área de atuação route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserInfoFromToken.mockResolvedValue({
      cpf: '12345678901',
    } as never)
  })

  it('retorna 401 sem CPF no token e não consulta a Go API', async () => {
    mockGetUserInfoFromToken.mockResolvedValue({} as never)

    const response = await chamar('10')

    expect(response.status).toBe(401)
    expect(mockGetHabilidadesDaArea).not.toHaveBeenCalled()
  })

  it.each(['0', '-1', 'abc', '1.5', '10;DROP', '9999999999999999'])(
    'retorna 400 para o id de área %s sem consultar a Go API',
    async id => {
      const response = await chamar(id)

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'Área de atuação inválida',
      })
      expect(mockGetHabilidadesDaArea).not.toHaveBeenCalled()
    }
  )

  it('devolve os conhecimentos da área lendo todas as páginas', async () => {
    const primeira = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      nome: `Conhecimento ${i + 1}`,
    }))
    mockGetHabilidadesDaArea
      .mockResolvedValueOnce({
        status: 200,
        data: { data: primeira, total: 102, page: 1, pageSize: 100 },
      } as never)
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            { id: 101, nome: 'Conhecimento 101' },
            { id: 102, nome: 'Conhecimento 102' },
          ],
          total: 102,
          page: 2,
          pageSize: 100,
        },
      } as never)

    const response = await chamar('10')
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockGetHabilidadesDaArea).toHaveBeenNthCalledWith(1, 10, {
      page: 1,
      pageSize: 100,
    })
    expect(mockGetHabilidadesDaArea).toHaveBeenNthCalledWith(2, 10, {
      page: 2,
      pageSize: 100,
    })
    expect(body.conhecimentos).toHaveLength(102)
    expect(body.conhecimentos.at(-1)).toEqual({
      id: 102,
      nome: 'Conhecimento 102',
    })
  })

  it('para na primeira página quando ela vem incompleta', async () => {
    mockGetHabilidadesDaArea.mockResolvedValue({
      status: 200,
      data: { data: [{ id: 1, nome: 'Conhecimento A' }] },
    } as never)

    const response = await chamar('10')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      conhecimentos: [{ id: 1, nome: 'Conhecimento A' }],
    })
    expect(mockGetHabilidadesDaArea).toHaveBeenCalledTimes(1)
  })

  it('retorna 404 quando a área não existe na Go API', async () => {
    mockGetHabilidadesDaArea.mockResolvedValue({
      status: 404,
      data: { error: 'Área de atuação não encontrada' },
    } as never)

    const response = await chamar('999')

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Área de atuação não encontrada',
    })
  })

  it('retorna 502 quando a Go API responde com erro', async () => {
    mockGetHabilidadesDaArea.mockResolvedValue({
      status: 500,
      data: { error: 'falha' },
    } as never)

    const response = await chamar('10')

    expect(response.status).toBe(502)
  })

  it('retorna 500 quando a chamada lança exceção', async () => {
    mockGetHabilidadesDaArea.mockRejectedValue(new Error('rede'))

    const response = await chamar('10')

    expect(response.status).toBe(500)
  })
})
