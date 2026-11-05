import type { EmpregabilidadeCatalogoItem } from '@/http-courses/models'

export type CatalogoItem = {
  id: number
  nome: string
}

export type CatalogoPage = {
  data: CatalogoItem[]
  total: number
  page: number
  pageSize: number
}

export type HabilidadesCompetenciasForm = {
  area: CatalogoItem | null
  conhecimentos: CatalogoItem[]
  comportamentos: CatalogoItem[]
}

export const PAGE_SIZE = 40

export const HABILIDADES_VAZIO: HabilidadesCompetenciasForm = {
  area: null,
  conhecimentos: [],
  comportamentos: [],
}

export function comoItem(
  item: EmpregabilidadeCatalogoItem | null | undefined
): CatalogoItem | null {
  if (item?.id == null || !item.nome) return null
  return { id: item.id, nome: item.nome }
}

export function comoLista(
  itens: EmpregabilidadeCatalogoItem[] | null | undefined
): CatalogoItem[] {
  return (itens ?? []).flatMap(item => {
    const convertido = comoItem(item)
    return convertido ? [convertido] : []
  })
}

export function mesmosIds(atual: CatalogoItem[], salvo: CatalogoItem[]) {
  if (atual.length !== salvo.length) return false
  const idsAtuais = atual.map(item => item.id).sort((a, b) => a - b)
  const idsSalvos = salvo.map(item => item.id).sort((a, b) => a - b)
  return idsAtuais.every((id, indice) => id === idsSalvos[indice])
}

export function alternarItem(lista: CatalogoItem[], item: CatalogoItem) {
  if (lista.some(atual => atual.id === item.id)) {
    return lista.filter(atual => atual.id !== item.id)
  }
  return [...lista, item]
}

/** Itens marcados que não vieram nesta página continuam visíveis. */
export function unirSelecionados(
  pagina: CatalogoItem[],
  selecionados: CatalogoItem[]
) {
  const idsDaPagina = new Set(pagina.map(item => item.id))
  const foraDaPagina = selecionados.filter(item => !idsDaPagina.has(item.id))
  return [...foraDaPagina, ...pagina]
}
