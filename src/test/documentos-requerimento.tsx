import {
  type ArquivoAnexado,
  type DocumentosRequerimento,
  DocumentosRequerimentoProvider,
  useDocumentosRequerimento,
} from '@/app/components/divida-ativa/documentos-requerimento-context'
import type { TipoSolicitante } from '@/app/components/divida-ativa/tipos-solicitante'
import { render } from '@testing-library/react'
import { useState } from 'react'

/**
 * Renderiza uma etapa do requerimento dentro do layout do wizard, com anexos já guardados
 * (como quem volta da revisão). Devolve a API dos anexos para o teste conferir o que ficou.
 */
export function renderNoWizard(
  ui: React.ReactElement,
  salvos?: { tipo: TipoSolicitante; documentos: ArquivoAnexado[] }
) {
  let api: DocumentosRequerimento | null = null

  // Antes da etapa na árvore: guarda na renderização, e a etapa lê no próprio efeito.
  function Semear() {
    api = useDocumentosRequerimento()
    useState(() => {
      if (salvos) api?.salvarDocumentos(salvos.tipo, salvos.documentos)
    })
    return null
  }

  const tela = render(
    <DocumentosRequerimentoProvider>
      <Semear />
      {ui}
    </DocumentosRequerimentoProvider>
  )

  return {
    ...tela,
    documentos: () => api as unknown as DocumentosRequerimento,
  }
}
