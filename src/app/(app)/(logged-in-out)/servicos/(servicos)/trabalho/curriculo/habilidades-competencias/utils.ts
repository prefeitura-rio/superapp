import type { ComportamentoAtitudeViewModel } from './types'

export function extrairIdsComportamentosUnicos(
  comportamentos: ComportamentoAtitudeViewModel[]
): number[] {
  return [
    ...new Set(
      comportamentos.filter(item => item.clicked).map(item => Number(item.id))
    ),
  ]
}

export function arraysDeIdsIguais(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false

  const aOrdenado = [...a].sort((x, y) => x - y)
  const bOrdenado = [...b].sort((x, y) => x - y)

  return aOrdenado.every((valor, index) => valor === bOrdenado[index])
}

/** Inclui o id quando ausente e o retira quando presente. */
export function alternarId(ids: number[], id: number): number[] {
  return ids.includes(id) ? ids.filter(atual => atual !== id) : [...ids, id]
}
