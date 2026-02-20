/** Tipo compartilhado entre server (fetch) e client (context). */
export interface FormacaoApiItem {
  id: string
  descricao: string
}

export interface FormacaoOptions {
  escolaridades: FormacaoApiItem[]
  idiomas: FormacaoApiItem[]
  niveisIdioma: FormacaoApiItem[]
}
