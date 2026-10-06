import { getApiV1EmpregabilidadeComportamentosAtitudes } from '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes'
import { putApiV1EmpregabilidadeCurriculo } from '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens'
import { getApiV1EmpregabilidadeCurriculoCpf } from '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo'
import { getApiV1EmpregabilidadeHabilidadesAreasAtuacaoHabilidades } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import { getUserInfoFromToken } from '@/lib/user-info'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '../route'

vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn(),
}))

vi.mock(
  '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades',
  () => ({
    getApiV1EmpregabilidadeHabilidadesAreasAtuacaoHabilidades: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes',
  () => ({
    getApiV1EmpregabilidadeComportamentosAtitudes: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo',
  () => ({
    getApiV1EmpregabilidadeCurriculoCpf: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens',
  () => ({
    putApiV1EmpregabilidadeCurriculo: vi.fn(),
  })
)

const mockGetUserInfoFromToken = vi.mocked(getUserInfoFromToken)

const mockGetAreasAtuacaoHabilidades = vi.mocked(
  getApiV1EmpregabilidadeHabilidadesAreasAtuacaoHabilidades
)

const mockGetComportamentosAtitudes = vi.mocked(
  getApiV1EmpregabilidadeComportamentosAtitudes
)

const mockGetCurriculo = vi.mocked(getApiV1EmpregabilidadeCurriculoCpf)

const mockPutCurriculo = vi.mocked(putApiV1EmpregabilidadeCurriculo)

describe('habilidades e competências route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('retorna 401 quando o usuário autenticado não possui CPF', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({} as never)

      const response = await GET()

      expect(response.status).toBe(401)

      await expect(response.json()).resolves.toEqual({
        error: 'Não autorizado',
      })

      expect(mockGetAreasAtuacaoHabilidades).not.toHaveBeenCalled()
      expect(mockGetComportamentosAtitudes).not.toHaveBeenCalled()
      expect(mockGetCurriculo).not.toHaveBeenCalled()
    })

    it('compõe áreas, conhecimentos e comportamentos com as seleções do currículo', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '123.456.789-01',
      } as never)

      mockGetAreasAtuacaoHabilidades.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 187,
            id_area_atuacao: 10,
            area_atuacao: {
              id: 10,
              nome: 'Área A',
            },
            habilidade: {
              id: 1,
              nome: 'Conhecimento A',
            },
          },
          {
            id: 188,
            id_area_atuacao: 10,
            area_atuacao: {
              id: 10,
              nome: 'Área A',
            },
            habilidade: {
              id: 2,
              nome: 'Conhecimento B',
            },
          },
          {
            id: 342,
            id_area_atuacao: 20,
            area_atuacao: {
              id: 20,
              nome: 'Área B',
            },
            habilidade: {
              id: 1,
              nome: 'Conhecimento A',
            },
          },
        ],
      } as never)

      mockGetComportamentosAtitudes.mockResolvedValue({
        status: 200,
        data: {
          data: [
            {
              id: 5,
              nome: 'Colaboração',
            },
            {
              id: 6,
              nome: 'Organização',
            },
          ],
        },
      } as never)

      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {
          area_atuacao_habilidade: [
            {
              id: 900,
              id_area_atuacao_habilidade: 342,
            },
          ],
          comportamento_atitudes: [
            {
              id: 901,
              id_comportamento_atitudes: 5,
            },
          ],
        },
      } as never)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)

      expect(mockGetCurriculo).toHaveBeenCalledWith('12345678901')

      expect(mockGetComportamentosAtitudes).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
      })

      expect(body).toEqual({
        areasAtuacao: [
          {
            nome: 'Área A',
            checked: false,
            vinculos: [
              {
                idTupla: 187,
                nome: 'Conhecimento A',
                checked: false,
              },
              {
                idTupla: 188,
                nome: 'Conhecimento B',
                checked: false,
              },
            ],
          },
          {
            nome: 'Área B',
            checked: true,
            vinculos: [
              {
                idTupla: 342,
                nome: 'Conhecimento A',
                checked: true,
              },
            ],
          },
        ],
        comportamentoAtitudes: [
          {
            id: 5,
            nome: 'Colaboração',
            clicked: true,
          },
          {
            id: 6,
            nome: 'Organização',
            clicked: false,
          },
        ],
      })
    })

    it('ignora vínculos do catálogo sem IDs válidos', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '12345678901',
      } as never)

      mockGetAreasAtuacaoHabilidades.mockResolvedValue({
        status: 200,
        data: [
          {
            id: 0,
            id_area_atuacao: 10,
            area: {
              id: 10,
              nome: 'Sem tupla',
            },
            habilidade: {
              nome: 'Conhecimento',
            },
          },
          {
            id: 100,
            id_area_atuacao: 0,
            area_atuacao: {
              id: 0,
              nome: 'Sem área',
            },
            habilidade: {
              nome: 'Conhecimento',
            },
          },
        ],
      } as never)

      mockGetComportamentosAtitudes.mockResolvedValue({
        status: 200,
        data: {
          data: [],
        },
      } as never)

      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {},
      } as never)

      const response = await GET()

      expect(response.status).toBe(200)

      await expect(response.json()).resolves.toEqual({
        areasAtuacao: [],
        comportamentoAtitudes: [],
      })
    })

    it('retorna 500 quando ocorre erro ao carregar os dados', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '12345678901',
      } as never)

      mockGetAreasAtuacaoHabilidades.mockRejectedValue(
        new Error('backend indisponível')
      )

      const response = await GET()

      expect(response.status).toBe(500)

      await expect(response.json()).resolves.toEqual({
        error: 'Erro ao carregar habilidades e competências',
      })
    })
  })

  describe('PUT', () => {
    it('retorna 401 quando o usuário autenticado não possui CPF', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({} as never)

      const request = new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          area_atuacao_habilidade_ids: [187],
          comportamento_atitudes_ids: [5],
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(401)
      expect(mockPutCurriculo).not.toHaveBeenCalled()
    })

    it('repassa exatamente o payload para atualização do currículo', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '12345678901',
      } as never)

      mockPutCurriculo.mockResolvedValue({
        status: 200,
        data: {
          message: 'Currículo atualizado',
        },
      } as never)

      const payload = {
        area_atuacao_habilidade_ids: [187, 342],
        comportamento_atitudes_ids: [5, 6],
      }

      const request = new Request('http://localhost', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const response = await PUT(request)

      expect(response.status).toBe(200)
      expect(mockPutCurriculo).toHaveBeenCalledTimes(1)
      expect(mockPutCurriculo).toHaveBeenCalledWith(payload)

      await expect(response.json()).resolves.toEqual({
        message: 'Currículo atualizado',
      })
    })

    it('preserva status e corpo retornados pelo backend quando a atualização falha', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '12345678901',
      } as never)

      mockPutCurriculo.mockResolvedValue({
        status: 422,
        data: {
          error: 'Dados inválidos',
        },
      } as never)

      const request = new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          area_atuacao_habilidade_ids: [999],
          comportamento_atitudes_ids: [],
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(422)

      await expect(response.json()).resolves.toEqual({
        error: 'Dados inválidos',
      })
    })

    it('retorna 500 quando ocorre exceção durante a atualização', async () => {
      mockGetUserInfoFromToken.mockResolvedValue({
        cpf: '12345678901',
      } as never)

      mockPutCurriculo.mockRejectedValue(new Error('backend indisponível'))

      const request = new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          area_atuacao_habilidade_ids: [187],
          rtamento_atitudes_ids: [5],
        }),
      })

      const response = await PUT(request)

      expect(response.status).toBe(500)

      await expect(response.json()).resolves.toEqual({
        error: 'Erro ao atualizar habilidades e competências',
      })
    })
  })
})
