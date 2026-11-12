'use client'

import { enviarRequerimento } from '@/actions/divida-ativa/enviar-requerimento'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { SwiperWrapper } from '@/components/ui/custom/swiper-wrapper'
import {
  formatarCep,
  formatarInscricaoImobiliaria,
  formatarValorBRL,
  rotuloNatureza,
} from '@/lib/divida-ativa-utils'
import type { DebitoDividaAtiva } from '@/types/divida-ativa'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type RefObject, useEffect, useRef, useState } from 'react'
import { ConfirmacaoDeclaracaoSheet } from './confirmacao-declaracao'
import type {
  DadosCorrespondencia,
  DadosRequerente,
} from './dados-requerimento-schema'
import { limparDadosRequerimento } from './dados-requerimento-storage'
import {
  type ArquivoAnexado,
  useDocumentosRequerimento,
} from './documentos-requerimento-context'
import type { TipoSolicitante } from './tipos-solicitante'

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
  requerente: DadosRequerente
  correspondencia: DadosCorrespondencia
  /** Etapas de cada bloco de dados, para o "Editar". */
  rotaRequerente: string
  rotaCorrespondencia: string
  /** Quem está logado — aparece na declaração, como no portal legado. */
  nome: string
  cpf: string
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

/** Largura mínima de um card de parcela, em px — abaixo disso o número da CDA quebra linha. */
const LARGURA_MINIMA_CARD = 160
/** Espaço entre os cards (`gap-3`), em px. */
const ESPACO_ENTRE_CARDS = 12

/**
 * Largura do elemento, acompanhando redimensionamentos.
 *
 * `null` até a primeira medição — no servidor e no primeiro render do cliente — para a tela
 * decidir um layout provisório sem depender de `window`.
 */
function useLargura(ref: RefObject<HTMLElement | null>): number | null {
  const [largura, setLargura] = useState<number | null>(null)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const medir = () => setLargura(elemento.getBoundingClientRect().width)
    medir()

    // jsdom (testes) não tem ResizeObserver; lá basta a medição inicial.
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(medir)
    observer.observe(elemento)
    return () => observer.disconnect()
  }, [ref])

  return largura
}

/** Card de uma CDA na seção de parcelas: o número da certidão e o valor da parcela. */
function ParcelaCard({
  numeroCda,
  valor,
}: { numeroCda: string; valor: number | null }) {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col gap-1 rounded-2xl bg-card p-4">
      <span className="text-xs font-normal leading-4 text-foreground-light">
        CDA
      </span>
      <span className="text-sm font-medium leading-5 text-foreground">
        {numeroCda}
      </span>

      <span className="mt-2 text-xs font-normal leading-4 text-foreground-light">
        Valor da 1ª parcela
      </span>
      <span className="text-sm font-normal leading-5 text-foreground">
        {formatarValorBRL(valor) ?? '—'}
      </span>
    </div>
  )
}

/**
 * Seção "Parcela(s)" — um card por CDA, em layout que se adapta à largura disponível.
 *
 * Os cards dividem a linha igualmente (um ocupa tudo; dois, metade cada) enquanto couberem
 * com pelo menos `LARGURA_MINIMA_CARD`. Quando não cabem mais — iriam para uma segunda
 * linha — a seção vira o carrossel padrão do projeto (`SwiperWrapper`), mostrando por
 * página quantos cabem.
 *
 * ⚠️ A simulação devolve **um** `valor1aParcela` para o parcelamento inteiro (todas as
 * CDAs juntas), não um por CDA — `itens` só traz saldos. Com uma CDA o valor é exatamente
 * o da parcela dela; com várias, cada card repete o valor da parcela do conjunto. Não há
 * "parcela N/total" aqui porque não existem N cards de parcelas: cada card é uma CDA.
 */
