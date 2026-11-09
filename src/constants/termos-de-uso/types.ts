/** Parágrafo corrido ou lista de itens (alíneas "a)", subitens "9.2.1." etc.). */
export type TermosDeUsoBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

export interface TermosDeUsoSection {
  /** Título com a numeração do próprio documento, ex.: "1. Da ciência do Termo de uso". */
  title: string
  blocks: TermosDeUsoBlock[]
}

/**
 * Parte do documento. A primeira (Termo de Uso) não tem título: quem dá o nome
 * é o h1 da tela. As seguintes (ex.: Aviso de Privacidade) têm título e
 * numeração própria.
 */
export interface TermosDeUsoPart {
  title?: string
  intro?: TermosDeUsoBlock[]
  sections: TermosDeUsoSection[]
}

export interface TermosDeUsoDocument {
  /** Mês e ano da última atualização, ex.: "Abril de 2026". */
  updatedAt: string
  /** Versão do texto, ex.: "1.0". */
  version: string
  parts: TermosDeUsoPart[]
}
