'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import { normalizeStatus } from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import type { RequestStatus } from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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

interface TimelineItemProps {
  label: string
  date: string
  active: boolean
  isLast: boolean
  isPast: boolean
  description?: string
}

function TimelineItem({
  label,
  date,
  active,
  isLast,
  isPast,
  description,
}: TimelineItemProps) {
  const [open, setOpen] = useState(false)

  const captionStyle: React.CSSProperties = {
    color: 'var(--foreground-light, #71717B)',
    fontFamily: 'var(--font-family-sans, "DM Sans")',
    fontSize: 'var(--font-size-xs, 12px)',
    fontWeight: 'var(--font-weight-normal, 400)',
    lineHeight: 'var(--font-leading-4, 16px)',
    letterSpacing: 'var(--font-tracking-normal, 0)',
  }

  const titleStyle: React.CSSProperties = {
    color: active
      ? 'var(--card-foreground, #020618)'
      : 'var(--foreground-light, #71717B)',
    fontFamily: 'var(--font-family-sans, "DM Sans")',
    fontSize: 'var(--font-size-sm, 14px)',
    fontWeight: 'var(--font-weight-medium, 500)',
    lineHeight: 'var(--font-leading-4, 16px)',
    letterSpacing: 'var(--font-tracking-normal, 0)',
  }

  return (
    <div className="flex gap-3 relative">
      {/* Coluna esquerda: bolinha + linha até o próximo item */}
      <div className="flex flex-col items-center" style={{ width: '12px' }}>
        <div
          className="w-3 h-3 rounded-full shrink-0 z-10 relative"
          style={{
            marginTop: '2px',
            background: active
              ? 'var(--foreground-light, #71717B)'
              : 'var(--terciary, #D4D4D8)',
          }}
        />
        {!isLast && (
          <div
            className="flex-1"
            style={{
              width: '1.5px',
              marginBottom: '-2px',
              ...(isPast
                ? {
                    background: 'var(--foreground-light, #71717B)',
                    opacity: 0.4,
                  }
                : {
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, var(--foreground-light) 0px, var(--foreground-light) 3px, transparent 3px, transparent 6px)',
                    opacity: 0.4,
                  }),
            }}
          />
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pb-4">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left gap-2 cursor-pointer"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span style={titleStyle}>{label}</span>
            <span style={captionStyle}>{date}</span>
          </div>
          {description && (
            <svg
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              style={{ color: 'var(--foreground-light, #71717B)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: open && description ? '200px' : '0px',
            opacity: open && description ? 1 : 0,
          }}
        >
          <p style={captionStyle} className="pt-0.5 pr-4">
            {description}
          </p>
        </div>
      </div>
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
  const {
    macroStatus,
    dataAbertura,
    dataUltimaAtualizacao,
    previsaoSLA,
    motivoFechamento,
    andamentos,
  } = data

  const isAberto = macroStatus === 'Aberto'
  const isEmAndamento = macroStatus === 'Em andamento'
  const isConcluido = macroStatus === 'Concluído'
  const isCancelado = macroStatus === 'Cancelado'

  const showEmAndamento = isEmAndamento || isConcluido || isCancelado
  const showTerceiro =
    isConcluido || isCancelado || !!(previsaoSLA && (isAberto || isEmAndamento))

  const aberturaAndamento = andamentos[0]
  const progressoAndamento = andamentos.find(a => a !== aberturaAndamento)

  let terceiroLabel = ''
  let terceiroDate = ''
  let terceiroDescription: string | undefined

  if (isAberto || isEmAndamento) {
    terceiroLabel = 'Prazo Estimado'
    terceiroDate = previsaoSLA
  } else if (isConcluido) {
    terceiroLabel = CLOSING_STATUS_LABEL[motivoFechamento] ?? 'Concluído'
    terceiroDate = dataUltimaAtualizacao
    terceiroDescription = progressoAndamento?.descricao
  } else if (isCancelado) {
    terceiroLabel = 'Solicitação cancelada'
    terceiroDate = dataUltimaAtualizacao
  }

  const items = [
    {
      label: 'Aberto',
      date: dataAbertura || dataUltimaAtualizacao,
      active: isAberto,
      description: aberturaAndamento?.descricao,
    },
    ...(showEmAndamento
      ? [
          {
            label: 'Em andamento',
            date: dataUltimaAtualizacao,
            active: isEmAndamento,
            description: progressoAndamento?.descricao,
          },
        ]
      : []),
    ...(showTerceiro
      ? [
          {
            label: terceiroLabel,
            date: terceiroDate,
            active: isConcluido || isCancelado,
            description: terceiroDescription,
          },
        ]
      : []),
  ]

  const activeIndex = items.findLastIndex(item => item.active)

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <TimelineItem
          key={item.label}
          label={item.label}
          date={item.date}
          active={item.active}
          isLast={i === items.length - 1}
          isPast={i < activeIndex}
          description={item.description}
        />
      ))}
    </div>
  )
}

