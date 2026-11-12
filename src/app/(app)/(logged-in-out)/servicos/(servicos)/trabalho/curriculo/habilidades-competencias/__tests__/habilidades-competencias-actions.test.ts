import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getHabilidadesCompetenciasAction,
  saveHabilidadesCompetenciasAction,
} from '../habilidades-competencias-actions'

const { getCurriculo, putCurriculo } = vi.hoisted(() => ({
  getCurriculo: vi.fn(),
  putCurriculo: vi.fn(),
}))

vi.mock(
  '@/http-courses/empregabilidade-curriculo/empregabilidade-curriculo',
  () => ({
    getApiV1EmpregabilidadeCurriculoHabilidadesCompetencias: getCurriculo,
    putApiV1EmpregabilidadeCurriculoHabilidadesCompetencias: putCurriculo,
  })
)

vi.mock(
  '@/http-courses/empregabilidade-habilidades/empregabilidade-habilidades',
  () => ({
    getApiV1EmpregabilidadeHabilidadesAreasAtuacao: vi.fn(),
    getApiV1EmpregabilidadeHabilidadesAreasAtuacaoIdHabilidades: vi.fn(),
  })
)

vi.mock(
  '@/http-courses/empregabilidade-comportamentos-atitudes/empregabilidade-comportamentos-atitudes',
  () => ({
    getApiV1EmpregabilidadeComportamentosAtitudes: vi.fn(),
  })
)

const salvo = {
  area_atuacao: { id: 12, nome: 'Comunicação' },
  conhecimentos: [{ id: 4, nome: 'Redação' }],
  comportamentos_atitudes: [{ id: 5, nome: 'Proatividade' }],
}

describe('habilidades-competencias-actions', () => {
  beforeEach(() => {
    getCurriculo.mockReset()
    putCurriculo.mockReset()
  })

  it('converte a resposta 200 no formulário da seção', async () => {
    getCurriculo.mockResolvedValue({ status: 200, data: salvo })

    await expect(getHabilidadesCompetenciasAction()).resolves.toEqual({
      ok: true,
      data: {
        area: { id: 12, nome: 'Comunicação' },
        conhecimentos: [{ id: 4, nome: 'Redação' }],
        comportamentos: [{ id: 5, nome: 'Proatividade' }],
      },
    })
  })

  it('devolve falha quando a API não responde 200', async () => {
    putCurriculo.mockResolvedValue({ status: 400, data: {} })

    await expect(
      saveHabilidadesCompetenciasAction({
        id_area_atuacao: null,
        habilidade_ids: [],
        comportamento_atitudes_ids: [],
      })
    ).resolves.toEqual({
      ok: false,
      status: 400,
      error: 'Não foi possível salvar. Tente novamente.',
    })
    expect(putCurriculo).toHaveBeenCalledOnce()
  })
})
