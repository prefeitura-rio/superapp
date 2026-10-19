import type { TipoSolicitante } from './tipos-solicitante'

/** Um arquivo já carregado pelo cidadão. */
export interface ArquivoAnexado {
  /** `tipo` do `DocumentoDamRequest` — o que a API espera (ex.: `"IDENTIDADE"`). */
  tipo: string
  nomeArquivo: string
  conteudoBase64: string
  /** Tamanho em bytes do arquivo original — para exibir e validar. */
  tamanho: number
}

/**
 * Chave fixa: só um requerimento pode estar em andamento por vez na aba.
 *
 * Os documentos ficam no `sessionStorage`, não na URL, para evitar HTTP 431 (Request Header
 * Fields Too Large) causado por base64 nos query params.
 */
export const CHAVE_DOCUMENTOS_SESSION = 'divida-ativa:requerimento:documentos'

interface DocumentosSalvos {
  /** Os slots mudam por vínculo: arquivos de outro vínculo não são reaproveitados. */
  tipoSolicitante: TipoSolicitante
  documentos: ArquivoAnexado[]
}

/**
 * Salva os anexos do requerimento. Devolve `false` se o navegador recusar — cota do
 * `sessionStorage` estourada ou armazenamento bloqueado.
 */
export function salvarDocumentos(
  tipoSolicitante: TipoSolicitante,
  documentos: ArquivoAnexado[]
): boolean {
  try {
    sessionStorage.setItem(
      CHAVE_DOCUMENTOS_SESSION,
      JSON.stringify({ tipoSolicitante, documentos } satisfies DocumentosSalvos)
    )
    return true
  } catch {
    return false
  }
}

/** Anexos salvos para este vínculo; lista vazia se não houver ou se forem de outro vínculo. */
export function lerDocumentos(
  tipoSolicitante: TipoSolicitante
): ArquivoAnexado[] {
  try {
    const raw = sessionStorage.getItem(CHAVE_DOCUMENTOS_SESSION)
    if (!raw) return []

    const salvos: DocumentosSalvos = JSON.parse(raw)
    if (
      salvos?.tipoSolicitante !== tipoSolicitante ||
      !Array.isArray(salvos.documentos)
    ) {
      return []
    }

    return salvos.documentos
  } catch {
    return []
  }
}

/** Descarta os anexos — depois do envio, para o próximo requerimento começar do zero. */
export function limparDocumentos() {
  try {
    sessionStorage.removeItem(CHAVE_DOCUMENTOS_SESSION)
  } catch {
    // Armazenamento bloqueado: não há o que limpar.
  }
}
