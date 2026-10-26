'use client'

import { createContext, useContext, useMemo, useRef } from 'react'
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

interface DocumentosSalvos {
  /** Os slots mudam por vínculo: arquivos de outro vínculo não são reaproveitados. */
  tipoSolicitante: TipoSolicitante
  documentos: ArquivoAnexado[]
}

export interface DocumentosRequerimento {
  /** Anexos guardados para este vínculo; lista vazia se não houver ou forem de outro. */
  lerDocumentos: (tipoSolicitante: TipoSolicitante) => ArquivoAnexado[]
  salvarDocumentos: (
    tipoSolicitante: TipoSolicitante,
    documentos: ArquivoAnexado[]
  ) => void
  /** Descarta os anexos — depois do envio, para o próximo requerimento começar do zero. */
  limparDocumentos: () => void
}

const DocumentosRequerimentoContext =
  createContext<DocumentosRequerimento | null>(null)

/**
 * Guarda os anexos do requerimento **só em memória**, do upload até o envio.
 *
 * Fica no layout de `/divida-ativa/parcelamento/requerimento`: todas as etapas do wizard são
 * essa rota com `?etapa=` diferente, então o layout — e os arquivos — sobrevivem à navegação
 * entre elas. Sair do fluxo desmonta o layout e descarta os arquivos; recarregar a página
 * também, e a revisão manda o cidadão de volta ao upload.
 *
 * Não usa `sessionStorage`: o base64 de identidade, CPF e procuração ficaria no navegador
 * até a aba fechar, e a cota (~5 MB) não comporta o pior caso dos anexos.
 *
 * Um `ref`, não estado: quem lê são as etapas, que copiam para o próprio estado ao montar;
 * ninguém precisa renderizar de novo quando os anexos mudam.
 */
export function DocumentosRequerimentoProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const salvos = useRef<DocumentosSalvos | null>(null)

  const api = useMemo<DocumentosRequerimento>(
    () => ({
      lerDocumentos: tipoSolicitante =>
        salvos.current?.tipoSolicitante === tipoSolicitante
          ? salvos.current.documentos
          : [],
      salvarDocumentos: (tipoSolicitante, documentos) => {
        salvos.current = { tipoSolicitante, documentos }
      },
      limparDocumentos: () => {
        salvos.current = null
      },
    }),
    []
  )

  return (
    <DocumentosRequerimentoContext.Provider value={api}>
      {children}
    </DocumentosRequerimentoContext.Provider>
  )
}

export function useDocumentosRequerimento(): DocumentosRequerimento {
  const api = useContext(DocumentosRequerimentoContext)
  if (!api) {
    throw new Error(
      'useDocumentosRequerimento precisa do DocumentosRequerimentoProvider (layout do requerimento).'
    )
  }
  return api
}
