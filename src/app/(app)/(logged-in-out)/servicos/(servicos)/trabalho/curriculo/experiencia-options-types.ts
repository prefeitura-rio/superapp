/** Item da API para tipo de conquista (id + descricao). */
export interface TipoConquistaItem {
  id: string
  descricao: string
}

export interface ExperienciaOptions {
  tiposConquista: TipoConquistaItem[]
}
