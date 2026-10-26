import { render } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'

import {
  type DocumentosRequerimento,
  DocumentosRequerimentoProvider,
  useDocumentosRequerimento,
} from '../documentos-requerimento-context'

const IDENTIDADE = {
  tipo: 'IDENTIDADE',
  nomeArquivo: 'rg.pdf',
  conteudoBase64: 'data:application/pdf;base64,AAAA',
  tamanho: 3,
}

/** Monta o provider e devolve a API do hook, como um componente do wizard a veria. */
function montar() {
  let api: DocumentosRequerimento | null = null
  function Espiao() {
    api = useDocumentosRequerimento()
    return null
  }
  const tela = render(
    <DocumentosRequerimentoProvider>
      <Espiao />
    </DocumentosRequerimentoProvider>
  )
  if (!api) throw new Error('hook não montou')
  return { api: api as DocumentosRequerimento, tela }
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('DocumentosRequerimentoProvider', () => {
  test('guarda os anexos do vínculo e não os entrega a outro vínculo', () => {
    const { api } = montar()

    api.salvarDocumentos('CONTRIBUINTE', [IDENTIDADE])

    expect(api.lerDocumentos('CONTRIBUINTE')).toEqual([IDENTIDADE])
    expect(api.lerDocumentos('PROCURADOR')).toEqual([])
  })

  test('limpar descarta os anexos', () => {
    const { api } = montar()
    api.salvarDocumentos('CONTRIBUINTE', [IDENTIDADE])

    api.limparDocumentos()

    expect(api.lerDocumentos('CONTRIBUINTE')).toEqual([])
  })

  // Os documentos têm identidade, CPF e procuração: nada fica no navegador.
  test('não grava nada no sessionStorage', () => {
    const { api } = montar()

    api.salvarDocumentos('CONTRIBUINTE', [IDENTIDADE])

    expect(sessionStorage.length).toBe(0)
  })

  // O provider vive no layout do wizard: sair do fluxo o desmonta.
  test('sair do fluxo descarta os anexos', () => {
    const primeiro = montar()
    primeiro.api.salvarDocumentos('CONTRIBUINTE', [IDENTIDADE])
    primeiro.tela.unmount()

    const { api } = montar()

    expect(api.lerDocumentos('CONTRIBUINTE')).toEqual([])
  })

  test('fora do provider, o hook avisa em vez de perder arquivos em silêncio', () => {
    function Solto() {
      useDocumentosRequerimento()
      return null
    }

    expect(() => render(<Solto />)).toThrow(/DocumentosRequerimentoProvider/)
  })
})
