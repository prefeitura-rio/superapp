'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import {
  formatDate,
  normalizeStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import type { RequestStatus } from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import { Breadcrumb } from '@/app/components/breadcrumb'
import { BreadcrumbSkeleton } from '@/app/components/breadcrumb-skeleton'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { Skeleton } from '@/components/ui/skeleton'
import { TICKET_FORM_BASE_URL } from '@/constants/url'
import { useChamadoDetalhe } from '@/hooks/chamados/use-chamados'
import type { ChamadoJson } from '@/lib/chamados/fetchers'
import { decodeHtmlEntities } from '@/lib/html-entities'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-normal leading-5 tracking-normal text-foreground-light">
        {label}
      </span>
      <span className="text-sm font-normal leading-5 tracking-normal text-foreground">
        {value}
      </span>
    </div>
  )
}

function SectionCard({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-card rounded-2xl p-4 flex flex-col gap-3 ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

const captionStyle: React.CSSProperties = {
  color: 'var(--foreground-light, #71717B)',
  fontFamily: 'var(--font-family-sans, "DM Sans")',
  fontSize: 'var(--font-size-xs, 12px)',
  fontWeight: 'var(--font-weight-normal, 400)',
  lineHeight: 'var(--font-leading-4, 16px)',
  letterSpacing: 'var(--font-tracking-normal, 0)',
}

const dottedLineStyle: React.CSSProperties = {
  width: '1.5px',
  backgroundImage:
    'repeating-linear-gradient(to bottom, var(--foreground-light) 0px, var(--foreground-light) 3px, transparent 3px, transparent 6px)',
  opacity: 0.4,
}

function titleStyle(active: boolean): React.CSSProperties {
  return {
    color: active
      ? 'var(--card-foreground, #020618)'
      : 'var(--foreground-light, #71717B)',
    fontFamily: 'var(--font-family-sans, "DM Sans")',
    fontSize: 'var(--font-size-sm, 14px)',
    fontWeight: 'var(--font-weight-medium, 500)',
    lineHeight: 'var(--font-leading-5, 20px)',
    letterSpacing: 'var(--font-tracking-normal, 0)',
  }
}

function AndamentoChevron({ open }: { open: boolean }) {
  return (
    <div className="w-9 h-9 shrink-0 rounded-full bg-secondary flex items-center justify-center">
      <svg
        className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        style={{ color: 'var(--foreground, #020618)' }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function AndamentoDisclosure({
  label,
  date,
  description,
  active = true,
  className,
}: {
  label: string
  date: string
  description?: string
  active?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const hasDescription = !!description
  const header = (
    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span style={titleStyle(active)}>{label}</span>
      <span style={captionStyle}>{date}</span>
    </div>
  )

  return (
    <div className={`flex flex-col gap-0.5 flex-1 min-w-0 ${className ?? ''}`}>
      {hasDescription ? (
        <button
          type="button"
          className="flex items-center justify-between w-full text-left gap-2 cursor-pointer"
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
        >
          {header}
          <AndamentoChevron open={open} />
        </button>
      ) : (
        header
      )}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open && hasDescription ? '200px' : '0px',
          opacity: open && hasDescription ? 1 : 0,
        }}
      >
        <p
          style={{ ...captionStyle, whiteSpace: 'pre-wrap' }}
          className="pt-0.5 pr-4"
        >
          {decodeHtmlEntities(description ?? '')}
        </p>
      </div>
    </div>
  )
}

interface TimelineItemProps {
  label: string
  date: string
  active: boolean
  isLast: boolean
  isPast: boolean
  showTrailingLine?: boolean
  description?: string
}

function TimelineItem({
  label,
  date,
  active,
  isLast,
  isPast,
  showTrailingLine = false,
  description,
}: TimelineItemProps) {
  const showLine = !isLast || showTrailingLine

  return (
    <div className="flex items-start gap-3">
      <div className="flex w-3 shrink-0 flex-col items-center self-stretch">
        <span
          aria-hidden
          className="mt-1 block shrink-0 rounded-full"
          style={{
            width: 12,
            height: 12,
            minWidth: 12,
            minHeight: 12,
            background: active
              ? 'var(--foreground-light, #71717B)'
              : 'var(--terciary, #D4D4D8)',
          }}
        />
        {showLine && (
          <div
            aria-hidden
            className="mt-1 min-h-2 flex-1"
            style={
              isPast
                ? {
                    width: '1.5px',
                    background: 'var(--foreground-light, #71717B)',
                    opacity: 0.4,
                  }
                : dottedLineStyle
            }
          />
        )}
      </div>
      <AndamentoDisclosure
        className="pb-4"
        label={label}
        date={date}
        description={description}
        active={active}
      />
    </div>
  )
}

const CLOSING_STATUS_LABEL: Record<string, string> = {
  'Fechado com solução': 'Fechado com solução',
  'Fechado com atendimento': 'Fechado com atendimento',
  'Problema não encontrado': 'Problema não encontrado',
  'Serviço inviável': 'Serviço inviável',
  'Informação fornecida': 'Informação fornecida',
}

interface Endereco {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cep: string
  pontoReferencia: string
  tipoEndereco: string
}

interface DetailData {
  protocolo: string
  servico: string
  macroStatus: RequestStatus
  dataAbertura: string
  dataUltimaAtualizacao: string
  previsaoSLA: string
  motivoFechamento: string
  descricao: string
  endereco: Endereco | null
  orgao: string
  categoria: string
  subcategoria: string
  origem: string
  andamentos: { evento: string; dataInsercao: string; descricao: string }[]
  isLoggedIn: boolean
  osId: string
  isAcessoInformacao: boolean
  canOpenRecurso: {
    available: boolean
    categoryId: string | null
    deadline: string | null
  } | null
  canOpenOuvidoria: {
    elogio: { available: boolean; categoryId: string | null } | null
    sugestao: { available: boolean; categoryId: string | null } | null
    reclamacao: { available: boolean; categoryId: string | null } | null
  } | null
  loadedAt?: string
  // não logado
  ultimoAndamento?: {
    evento: string
    dataInsercao: string
    descricao: string
  } | null
}

function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = d
    .toLocaleDateString('pt-BR', { month: 'short' })
    .toUpperCase()
    .replace('.', '')
  const year = d.getFullYear()
  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} ${month} ${year}, ${time}`
}

function StatusTimeline({ data }: { data: DetailData }) {
  const { macroStatus, dataAbertura, andamentos } = data

  const isFinal = macroStatus === 'Concluído' || macroStatus === 'Cancelado'

  // Se não há andamentos, mostra pelo menos o slot de abertura
  const items =
    andamentos.length > 0
      ? andamentos.map(a => ({
          label: a.evento,
          date: a.dataInsercao ? formatDateTime(a.dataInsercao) : dataAbertura,
          description: a.descricao || undefined,
        }))
      : [
          {
            label: macroStatus,
            date: dataAbertura,
            description: undefined,
          },
        ]

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <TimelineItem
            key={`${item.label}-${i}`}
            label={item.label}
            date={item.date}
            active={last}
            isLast={last}
            isPast={!last}
            showTrailingLine={last && !isFinal}
            description={item.description}
          />
        )
      })}
    </div>
  )
}

function PublicAndamento({ data }: { data: DetailData }) {
  const isFinal =
    data.macroStatus === 'Concluído' || data.macroStatus === 'Cancelado'

  return (
    <TimelineItem
      label={data.ultimoAndamento?.evento ?? data.macroStatus}
      date={
        data.ultimoAndamento?.dataInsercao
          ? formatDateTime(data.ultimoAndamento.dataInsercao)
          : data.dataAbertura
      }
      active
      isLast
      isPast={false}
      showTrailingLine={!isFinal}
      description={data.ultimoAndamento?.descricao || undefined}
    />
  )
}

function buildOuvidoriaPageUrl(
  protocolo: string,
  osId: string,
  canOpen: NonNullable<DetailData['canOpenOuvidoria']>
): string {
  const params = new URLSearchParams({ osId })
  if (canOpen.elogio?.available && canOpen.elogio.categoryId) {
    params.set('elogio', canOpen.elogio.categoryId)
  }
  if (canOpen.sugestao?.available && canOpen.sugestao.categoryId) {
    params.set('sugestao', canOpen.sugestao.categoryId)
  }
  if (canOpen.reclamacao?.available && canOpen.reclamacao.categoryId) {
    params.set('reclamacao', canOpen.reclamacao.categoryId)
  }
  return `/solicitacoes/${protocolo}/ouvidoria?${params.toString()}`
}

function OuvidoriaCard({
  protocolo,
  osId,
  canOpenOuvidoria,
}: {
  protocolo: string
  osId: string
  canOpenOuvidoria: NonNullable<DetailData['canOpenOuvidoria']>
}) {
  return (
    <SectionCard>
      <p className="text-sm text-foreground-light leading-5">
        Acesse nossa Ouvidoria para falar como foi o seu atendimento.
      </p>
      <Link
        href={buildOuvidoriaPageUrl(protocolo, osId, canOpenOuvidoria)}
        className="w-full rounded-full text-sm font-medium text-foreground cursor-pointer flex items-center justify-center px-6 py-4 bg-secondary hover:opacity-80 transition-opacity"
      >
        Ouvidoria
      </Link>
    </SectionCard>
  )
}

function buildRecursoLaiLink(categoryId: string | null, woId: string): string {
  const params = new URLSearchParams({ woId })
  if (categoryId) params.set('id', categoryId)
  return `${TICKET_FORM_BASE_URL}/lai/?${params.toString()}`
}

function RecursoCard({ href }: { href: string }) {
  return (
    <SectionCard>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">Recurso</p>
        <p className="text-sm text-foreground-light leading-5">
          Conteste uma resposta negativa, a falta de resposta ou uma resposta
          insatisfatória.
        </p>
      </div>
      <a
        href={href}
        className="w-full rounded-full text-sm font-medium text-foreground cursor-pointer flex items-center justify-center px-6 py-4 bg-secondary hover:opacity-80 transition-opacity"
      >
        Solicitar Recurso
      </a>
    </SectionCard>
  )
}

function RequestDetail({ data }: { data: DetailData }) {
  const { macroStatus } = data
  const [isCopied, setIsCopied] = useState(false)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastRef = useRef<string | null>(null)

  const handleCopyProtocolo = async () => {
    try {
      await navigator.clipboard.writeText(data.protocolo)
    } catch {
      return
    }
    // Cancela o timeout anterior — evita reset prematuro ao clicar várias vezes
    if (resetRef.current) clearTimeout(resetRef.current)
    setIsCopied(true)
    // Descarta toast anterior antes de mostrar novo
    if (toastRef.current) toast.dismiss(toastRef.current)
    toastRef.current = toast.success('Copiado!') as string
    resetRef.current = setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="text-foreground">
      <HeaderWrapperClient />
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Solicitações/Todos', href: '/minhas-solicitacoes' },
          { label: data.servico },
        ]}
      />
      <main className="max-w-4xl mx-auto pb-32 px-4 flex flex-col gap-2">
        <h1
          className="text-3xl font-medium text-card-foreground leading-9 mb-4 pt-2"
          style={{ letterSpacing: '-0.4px' }}
        >
          {data.servico}
        </h1>
        {data.loadedAt && (
          <p className="text-sm text-foreground-light -mt-2 mb-2">
            Dados atualizados em {data.loadedAt}
          </p>
        )}

        {/* Status + timeline */}
        <SectionCard>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={macroStatus} />
            <button
              type="button"
              onClick={handleCopyProtocolo}
              className="cursor-pointer active:opacity-70 transition-opacity"
              style={{
                display: 'flex',
                padding:
                  'var(--button-badge-v-padding, 2px) var(--button-badge-h-padding, 12px)',
                alignItems: 'center',
                gap: 'var(--button-badge-spacing, 4px)',
                borderRadius: 'var(--button-badge-radius-pill, 999px)',
                background: 'var(--secondary, #E4E4E7)',
                color: 'var(--foreground, #09090B)',
                fontFamily: 'var(--font-family-sans, "DM Sans")',
                fontSize: 'var(--font-size-xs, 12px)',
                fontWeight: 'var(--font-weight-normal, 400)',
                lineHeight: 'var(--font-leading-4, 16px)',
                letterSpacing: 'var(--font-tracking-normal, 0)',
              }}
            >
              {data.protocolo}
              {isCopied && (
                <svg
                  className="w-3 h-3 text-green-600 animate-in zoom-in-50 duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </div>
          {data.isLoggedIn ? (
            <StatusTimeline data={data} />
          ) : (
            <PublicAndamento data={data} />
          )}
        </SectionCard>

        {/* Dates — logado e deslogado, 2 cards side by side */}
        {(data.dataAbertura || data.previsaoSLA) && (
          <div className="flex gap-2">
            {data.dataAbertura && (
              <div
                className="flex flex-col gap-0.5 rounded-2xl p-5"
                style={{
                  background: 'var(--card, #F1F1F4)',
                  flex: data.previsaoSLA ? '1' : '1 1 100%',
                }}
              >
                <span className="text-sm font-normal leading-5 text-foreground-light">
                  Data de abertura
                </span>
                <span className="text-sm font-normal leading-5 text-foreground">
                  {data.dataAbertura}
                </span>
              </div>
            )}
            {data.previsaoSLA && (
              <div
                className="flex flex-col gap-0.5 flex-1 rounded-2xl p-5"
                style={{ background: 'var(--card, #F1F1F4)' }}
              >
                <span className="text-sm font-normal leading-5 text-foreground-light">
                  Prazo limite
                </span>
                <span className="text-sm font-normal leading-5 text-foreground">
                  {data.previsaoSLA}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recurso LAI — só logado, pedido LAI elegível */}
        {data.isLoggedIn &&
          data.isAcessoInformacao &&
          data.canOpenRecurso?.available === true && (
            <RecursoCard
              href={buildRecursoLaiLink(
                data.canOpenRecurso.categoryId,
                data.osId
              )}
            />
          )}

        {/* Ouvidoria — só logado, SF liberou ao menos um tipo */}
        {data.isLoggedIn &&
          data.canOpenOuvidoria &&
          [
            data.canOpenOuvidoria.elogio,
            data.canOpenOuvidoria.sugestao,
            data.canOpenOuvidoria.reclamacao,
          ].some(t => t?.available === true) && (
            <OuvidoriaCard
              protocolo={data.protocolo}
              osId={data.osId}
              canOpenOuvidoria={data.canOpenOuvidoria}
            />
          )}

        {/* Description — só logado */}
        {data.isLoggedIn && data.descricao && (
          <SectionCard className="min-w-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-normal leading-5 tracking-normal text-foreground-light">
                Descrição
              </span>
              <p className="text-sm font-normal leading-5 tracking-normal text-foreground whitespace-pre-wrap wrap-break-word min-w-0">
                {decodeHtmlEntities(data.descricao)}
              </p>
            </div>
          </SectionCard>
        )}

        {/* Endereço compacto — só deslogado, acima de Informações Gerais */}
        {!data.isLoggedIn &&
          data.endereco &&
          (() => {
            const enderecoStr = [
              data.endereco.logradouro,
              data.endereco.numero,
              data.endereco.bairro,
            ]
              .filter(v => v && v !== '—')
              .join(', ')
            if (!enderecoStr) return null
            return (
              <div className="bg-card rounded-2xl px-4 py-3 flex flex-col gap-0.5">
                <span className="text-sm font-normal leading-5 text-foreground-light">
                  Endereço
                </span>
                <span className="text-sm font-normal leading-5 text-foreground">
                  {enderecoStr}
                </span>
              </div>
            )
          })()}

        {/* General info */}
        <SectionCard>
          <h2 className="text-base font-medium leading-5 text-foreground">
            Informações Gerais
          </h2>
          <InfoBlock label="Protocolo" value={data.protocolo} />
          {data.categoria && data.categoria !== '—' && (
            <InfoBlock label="Categoria" value={data.categoria} />
          )}
          {data.subcategoria && data.subcategoria !== '—' && (
            <InfoBlock label="Subcategoria" value={data.subcategoria} />
          )}
          {data.orgao && data.orgao !== '—' && (
            <InfoBlock label="Órgão" value={data.orgao} />
          )}
          {data.isLoggedIn && data.origem && data.origem !== '—' && (
            <InfoBlock label="Origem do chamado" value={data.origem} />
          )}
        </SectionCard>

        {/* Localização completa — só logado */}
        {data.isLoggedIn &&
          data.endereco &&
          (() => {
            const enderecoStr = [
              data.endereco.logradouro,
              data.endereco.numero,
              data.endereco.complemento,
              data.endereco.bairro,
              data.endereco.cep,
            ]
              .filter(v => v && v !== '—')
              .join(', ')
            const pontoRef =
              data.endereco.pontoReferencia &&
              data.endereco.pontoReferencia !== '—'
                ? data.endereco.pontoReferencia
                : ''
            const tipoEnd =
              data.endereco.tipoEndereco && data.endereco.tipoEndereco !== '—'
                ? data.endereco.tipoEndereco
                : ''
            if (!enderecoStr && !pontoRef && !tipoEnd) return null
            return (
              <SectionCard>
                <h2 className="text-base font-medium leading-5 text-foreground">
                  Localização
                </h2>
                {enderecoStr && (
                  <InfoBlock label="Endereço" value={enderecoStr} />
                )}
                {pontoRef && (
                  <InfoBlock label="Ponto de referência" value={pontoRef} />
                )}
                {tipoEnd && (
                  <InfoBlock label="Tipo de endereço" value={tipoEnd} />
                )}
              </SectionCard>
            )
          })()}
      </main>

      <FloatNavigationWrapper />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="text-foreground">
      <HeaderWrapperClient />
      <BreadcrumbSkeleton />
      <main className="max-w-4xl mx-auto pb-32 px-4 flex flex-col gap-4">
        <Skeleton className="h-9 w-3/4" />

        <Skeleton className="rounded-2xl h-48" />

        <div className="flex gap-3">
          <Skeleton className="rounded-2xl h-20 flex-1" />
          <Skeleton className="rounded-2xl h-20 flex-1" />
        </div>

        <Skeleton className="rounded-2xl h-40" />
        <Skeleton className="rounded-2xl h-32" />
      </main>

      <FloatNavigationWrapper />
    </div>
  )
}

function ErrorState({ protocolo }: { protocolo: string }) {
  return (
    <div className="text-foreground">
      <HeaderWrapperClient />
      <Breadcrumb
        items={[
          { label: 'Página inicial', href: '/' },
          { label: 'Solicitações/Todos', href: '/minhas-solicitacoes' },
          { label: `Protocolo ${protocolo}` },
        ]}
      />
      <main className="max-w-4xl mx-auto pb-32 px-4 flex flex-col items-center justify-center text-center gap-2 pt-10">
        <p className="text-foreground-light text-sm">
          Protocolo {protocolo} não encontrado.
        </p>
      </main>
      <FloatNavigationWrapper />
    </div>
  )
}

type Ordem = Record<string, any>

/** Escolhe a OS pedida em `?os=`; sem ela (ou sem achar), a primeira. */
function escolherOrdem(ordens: Ordem[], codigoOs: string | null): Ordem {
  if (codigoOs) {
    return ordens.find(o => o.codigoOs === codigoOs) ?? ordens[0]
  }
  return ordens[0]
}

function mapearOpcaoOuvidoria(
  opcao: { available?: boolean; categoryId?: string | null } | null | undefined
) {
  if (!opcao) return null
  return {
    available: opcao.available ?? false,
    categoryId: opcao.categoryId ?? null,
  }
}

function mapearTitular(json: ChamadoJson, codigoOs: string | null): DetailData {
  const os = escolherOrdem(json.ordens_de_servico ?? [], codigoOs)
  const andamentos = (os?.andamentos ?? [])
    .filter((a: { tipoEvento?: string }) => a.tipoEvento !== 'Transfer_WO')
    .map(
      (a: { evento?: string; dataInsercao?: string; descricao?: string }) => ({
        evento: a.evento ?? '—',
        dataInsercao: a.dataInsercao ?? '',
        descricao: decodeHtmlEntities(a.descricao ?? ''),
      })
    )

  return {
    protocolo: json.protocolo,
    servico: os?.servico ?? os?.subtema ?? '—',
    macroStatus: normalizeStatus(os?.status ?? json.status),
    dataAbertura: os?.dataAbertura
      ? formatDate(os.dataAbertura)
      : json.dataAbertura
        ? formatDate(json.dataAbertura)
        : '',
    dataUltimaAtualizacao: json.dataUltimaAtualizacao
      ? formatDateTime(json.dataUltimaAtualizacao)
      : '',
    previsaoSLA: os?.previsaoSLA ? formatDate(os.previsaoSLA) : '',
    motivoFechamento: os?.motivoFechamento ?? '',
    descricao: os?.descricao ?? '',
    endereco: os?.endereco ?? null,
    orgao: os?.orgaoResponsavel?.nome ?? os?.orgaoResponsavelPai?.nome ?? '',
    categoria: os?.subtema ?? os?.categoria ?? 'Serviço',
    subcategoria: os?.servico ?? '',
    origem: json.origem ?? '',
    andamentos,
    isLoggedIn: true,
    osId: os?.id ?? '',
    isAcessoInformacao: os?.isAcessoInformacao ?? false,
    canOpenRecurso: os?.canOpen?.recurso ?? null,
    loadedAt: json.loaded_at ? formatDateTime(json.loaded_at) : undefined,
    canOpenOuvidoria: os?.canOpen
      ? {
          elogio: mapearOpcaoOuvidoria(os.canOpen.elogio),
          sugestao: mapearOpcaoOuvidoria(os.canOpen.sugestao),
          reclamacao: mapearOpcaoOuvidoria(os.canOpen.reclamacao),
        }
      : null,
  }
}

function mapearPublico(json: ChamadoJson, codigoOs: string | null): DetailData {
  const os = escolherOrdem(json.ordens_de_servico ?? [], codigoOs)
  const ultimo = os?.ultimoAndamento
    ? {
        evento: os.ultimoAndamento.evento ?? '',
        dataInsercao: os.ultimoAndamento.dataInsercao ?? '',
        descricao: decodeHtmlEntities(os.ultimoAndamento.descricao ?? ''),
      }
    : null

  return {
    protocolo: json.protocolo,
    servico: os?.servico ?? '—',
    macroStatus: normalizeStatus(os?.status ?? json.status),
    dataAbertura: os?.dataAbertura
      ? formatDate(os.dataAbertura)
      : json.dataAbertura
        ? formatDate(json.dataAbertura)
        : '',
    dataUltimaAtualizacao: '',
    previsaoSLA: '',
    motivoFechamento: '',
    descricao: '',
    endereco: os?.endereco ?? null,
    orgao: os?.orgaoResponsavel?.nome ?? '',
    categoria: os?.subtema ?? '',
    subcategoria: os?.servico ?? '',
    origem: '',
    andamentos: [],
    isLoggedIn: false,
    osId: '',
    isAcessoInformacao: false,
    canOpenRecurso: null,
    canOpenOuvidoria: null,
    loadedAt: json.loaded_at ? formatDateTime(json.loaded_at) : undefined,
    ultimoAndamento: ultimo,
  }
}

export default function RequestDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const protocolo = params.id as string
  const codigoOs = searchParams.get('os')

  // O cache guarda o payload do BFF por protocolo; a OS de `?os=` só escolhe
  // qual ordem mostrar, então trocar de OS não refaz a requisição.
  const { data: detalhe, isPending } = useChamadoDetalhe(protocolo)
  const data = useMemo(() => {
    if (!detalhe) return null
    return detalhe.visao === 'titular'
      ? mapearTitular(detalhe.data, codigoOs)
      : mapearPublico(detalhe.data, codigoOs)
  }, [detalhe, codigoOs])

  if (isPending) return <LoadingState />
  if (!data) return <ErrorState protocolo={protocolo} />
  return <RequestDetail data={data} />
}