const dottedLineStyle: React.CSSProperties = {
  width: '1.5px',
  backgroundImage:
    'repeating-linear-gradient(to bottom, var(--foreground-light) 0px, var(--foreground-light) 3px, transparent 3px, transparent 6px)',
  opacity: 0.4,
}

function PublicAndamento({ data }: { data: DetailData }) {
  const [open, setOpen] = useState(false)
  const isFinal =
    data.macroStatus === 'Concluído' || data.macroStatus === 'Cancelado'
  const hasDescription = !!data.ultimoAndamento?.descricao

  const captionStyle: React.CSSProperties = {
    color: 'var(--foreground-light, #71717B)',
    fontFamily: 'var(--font-family-sans, "DM Sans")',
    fontSize: 'var(--font-size-xs, 12px)',
    fontWeight: 'var(--font-weight-normal, 400)',
    lineHeight: 'var(--font-leading-4, 16px)',
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center" style={{ width: '12px' }}>
        {isFinal && <div className="flex-1" style={dottedLineStyle} />}
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{
            marginTop: '2px',
            background: 'var(--foreground-light, #71717B)',
          }}
        />
        {!isFinal && <div className="flex-1" style={dottedLineStyle} />}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pb-1">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left gap-2 cursor-pointer"
          aria-expanded={open}
          onClick={() => hasDescription && setOpen(o => !o)}
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span
              style={{
                color: 'var(--card-foreground, #020618)',
                fontFamily: 'var(--font-family-sans, "DM Sans")',
                fontSize: 'var(--font-size-sm, 14px)',
                fontWeight: 'var(--font-weight-medium, 500)',
                lineHeight: 'var(--font-leading-4, 16px)',
              }}
            >
              {data.ultimoAndamento?.evento ?? data.macroStatus}
            </span>
            <span style={captionStyle}>
              {data.ultimoAndamento?.dataInsercao
                ? formatDateTime(data.ultimoAndamento.dataInsercao)
                : data.dataAbertura}
            </span>
          </div>
          {hasDescription && (
            <svg
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              style={{ color: 'var(--foreground-light, #71717B)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: open && hasDescription ? '200px' : '0px',
            opacity: open && hasDescription ? 1 : 0,
          }}
        >
          <p style={captionStyle} className="pt-0.5 pr-4">
            {data.ultimoAndamento?.descricao}
          </p>
        </div>
      </div>
    </div>
  )
}

function OuvidoriaCard() {
  return (
    <SectionCard>
      <p className="text-sm text-foreground-light leading-5">
        Sua voz é importante para melhorarmos os serviços da cidade. Acesse
        nossa Ouvidoria e avalie seu atendimento.
      </p>
      <button
        type="button"
        className="w-full rounded-full text-sm font-medium text-foreground cursor-pointer flex items-center justify-center px-6 py-4 bg-secondary hover:opacity-80 transition-opacity"
      >
        Ouvidoria
      </button>
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
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader
        route="/minhas-solicitacoes"
        style={{ paddingTop: '24px', paddingBottom: '24px' }}
      />

      <div className="pt-[100px] pb-32 px-4 flex flex-col gap-2">
        <h1
          className="text-3xl font-medium text-card-foreground leading-9 mb-4"
          style={{ letterSpacing: '-0.4px' }}
        >
          {data.servico}
        </h1>

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
                color: 'var(--zinc-900, #18181B)',
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

        {/* Ouvidoria — só logado e concluído */}
        {data.isLoggedIn && macroStatus === 'Concluído' && <OuvidoriaCard />}

        {/* Description — só logado */}
        {data.isLoggedIn && data.descricao && (
          <SectionCard>
            <InfoBlock label="Descrição" value={data.descricao} />
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
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader
        route="/minhas-solicitacoes"
        style={{ paddingTop: '24px', paddingBottom: '24px' }}
      />

      <div className="pt-[100px] pb-32 px-4 flex flex-col gap-4">
        <Skeleton className="h-9 w-3/4" />

        <Skeleton className="rounded-2xl h-48" />

        <div className="flex gap-3">
          <Skeleton className="rounded-2xl h-20 flex-1" />
          <Skeleton className="rounded-2xl h-20 flex-1" />
        </div>

        <Skeleton className="rounded-2xl h-40" />
        <Skeleton className="rounded-2xl h-32" />
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}

function ErrorState({ protocolo }: { protocolo: string }) {
  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader
        route="/minhas-solicitacoes"
        style={{ paddingTop: '24px', paddingBottom: '24px' }}
      />
      <div className="pt-[100px] pb-32 px-4 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-foreground-light text-sm">
          Protocolo {protocolo} não encontrado.
        </p>
      </div>
      <FloatNavigationWrapper />
    </div>
  )
}

export default function RequestDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const protocolo = params.id as string
  const codigoOs = searchParams.get('os')

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Tenta autenticado primeiro
      try {
        const res = await fetch(`/api/chamados/${protocolo}`)
        if (res.ok) {
          const json = await res.json()
          if (json.protocolo) {
            const ordens = json.ordens_de_servico ?? []
            const os = codigoOs
              ? (ordens.find(
                  (o: { codigoOs?: string }) => o.codigoOs === codigoOs
                ) ?? ordens[0])
              : ordens[0]
            const andamentos = (os?.andamentos ?? [])
              .filter(
                (a: { tipoEvento?: string }) => a.tipoEvento !== 'Transfer_WO'
              )
              .map(
                (a: {
                  evento?: string
                  dataInsercao?: string
                  descricao?: string
                }) => ({
                  evento: a.evento ?? '—',
                  dataInsercao: a.dataInsercao ?? '',
                  descricao: a.descricao ?? '',
                })
              )

            setData({
              protocolo: json.protocolo,
              servico: os?.servico ?? os?.subtema ?? '—',
              macroStatus: normalizeStatus(os?.status ?? json.status),
              dataAbertura: json.dataAbertura
                ? formatDateTime(json.dataAbertura)
                : '',
              dataUltimaAtualizacao: json.dataUltimaAtualizacao
                ? formatDateTime(json.dataUltimaAtualizacao)
                : '',
              previsaoSLA: os?.previsaoSLA
                ? formatDateTime(os.previsaoSLA)
                : '',
              motivoFechamento: os?.motivoFechamento ?? '',
              descricao: os?.descricao ?? '',
              endereco: os?.endereco ?? null,
              orgao:
                os?.orgaoResponsavel?.nome ??
                os?.orgaoResponsavelPai?.nome ??
                '',
              categoria: os?.subtema ?? '',
              subcategoria: os?.servico ?? '',
              origem: json.origem ?? '',
              andamentos,
              isLoggedIn: true,
            })
            setLoading(false)
            return
          }
        }
      } catch {
        // erro de rede — tenta público
      }

      // Fallback: consulta pública
      try {
        const res = await fetch(`/api/chamados-publico/${protocolo}`)
        if (res.ok) {
          const json = await res.json()
          const ordens = json.ordens_de_servico ?? []
          const os = codigoOs
            ? (ordens.find(
                (o: { codigoOs?: string }) => o.codigoOs === codigoOs
              ) ?? ordens[0])
            : ordens[0]
          const ultimo = os?.ultimoAndamento
            ? {
                evento: os.ultimoAndamento.evento ?? '',
                dataInsercao: os.ultimoAndamento.dataInsercao ?? '',
                descricao: os.ultimoAndamento.descricao ?? '',
              }
            : null

          setData({
            protocolo: json.protocolo,
            servico: os?.servico ?? '—',
            macroStatus: normalizeStatus(os?.status ?? json.status),
            dataAbertura: json.dataAbertura
              ? formatDateTime(json.dataAbertura)
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
            ultimoAndamento: ultimo,
          })
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      }

      setLoading(false)
    }

    load()
  }, [protocolo, codigoOs])

  if (loading) return <LoadingState />
  if (notFound || !data) return <ErrorState protocolo={protocolo} />
  return <RequestDetail data={data} />
}
