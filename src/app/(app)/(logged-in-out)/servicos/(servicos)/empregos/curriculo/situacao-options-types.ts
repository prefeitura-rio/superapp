/** Item de lista da API (id + descricao) para situação atual, disponibilidade, regimes. */
export interface SituacaoOptionItem {
  id: string
  descricao: string
}

export interface SituacaoOptions {
  situacoesAtual: SituacaoOptionItem[]
  disponibilidades: SituacaoOptionItem[]
  regimesContratacao: SituacaoOptionItem[]
}
