import { getApiV1EmpregabilidadeComportamentosAtitudes } from '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes'
import {
  getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
  putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias,
} from '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens'
import { getApiV1EmpregabilidadeHabilidadesAreasAtuacao } from '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades'
import { getUserInfoFromToken } from '@/lib/user-info'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '../route'

vi.mock('@/lib/user-info', () => ({
  getUserInfoFromToken: vi.fn(),
}))

vi.mock(
  '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades',
  () => ({
    getApiV1EmpregabilidadeHabilidadesAreasAtuacao: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes',
  () => ({
    getApiV1EmpregabilidadeComportamentosAtitudes: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-curriculo-itens/empregabilidade-curriculo-itens',
  () => ({
    getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias: vi.fn(),
    putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias: vi.fn(),
  })
)

const mockGetUserInfoFromToken = vi.mocked(getUserInfoFromToken)
const mockGetAreas = vi.mocked(getApiV1EmpregabilidadeHabilidadesAreasAtuacao)
const mockGetComportamentos = vi.mocked(
  getApiV1EmpregabilidadeComportamentosAtitudes
)
const mockGetCurriculo = vi.mocked(
  getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias
)
const mockPutCurriculo = vi.mocked(
  putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias
)

const pagina = (data: unknown[], total = data.length) =>
  ({ status: 200, data: { data, total, page: 1, pageSize: 100 } }) as never

function logado() {
  mockGetUserInfoFromToken.mockResolvedValue({
    cpf: '123.456.789-01',
  } as never)
}

function putRequest(body: unknown) {
  return new Request('http://localhost', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

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
      expect(mockGetAreas).not.toHaveBeenCalled()
      expect(mockGetComportamentos).not.toHaveBeenCalled()
      expect(mockGetCurriculo).not.toHaveBeenCalled()
    })

    it('compõe áreas, área e conhecimentos do currículo e comportamentos marcados', async () => {
      logado()
      mockGetAreas.mockResolvedValue(
        pagina([
          { id: 10, nome: 'Área A' },
          { id: 20, nome: 'Área B' },
        ])
      )
      mockGetComportamentos.mockResolvedValue(
        pagina([
          { id: 5, nome: 'Colaboração' },
          { id: 6, nome: 'Organização' },
        ])
      )
      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {
          area_atuacao: { id: 20, nome: 'Área B' },
          conhecimentos: [{ id: 1, nome: 'Conhecimento A' }],
          comportamentos_atitudes: [{ id: 5, nome: 'Colaboração' }],
        },
      } as never)

      const response = await GET()

      expect(response.status).toBe(200)
      expect(response.headers.get('Cache-Control')).toContain('no-store')
      expect(mockGetAreas).toHaveBeenCalledWith({ page: 1, pageSize: 100 })
      expect(mockGetComportamentos).toHaveBeenCalledWith({
        page: 1,
        pageSize: 100,
      })
      await expect(response.json()).resolves.toEqual({
        areasAtuacao: [
          { id: 10, nome: 'Área A' },
          { id: 20, nome: 'Área B' },
        ],
        areaAtuacaoSelecionada: { id: 20, nome: 'Área B' },
        conhecimentosSelecionados: [{ id: 1, nome: 'Conhecimento A' }],
        comportamentoAtitudes: [
          { id: 5, nome: 'Colaboração', clicked: true },
          { id: 6, nome: 'Organização', clicked: false },
        ],
      })
    })

    it('lê todas as páginas do catálogo de áreas', async () => {
      logado()
      const primeira = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        nome: `Área ${i + 1}`,
      }))
      mockGetAreas
        .mockResolvedValueOnce(pagina(primeira, 101))
        .mockResolvedValueOnce(pagina([{ id: 101, nome: 'Área 101' }], 101))
      mockGetComportamentos.mockResolvedValue(pagina([]))
      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {
          area_atuacao: null,
          conhecimentos: [],
          comportamentos_atitudes: [],
        },
      } as never)

      const response = await GET()
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(mockGetAreas).toHaveBeenNthCalledWith(2, {
        page: 2,
        pageSize: 100,
      })
      expect(body.areasAtuacao).toHaveLength(101)
      expect(body.areasAtuacao.at(-1)).toEqual({ id: 101, nome: 'Área 101' })
      expect(body.areaAtuacaoSelecionada).toBeNull()
    })

    it('descarta itens sem ID válido e mantém comportamento do currículo ausente no catálogo', async () => {
      logado()
      mockGetAreas.mockResolvedValue(
        pagina([{ id: 0, nome: 'Sem id' }, { nome: 'Sem id' }, null])
      )
      mockGetComportamentos.mockResolvedValue(pagina([{ id: 6, nome: 'B' }]))
      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {
          area_atuacao: { id: 0, nome: 'inválida' },
          comportamentos_atitudes: [{ id: 9, nome: 'Fora do catálogo' }],
        },
      } as never)

      const response = await GET()

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({
        areasAtuacao: [],
        areaAtuacaoSelecionada: null,
        conhecimentosSelecionados: [],
        comportamentoAtitudes: [
          { id: 6, nome: 'B', clicked: false },
          { id: 9, nome: 'Fora do catálogo', clicked: true },
        ],
      })
    })

    it('retorna 502 quando não consegue ler a seleção do currículo, para não apresentar um currículo vazio', async () => {
      logado()
      mockGetAreas.mockResolvedValue(pagina([{ id: 10, nome: 'Área A' }]))
      mockGetComportamentos.mockResolvedValue(pagina([]))
      mockGetCurriculo.mockResolvedValue({
        status: 500,
        data: { error: 'falha' },
      } as never)

      const response = await GET()

      expect(response.status).toBe(502)
      await expect(response.json()).resolves.toEqual({
        error: 'Erro ao carregar habilidades e competências',
      })
    })

    it('repassa 401 quando a Go API recusa o token', async () => {
      logado()
      mockGetAreas.mockResolvedValue(pagina([]))
      mockGetComportamentos.mockResolvedValue(pagina([]))
      mockGetCurriculo.mockResolvedValue({
        status: 401,
        data: { error: 'Usuário não autenticado' },
      } as never)

      const response = await GET()

      expect(response.status).toBe(401)
    })

    it('retorna 502 quando um catálogo responde fora de 200', async () => {
      logado()
      mockGetAreas.mockResolvedValue({ status: 500, data: {} } as never)
      mockGetComportamentos.mockResolvedValue(pagina([]))
      mockGetCurriculo.mockResolvedValue({
        status: 200,
        data: {},
      } as never)

      const response = await GET()

      expect(response.status).toBe(502)
    })

    it('retorna 500 quando ocorre exceção ao carregar os dados', async () => {
      logado()
      mockGetAreas.mockRejectedValue(new Error('backend indisponível'))
      mockGetComportamentos.mockResolvedValue(pagina([]))
      mockGetCurriculo.mockResolvedValue({ status: 200, data: {} } as never)

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

      const response = await PUT(
        putRequest({
          id_area_atuacao: 10,
          habilidade_ids: [1],
          comportamento_atitudes_ids: [5],
        })
      )

      expect(response.status).toBe(401)
      expect(mockPutCurriculo).not.toHaveBeenCalled()
    })

    it('envia área, conhecimentos e comportamentos sem IDs repetidos', async () => {
      logado()
      const salvo = {
        area_atuacao: { id: 10, nome: 'Área A' },
        conhecimentos: [{ id: 1, nome: 'Conhecimento A' }],
        comportamentos_atitudes: [{ id: 5, nome: 'Colaboração' }],
      }
      mockPutCurriculo.mockResolvedValue({ status: 200, data: salvo } as never)

      const response = await PUT(
        putRequest({
          id_area_atuacao: 10,
          habilidade_ids: [1, 1],
          comportamento_atitudes_ids: [5, 5, 6],
        })
      )

      expect(response.status).toBe(200)
      expect(mockPutCurriculo).toHaveBeenCalledWith({
        id_area_atuacao: 10,
        habilidade_ids: [1],
        comportamento_atitudes_ids: [5, 6],
      })
      await expect(response.json()).resolves.toEqual(salvo)
    })

    it('aceita limpar a área quando nenhum conhecimento é enviado', async () => {
      logado()
      mockPutCurriculo.mockResolvedValue({ status: 200, data: {} } as never)

      const response = await PUT(
        putRequest({
          id_area_atuacao: null,
          habilidade_ids: [],
          comportamento_atitudes_ids: [],
        })
      )

      expect(response.status).toBe(200)
      expect(mockPutCurriculo).toHaveBeenCalledWith({
        id_area_atuacao: null,
        habilidade_ids: [],
        comportamento_atitudes_ids: [],
      })
    })

    it.each([
      ['corpo que não é JSON', '{'],
      [
        'formato antigo (IDs de tuplas)',
        { area_atuacao_habilidade_ids: [187], comportamento_atitudes_ids: [5] },
      ],
      [
        'conhecimentos sem área',
        {
          id_area_atuacao: null,
          habilidade_ids: [1],
          comportamento_atitudes_ids: [],
        },
      ],
      [
        'IDs que não são inteiros positivos',
        {
          id_area_atuacao: 10,
          habilidade_ids: [-1, 'x'],
          comportamento_atitudes_ids: [1.5],
        },
      ],
    ])('retorna 400 sem chamar a Go API para %s', async (_caso, body) => {
      logado()

      const response = await PUT(putRequest(body))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'Dados inválidos',
      })
      expect(mockPutCurriculo).not.toHaveBeenCalled()
    })

    it('preserva status e corpo retornados pela Go API quando a gravação falha', async () => {
      logado()
      mockPutCurriculo.mockResolvedValue({
        status: 400,
        data: { error: 'Conhecimento fora da área' },
      } as never)

      const response = await PUT(
        putRequest({
          id_area_atuacao: 10,
          habilidade_ids: [999],
          comportamento_atitudes_ids: [],
        })
      )

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toEqual({
        error: 'Conhecimento fora da área',
      })
    })

    it('retorna 500 quando ocorre exceção durante a atualização', async () => {
      logado()
      mockPutCurriculo.mockRejectedValue(new Error('backend indisponível'))

      const response = await PUT(
        putRequest({
          id_area_atuacao: 10,
          habilidade_ids: [1],
          comportamento_atitudes_ids: [5],
        })
      )

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        error: 'Erro ao atualizar habilidades e competências',
      })
    })
  })
})
