import { describe, expect, it } from 'vitest'
import {
  alternarId,
  arraysDeIdsIguais,
  extrairIdsComportamentosUnicos,
} from '../utils'

describe('habilidades e competências - comparação de snapshots', () => {
  it('considera os mesmos IDs iguais independentemente da ordem', () => {
    expect(arraysDeIdsIguais([3, 1, 2], [2, 3, 1])).toBe(true)
  })

  it('detecta diferença entre o estado anterior e o atual', () => {
    expect(arraysDeIdsIguais([1, 2], [1, 2, 3])).toBe(false)
  })

  it('alterna um ID: inclui quando ausente e retira quando presente', () => {
    expect(alternarId([1, 2], 3)).toEqual([1, 2, 3])
    expect(alternarId([1, 2, 3], 2)).toEqual([1, 3])
    expect(alternarId([], 7)).toEqual([7])
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
