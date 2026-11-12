import { getUserInfoFromToken } from '@/lib/user-info'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { customFetch } from '../../../../../../../../custom-fetch-course'
import { PUT } from '../route'

vi.mock('@/lib/user-info', () => ({ getUserInfoFromToken: vi.fn() }))
vi.mock('../../../../../../../../custom-fetch-course', () => ({
  customFetch: vi.fn(),
}))

const mockUser = vi.mocked(getUserInfoFromToken)
const mockFetch = vi.mocked(customFetch)

describe('PUT /api/user/empregos/candidaturas/visualizar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marca as atualizações do CPF do token como vistas', async () => {
    mockUser.mockResolvedValue({ cpf: '529.982.247-25' } as never)
    mockFetch.mockResolvedValue({ status: 204, data: '' } as never)

    const res = await PUT()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/empregabilidade/candidaturas/usuario/52998224725/visualizar',
      { method: 'PUT' }
    )
    expect(res.status).toBe(204)
  })

  it('sem login responde 401 e não chama a API', async () => {
    mockUser.mockResolvedValue({ cpf: '' } as never)

    const res = await PUT()

    expect(res.status).toBe(401)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('falha da API vira 502', async () => {
    mockUser.mockResolvedValue({ cpf: '52998224725' } as never)
    mockFetch.mockResolvedValue({ status: 500, data: {} } as never)

    const res = await PUT()

    expect(res.status).toBe(502)
  })

  it('erro de rede vira 502', async () => {
    mockUser.mockResolvedValue({ cpf: '52998224725' } as never)
    mockFetch.mockRejectedValue(new Error('rede'))

    const res = await PUT()

    expect(res.status).toBe(502)
  })
})
