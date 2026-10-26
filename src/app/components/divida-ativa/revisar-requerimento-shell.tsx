'use client'

import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  type DadosCorrespondencia,
  type DadosRequerente,
  dadosCorrespondenciaSchema,
  dadosRequerenteSchema,
} from './dados-requerimento-schema'
import {
  lerDadosCorrespondencia,
  lerDadosRequerente,
} from './dados-requerimento-storage'
import {
  type ArquivoAnexado,
  useDocumentosRequerimento,
} from './documentos-requerimento-context'
import { RevisarRequerimento } from './revisar-requerimento'
import type { TipoSolicitante } from './tipos-solicitante'

interface RevisarRequerimentoShellProps {
  /** Quem está logado — para a declaração. */
  nome: string
  cpf: string
  cdas: string[]
  qtdeParcelas: number
  dtVencimento: string
  valor1aParcela: number | null
  valorTotal: number | null
  debitosCdas: DebitoDividaAtiva[]
  tipo: TipoSolicitante
  /** Etapas para onde voltar se faltar algo no `sessionStorage` — e os "Editar" da revisão. */
  rotaDocumentos: string
  rotaRequerente: string
  rotaCorrespondencia: string
}

interface DadosDaSessao {
  documentos: ArquivoAnexado[]
  requerente: DadosRequerente
  correspondencia: DadosCorrespondencia
}

/**
 * Shell client-side da etapa de revisão.
 *
 * O Server Component da page faz as chamadas ao DAL (simulação + CDAs) e passa os dados
 * como props. Este componente lê o que não trafega na URL: os **documentos**, da memória do
 * layout do wizard (`useDocumentosRequerimento`), e os **dados do requerente e de
 * correspondência**, do `sessionStorage` (dado pessoal não vai em query string).
 *
 * Falta algo — aba nova, página recarregada, link compartilhado — e o cidadão volta à primeira
 * etapa incompleta, na ordem do fluxo: requerente, correspondência, documentos. Os dados são
 * revalidados com o schema: um registro antigo ou adulterado não chega ao envio.
 */
export function RevisarRequerimentoShell({
  nome,
  cpf,
  cdas,
  qtdeParcelas,
  dtVencimento,
  valor1aParcela,
  valorTotal,
  debitosCdas,
  tipo,
  rotaDocumentos,
  rotaRequerente,
  rotaCorrespondencia,
}: RevisarRequerimentoShellProps) {
  const router = useRouter()
  const { lerDocumentos } = useDocumentosRequerimento()
  const [dados, setDados] = useState<DadosDaSessao | null>(null)

  useEffect(() => {
    const requerente = dadosRequerenteSchema.safeParse(lerDadosRequerente())
    if (!requerente.success) {
      router.replace(rotaRequerente)
      return
    }

    const correspondencia = dadosCorrespondenciaSchema.safeParse(
      lerDadosCorrespondencia()
    )
    if (!correspondencia.success) {
      router.replace(rotaCorrespondencia)
      return
    }

    const documentos = lerDocumentos(tipo)
    if (documentos.length === 0) {
      router.replace(rotaDocumentos)
      return
    }

    setDados({
      documentos,
      requerente: requerente.data,
      correspondencia: correspondencia.data,
    })
  }, [
    router,
    rotaDocumentos,
    rotaRequerente,
    rotaCorrespondencia,
    tipo,
    lerDocumentos,
  ])

  // Durante SSR e antes do useEffect: nada — evita flash de conteúdo incorreto.
  if (dados === null) return null

  return (
    <RevisarRequerimento
      cdas={cdas}
      qtdeParcelas={qtdeParcelas}
      dtVencimento={dtVencimento}
      valor1aParcela={valor1aParcela}
      valorTotal={valorTotal}
      debitosCdas={debitosCdas}
      tipo={tipo}
      documentos={dados.documentos}
      requerente={dados.requerente}
      correspondencia={dados.correspondencia}
      rotaRequerente={rotaRequerente}
      rotaCorrespondencia={rotaCorrespondencia}
      nome={nome}
      cpf={cpf}
    />
  )
}
