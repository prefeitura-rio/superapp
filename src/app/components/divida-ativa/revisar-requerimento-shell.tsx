'use client'

import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { TipoSolicitante } from './escolha-tipo-solicitante'
import { RevisarRequerimento } from './revisar-requerimento'
import { SimulacaoAviso } from './simulacao-aviso'

/** Chave usada por `AnexarDocumentos` ao salvar e por este componente ao ler. */
export const CHAVE_DOCUMENTOS_SESSION = 'divida-ativa:requerimento:documentos'

interface ArquivoAnexado {
  tipo: string
  nomeArquivo: string
  conteudoBase64: string
  tamanho: number
}

interface RevisarRequerimentoShellProps {
  cdas: string[]
  qtdeParcelas: number
  dtVencimento: string
  valor1aParcela: number | null
  valorTotal: number | null
  debitosCdas: DebitoDividaAtiva[]
  tipo: TipoSolicitante
  rotaVoltar: string
  /** Rota para onde ir se os documentos não forem encontrados no sessionStorage. */
  rotaDocumentos: string
}

/**
 * Shell client-side da etapa de revisão.
 *
 * O Server Component da page faz as chamadas ao DAL (simulação + CDAs) e passa os dados
 * como props. Este componente lê os **documentos** do `sessionStorage` — eles não trafegam
 * na URL para evitar HTTP 431 (base64 nos query params estoura os headers do servidor).
 *
 * Estados possíveis durante a montagem:
 * - `carregando` — antes do primeiro `useEffect` (SSR: `sessionStorage` não existe).
 * - `sem-documentos` — sessionStorage vazio ou expirado: redireciona de volta ao upload.
 * - `pronto` — documentos lidos, renderiza `RevisarRequerimento`.
 */
export function RevisarRequerimentoShell({
  cdas,
  qtdeParcelas,
  dtVencimento,
  valor1aParcela,
  valorTotal,
  debitosCdas,
  tipo,
  rotaVoltar,
  rotaDocumentos,
}: RevisarRequerimentoShellProps) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<ArquivoAnexado[] | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(CHAVE_DOCUMENTOS_SESSION)
    if (!raw) {
      router.replace(rotaDocumentos)
      return
    }

    try {
      const parsed: ArquivoAnexado[] = JSON.parse(raw)
      if (parsed.length === 0) throw new Error('vazio')
      setDocumentos(parsed)
    } catch {
      router.replace(rotaDocumentos)
    }
  }, [router, rotaDocumentos])

  // Durante SSR e antes do useEffect: nada — evita flash de conteúdo incorreto.
  if (documentos === null) return null

  return (
    <RevisarRequerimento
      cdas={cdas}
      qtdeParcelas={qtdeParcelas}
      dtVencimento={dtVencimento}
      valor1aParcela={valor1aParcela}
      valorTotal={valorTotal}
      debitosCdas={debitosCdas}
      tipo={tipo}
      documentos={documentos}
      rotaVoltar={rotaVoltar}
    />
  )
}
