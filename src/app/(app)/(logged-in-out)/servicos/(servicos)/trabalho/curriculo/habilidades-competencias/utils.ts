import type {
  AreaAtuacaoViewModel,
  ComportamentoAtitudeViewModel,
} from './types'

export function extrairIdsHabilidadesUnicos(
  areasAtuacao: AreaAtuacaoViewModel[]
): number[] {
  return [
    ...new Set(
      areasAtuacao.flatMap(area =>
        area.vinculos
          .filter(vinculo => vinculo.checked)
          .map(vinculo => vinculo.idTupla)
      )
    ),
  ]
}

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
