'use client'

import { enviarRequerimento } from '@/actions/divida-ativa/enviar-requerimento'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  formatarInscricaoImobiliaria,
  formatarValorBRL,
  rotuloNatureza,
} from '@/lib/divida-ativa-utils'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'
import type { TipoSolicitante } from './escolha-tipo-solicitante'

interface ArquivoAnexado {
  tipo: string
  nomeArquivo: string
  conteudoBase64: string
  tamanho: number
}

interface ParcelaCda {
  /** Número da CDA. */
  numeroCda: string
  /** Número da parcela (ex.: 1). */
  numeroParcela: number
  /** Total de parcelas. */
  totalParcelas: number
  /** Valor da parcela. */
  valor: number | null
}

interface RevisarRequerimentoProps {
  cdas: string[]
  /** Quantidade de parcelas escolhida. */
  qtdeParcelas: number
  /** Data de vencimento no formato `dd/MM/yyyy`. */
  dtVencimento: string
  /** Valor da 1ª parcela, em número. */
  valor1aParcela: number | null
  /** Valor total do parcelamento (valorTotalAvista + juros da opção). */
  valorTotal: number | null
  /** Dados das CDAs selecionadas (da consulta de débitos). */
  debitosCdas: DebitoDividaAtiva[]
  tipo: TipoSolicitante
  documentos: ArquivoAnexado[]
  /** Rota de volta para a etapa de documentos. */
  rotaVoltar: string
}

/**
 * Uma linha rótulo/valor — some quando não há valor.
 */
function Linha({
  rotulo,
  valor,
}: { rotulo: string; valor: string | null | undefined }) {
  if (!valor) return null
  return (
    <div className="flex flex-wrap gap-x-1">
      <span className="text-sm font-normal leading-5 text-foreground-light">
        {rotulo}
      </span>
      <span className="text-sm font-normal leading-5 text-foreground">
        {valor}
      </span>
    </div>
  )
}

/**
 * "Revise sua solicitação de parcelamento" — tela 10.
 *
 * Exibe valor total, número de parcelas, dados da CDA e um carrossel horizontal com as
 * parcelas (CDA, parcela N/total, valor). O botão "Requerer parcelamento" dispara a server
 * action.
 *
 * O botão fica travado durante o envio para evitar requerimento duplo.
 */
export function RevisarRequerimento({
  cdas,
  qtdeParcelas,
  dtVencimento,
  valor1aParcela,
  valorTotal,
  debitosCdas,
  tipo,
  documentos,
  rotaVoltar,
}: RevisarRequerimentoProps) {
  const router = useRouter()
  const [enviando, startTransition] = useTransition()

  // Monta os "cards" do carrossel: uma entrada por CDA × (não é parcelamento de múltiplas
  // datas, então o número de parcela é sequencial 1 → N em cada CDA).
  // Como a API não devolve parcelas por CDA na simulação, exibimos uma linha por CDA com
  // a parcela 1/N e o valor da 1ª parcela — igual ao que o portal legado faz.
  const parcelasPorCda: ParcelaCda[] = cdas.map((numeroCda, index) => ({
    numeroCda,
    numeroParcela: index + 1,
    totalParcelas: qtdeParcelas,
    valor: valor1aParcela,
  }))

  function enviar() {
    if (enviando) return

    startTransition(async () => {
      const resultado = await enviarRequerimento({
        cdas,
        qtdeParcelas: String(qtdeParcelas),
        dtVencimento,
        valor1aParcela: valor1aParcela ? String(valor1aParcela) : undefined,
        descVinculoRequerente: tipo,
        documentos: documentos.map(doc => ({
          tipo: doc.tipo,
          nomeArquivo: doc.nomeArquivo,
          conteudoBase64: doc.conteudoBase64,
        })),
      })

      if (!resultado.success) {
        toast.error(resultado.error)
        return
      }

      router.push(
        `/divida-ativa/parcelamento/requerimento/sucesso?protocolo=${encodeURIComponent(resultado.data.protocolo)}`
      )
    })
  }

  // Dados da primeira CDA para o card de informações (o Figma mostra uma CDA de referência).
  const cda = debitosCdas[0] ?? null

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4">
        <h1 className="pt-2 pb-2 text-3xl font-medium leading-9 text-foreground">
          Revise sua solicitação de parcelamento
        </h1>
        <p className="pb-6 text-sm font-normal leading-5 text-foreground-light">
          Se sua solicitação for aprovada, serão aplicados juros simples de 1%
          ao mês, além da correção monetária anual pelo IPCA-E.
        </p>

        {/* Valor total + Nº de parcelas — dois cards lado a lado */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 rounded-2xl bg-card p-4">
            <span className="text-xs font-normal leading-4 text-foreground-light">
              Valor total
            </span>
            <span className="text-base font-medium leading-6 text-foreground">
              {formatarValorBRL(valorTotal) ?? '—'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5 rounded-2xl bg-card p-4">
            <span className="text-xs font-normal leading-4 text-foreground-light">
              Nº de parcelas
            </span>
            <span className="text-base font-medium leading-6 text-foreground">
              {qtdeParcelas}
            </span>
          </div>
        </div>

        {/* Dados da(s) CDA(s) — card com informações fiscais */}
        {cda && (
          <div className="mb-3 flex flex-col gap-1 rounded-2xl bg-card p-4">
            <Linha rotulo="Contribuinte" valor={cda.contribuinte} />
            <Linha
              rotulo="Inscrição imobiliária"
              valor={
                cda.inscricao
                  ? formatarInscricaoImobiliaria(cda.inscricao)
                  : null
              }
            />
            <Linha
              rotulo="Natureza da dívida"
              valor={rotuloNatureza(cda.natureza) ?? cda.natureza}
            />
            {/* `receita` não entra no tipo de visão (é código interno como "4693").
                Quando a API o devolver como texto legível, incluir aqui. */}
            <Linha
              rotulo="Situação do principal"
              valor={cda.situacaoPrincipal}
            />
            <Linha rotulo="Fase da cobrança" valor={cda.faseCobranca} />
            <Linha
              rotulo="Situação dos honorários"
              valor={cda.situacaoHonorarios}
            />
          </div>
        )}
      </div>

      {/* Carrossel de parcelas por CDA — rola na horizontal */}
      <div className="mb-3 px-4">
        <h2 className="pb-3 text-base font-medium leading-6 text-foreground">
          Parcelas {qtdeParcelas}
        </h2>
      </div>

      <div
        className="mb-3 flex gap-3 overflow-x-auto px-4 pb-2"
        aria-label={`Parcelas — ${qtdeParcelas} no total`}
      >
        {parcelasPorCda.map(parcela => (
          <div
            key={parcela.numeroCda}
            className="flex w-40 shrink-0 flex-col gap-1 rounded-2xl bg-card p-4"
          >
            <span className="text-xs font-normal leading-4 text-foreground-light">
              CDA
            </span>
            <span className="text-sm font-medium leading-5 text-foreground">
              {parcela.numeroCda}
            </span>

            <span className="mt-2 text-xs font-normal leading-4 text-foreground-light">
              Parcela
            </span>
            <span className="text-sm font-normal leading-5 text-foreground">
              {parcela.numeroParcela}/{parcela.totalParcelas}
            </span>

            <span className="mt-2 text-xs font-normal leading-4 text-foreground-light">
              Valor
            </span>
            <span className="text-sm font-normal leading-5 text-foreground">
              {formatarValorBRL(parcela.valor) ?? '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 pb-4">
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          loading={enviando}
          onClick={enviar}
        >
          Requerer parcelamento
        </CustomButton>
      </div>
    </div>
  )
}
