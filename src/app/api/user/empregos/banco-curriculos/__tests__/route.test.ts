import {
  getApiV1EmpregabilidadeCurriculoCpfBancoCurriculos,
  putApiV1EmpregabilidadeCurriculoCpfBancoCurriculos,
} from '@/http-courses/empregabilidade-curriculo-banco/empregabilidade-curriculo-banco'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PUT } from '../route'

vi.mock('@/lib/user-info', () => ({ getUserInfoFromToken: vi.fn() }))
vi.mock('@/lib/dal', () => ({ getDalCitizenCpf: vi.fn() }))
vi.mock(
  '@/http-courses/empregabilidade-curriculo-banco/empregabilidade-curriculo-banco',
  () => ({
    getApiV1EmpregabilidadeCurriculoCpfBancoCurriculos: vi.fn(),
    putApiV1EmpregabilidadeCurriculoCpfBancoCurriculos: vi.fn(),
  })
)

const mockUser = vi.mocked(getUserInfoFromToken)
const mockCitizen = vi.mocked(getDalCitizenCpf)
const mockGet = vi.mocked(getApiV1EmpregabilidadeCurriculoCpfBancoCurriculos)
const mockPut = vi.mocked(putApiV1EmpregabilidadeCurriculoCpfBancoCurriculos)

const statusApi = {
  tem_curriculo: true,
  curriculo_completo: true,
  pendencias: [],
  curriculo_atualizado_em: '2026-10-13T21:18:03-03:00',
  disponivel: false,
}

function comEscolaridade(escolaridade: string) {
  mockCitizen.mockResolvedValue({
    status: 200,
    data: { escolaridade },
  } as never)
}

function putRequest(body: unknown) {
  return new NextRequest(
    'http://localhost/api/user/empregos/banco-curriculos',
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  )
}

describe('banco-curriculos route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.mockResolvedValue({ cpf: '529.982.247-25' } as never)
    comEscolaridade('Ensino médio completo')
  })

  describe('GET', () => {
    it('deslogado não consulta a API', async () => {
      mockUser.mockResolvedValue({} as never)

      const response = await GET()

      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toMatchObject({ logado: false })
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('repassa o estado da API com o CPF só com dígitos', async () => {
      mockGet.mockResolvedValue({ status: 200, data: statusApi } as never)

      const response = await GET()

      expect(mockGet).toHaveBeenCalledWith('52998224725')
      await expect(response.json()).resolves.toEqual({
        logado: true,
        temCurriculo: true,
        curriculoCompleto: true,
        pendencias: [],
        curriculoAtualizadoEm: '2026-10-13T21:18:03-03:00',
        disponivel: false,
      })
    })

    it('sem escolaridade no cadastro o currículo fica incompleto', async () => {
      comEscolaridade('  ')
      mockGet.mockResolvedValue({ status: 200, data: statusApi } as never)

      const body = await (await GET()).json()

      expect(body.curriculoCompleto).toBe(false)
      expect(body.pendencias).toEqual(['Escolaridade não informada'])
    })

    it('falha da API vira 502', async () => {
      mockGet.mockResolvedValue({ status: 500, data: {} } as never)

      expect((await GET()).status).toBe(502)
    })
  })

  describe('PUT', () => {
    it('exige o campo disponivel', async () => {
      const response = await PUT(putRequest({}))

      expect(response.status).toBe(400)
      expect(mockPut).not.toHaveBeenCalled()
    })

    it('liga o currículo no banco', async () => {
      mockPut.mockResolvedValue({
        status: 200,
        data: { ...statusApi, disponivel: true },
      } as never)

      const response = await PUT(putRequest({ disponivel: true }))

      expect(mockPut).toHaveBeenCalledWith('52998224725', { disponivel: true })
      await expect(response.json()).resolves.toMatchObject({ disponivel: true })
    })

    it('liga mesmo com o currículo incompleto', async () => {
      comEscolaridade('')
      mockPut.mockResolvedValue({
        status: 200,
        data: { ...statusApi, disponivel: true },
      } as never)

      const response = await PUT(putRequest({ disponivel: true }))

      expect(response.status).toBe(200)
      expect(mockPut).toHaveBeenCalledWith('52998224725', { disponivel: true })
      await expect(response.json()).resolves.toMatchObject({
        disponivel: true,
        curriculoCompleto: false,
      })
    })

    it('repassa a recusa da API para quem ainda não tem currículo', async () => {
      mockPut.mockResolvedValue({
        status: 422,
        data: { error: 'Crie o currículo antes' },
      } as never)

      const response = await PUT(putRequest({ disponivel: true }))

      expect(response.status).toBe(422)
      await expect(response.json()).resolves.toEqual({
        error: 'Crie o currículo antes',
      })
    })

    it('deslogado recebe 401', async () => {
      mockUser.mockResolvedValue({} as never)

      expect((await PUT(putRequest({ disponivel: true }))).status).toBe(401)
    })
  })
})
