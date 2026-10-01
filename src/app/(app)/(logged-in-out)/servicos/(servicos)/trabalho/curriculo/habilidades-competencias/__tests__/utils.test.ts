import { describe, expect, it } from 'vitest'
import type { AreaAtuacaoViewModel } from '../types'
import {
  arraysDeIdsIguais,
  extrairIdsComportamentosUnicos,
  extrairIdsHabilidadesUnicos,
} from '../utils'

describe('habilidades e competências - comparação de snapshots', () => {
  it('considera os mesmos IDs iguais independentemente da ordem', () => {
    expect(arraysDeIdsIguais([3, 1, 2], [2, 3, 1])).toBe(true)
  })

  it('detecta diferença entre o estado anterior e o atual', () => {
    expect(arraysDeIdsIguais([1, 2], [1, 2, 3])).toBe(false)
  })

  it('extrai somente IDs das tuplas Área × Habilidade selecionadas, sem duplicar', () => {
    const areas: AreaAtuacaoViewModel[] = [
      {
        nome: 'Área A',
        checked: true,
        vinculos: [
          { idTupla: 10, nome: 'Habilidade 1', checked: true },
          { idTupla: 11, nome: 'Habilidade 2', checked: false },
        ],
      },
      {
        nome: 'Área B',
        checked: true,
        vinculos: [{ idTupla: 10, nome: 'Habilidade 1', checked: true }],
      },
    ]

    expect(extrairIdsHabilidadesUnicos(areas)).toEqual([10])
  })

  it('extrai somente comportamentos selecionados', () => {
    expect(
      extrairIdsComportamentosUnicos([
        { id: 1, nome: 'A', clicked: true },
        { id: 2, nome: 'B', clicked: false },
        { id: 3, nome: 'C', clicked: true },
      ])
    ).toEqual([1, 3])
  })
})