function ParcelasPorCda({
  cdas,
  qtdeParcelas,
  valor1aParcela,
}: { cdas: string[]; qtdeParcelas: number; valor1aParcela: number | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const largura = useLargura(containerRef)

  // Quantos cards cabem numa linha. Antes da medição, assume a tela do celular: dois.
  const cabem =
    largura === null
      ? 2
      : Math.max(
          1,
          Math.floor(
            (largura + ESPACO_ENTRE_CARDS) /
              (LARGURA_MINIMA_CARD + ESPACO_ENTRE_CARDS)
          )
        )
  const emCarrossel = cdas.length > cabem

  const cards = cdas.map(numeroCda => (
    <ParcelaCard key={numeroCda} numeroCda={numeroCda} valor={valor1aParcela} />
  ))

  return (
    // `overflow-x-hidden`: as setas do carrossel ficam fora do swiper, sobre o `px-4`.
    <section className="overflow-x-hidden px-4">
      <h2 className="pb-3 text-base font-medium leading-6 text-foreground">
        {qtdeParcelas === 1 ? 'Parcela' : 'Parcelas'}
      </h2>

      <div ref={containerRef}>
        {emCarrossel ? (
          <SwiperWrapper
            slidesPerView={cabem}
            slidesPerGroup={cabem}
            spaceBetween={ESPACO_ENTRE_CARDS}
            showArrows
            showPagination
            // O `.swiper-slide` nasce com `height: 100%`, o que anula o stretch do flex e
            // deixa cada card com a própria altura. Com `h-auto` + `flex`, todos os slides
            // da linha esticam até o mais alto e o card (`h-full`) acompanha.
            // O `!` é necessário: o CSS do Swiper não usa cascade layer e, por isso, vence
            // qualquer utilitário do Tailwind (que fica em `@layer utilities`), mesmo com
            // especificidade maior.
            className="[&_.swiper-slide]:flex! [&_.swiper-slide]:h-auto!"
          >
            {cards}
          </SwiperWrapper>
        ) : (
          <div className="flex gap-3">{cards}</div>
        )}
      </div>
    </section>
  )
}

/** Card de um bloco de dados com o atalho "Editar" para a etapa onde ele foi preenchido. */
function BlocoDados({
  titulo,
  rotaEditar,
  children,
}: {
  titulo: string
  rotaEditar: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-3 flex flex-col gap-1 rounded-2xl bg-card p-4">
      <div className="flex items-center justify-between gap-2 pb-1">
        <h2 className="text-sm font-medium leading-5 text-foreground">
          {titulo}
        </h2>
        <Link
          href={rotaEditar}
          className="text-sm font-normal leading-5 text-primary"
          aria-label={`Editar ${titulo.toLowerCase()}`}
        >
          Editar
        </Link>
      </div>
      {children}
    </section>
  )
}

/**
 * "Revise sua solicitação de parcelamento" — tela 10.
 *
 * Exibe valor total, número de parcelas, dados da CDA e a seção de parcelas (um card por
 * CDA com o valor da 1ª parcela — ver `ParcelasPorCda`). O botão "Requerer parcelamento"
 * dispara a server action.
 *
 * Os blocos "Seus dados" e "Correspondência" não estão no Figma (as etapas que os preenchem
 * também não): mostram o que vai no pedido, cada um com "Editar" para a sua etapa.
 *
 * "Requerer parcelamento" abre a declaração (`ConfirmacaoDeclaracaoSheet`); o envio só
 * acontece de lá, com o aceite marcado. O botão de envio fica travado durante a chamada para
 * evitar requerimento duplo.
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
  requerente,
  correspondencia,
  rotaRequerente,
  rotaCorrespondencia,
  nome,
  cpf,
}: RevisarRequerimentoProps) {
  const router = useRouter()
  const { limparDocumentos } = useDocumentosRequerimento()
  const [confirmando, setConfirmando] = useState(false)

  /** Envia com a declaração aceita; devolve a mensagem de erro para o sheet, ou `null`. */
  async function enviar(): Promise<string | null> {
    // Sem `valor1aParcela`: a action refaz a simulação e manda o valor dela ao DAM.
    const resultado = await enviarRequerimento({
      cdas,
      qtdeParcelas: String(qtdeParcelas),
      dtVencimento,
      tipo,
      requerente,
      correspondencia,
      documentos: documentos.map(doc => ({
        tipo: doc.tipo,
        nomeArquivo: doc.nomeArquivo,
        conteudoBase64: doc.conteudoBase64,
      })),
      declaracaoAceita: true,
    })

    if (!resultado.success) return resultado.error

    // Enviado: anexos e dados não servem a outro requerimento.
    limparDocumentos()
    limparDadosRequerimento()

    // O comprovante não vai na URL (pode levar token): a confirmação o busca pelo protocolo.
    const { protocolo, prazo } = resultado.data
    const destino = new URLSearchParams({ protocolo })
    if (prazo) destino.set('prazo', prazo)
    router.push(`/divida-ativa/parcelamento/requerimento/sucesso?${destino}`)

    return null
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

      <div className="px-4">
        <BlocoDados titulo="Seus dados" rotaEditar={rotaRequerente}>
          <Linha rotulo="Telefone" valor={requerente.telefone} />
          <Linha rotulo="E-mail" valor={requerente.email} />
        </BlocoDados>

        <BlocoDados titulo="Correspondência" rotaEditar={rotaCorrespondencia}>
          <Linha rotulo="Nome" valor={correspondencia.nome} />
          <Linha
            rotulo={correspondencia.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF'}
            valor={correspondencia.documento}
          />
          <Linha
            rotulo="Endereço"
            valor={[
              `${correspondencia.logradouro}, ${correspondencia.numero}`,
              correspondencia.complemento,
              correspondencia.bairro,
              `${correspondencia.municipio}/${correspondencia.uf.toUpperCase()}`,
              `CEP ${formatarCep(correspondencia.cep)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
          <Linha rotulo="Telefone" valor={correspondencia.telefone} />
          <Linha rotulo="E-mail" valor={correspondencia.email} />
        </BlocoDados>
      </div>

      <ParcelasPorCda
        cdas={cdas}
        qtdeParcelas={qtdeParcelas}
        valor1aParcela={valor1aParcela}
      />

      {/* `pt-6 pb-2`: o mesmo respiro das outras telas do fluxo antes do botão principal. */}
      <div className="mt-auto px-4 pt-6 pb-2">
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setConfirmando(true)}
        >
          Requerer parcelamento
        </CustomButton>
      </div>

      <ConfirmacaoDeclaracaoSheet
        aberto={confirmando}
        onAbertoChange={setConfirmando}
        nome={nome}
        cpf={cpf}
        onConfirmar={enviar}
      />
    </div>
  )
}
