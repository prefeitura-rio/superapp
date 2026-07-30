'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import {
  formatDate,
  normalizeStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/helpers'
import type { RequestHistoryEntry } from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-foreground-light">{label}</span>
      <span className="text-sm text-card-foreground">{value}</span>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-4 flex flex-col gap-3">
      {children}
    </div>
  )
}

function HistoryItem({
  entry,
}: {
  entry: RequestHistoryEntry
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1 self-stretch">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-foreground-light" />
        <div
          className="mt-1 flex-1 w-px"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, var(--foreground-light) 0px, var(--foreground-light) 4px, transparent 4px, transparent 8px)',
            opacity: 0.4,
          }}
        />
      </div>
      <div className="flex flex-col gap-0.5 pb-4">
        <span className="text-sm font-semibold text-card-foreground">
          {entry.status}
        </span>
        <span className="text-xs text-foreground-light">
          {entry.date}, {entry.time}
        </span>
        <span className="text-xs text-foreground-light mt-1">
          {entry.description}
        </span>
      </div>
    </div>
  )
}

interface DetailData {
  protocolo: string
  servico: string
  status: string
  dataAbertura: string
  deadline: string
  descricao: string
  endereco: string
  orgao: string
  categoria: string
  subcategoria: string
  origem: string
  history: RequestHistoryEntry[]
  isLoggedIn: boolean
}

function RequestDetail({ data }: { data: DetailData }) {
  const normalizedStatus = normalizeStatus(data.status)

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader route="/minhas-solicitacoes" />

      <div className="pt-24 pb-32 px-4 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground leading-tight">
          {data.servico}
        </h1>

        {/* History card */}
        <SectionCard>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={normalizedStatus} />
            <span className="text-xs text-foreground-light bg-background border border-border rounded-full px-3 py-0.5">
              {data.protocolo}
            </span>
          </div>
          {data.history.map((entry, i) => (
            <HistoryItem key={i} entry={entry} />
          ))}
        </SectionCard>

        {/* Dates */}
        <SectionCard>
          <div className="grid grid-cols-2 gap-4">
            <InfoBlock label="Data de abertura" value={data.dataAbertura} />
            {data.deadline && (
              <InfoBlock label="Prazo limite" value={data.deadline} />
            )}
          </div>
        </SectionCard>

        {/* Description — só logado */}
        {data.isLoggedIn && data.descricao && (
          <SectionCard>
            <InfoBlock label="Descrição" value={data.descricao} />
          </SectionCard>
        )}

        {/* Address */}
        {data.endereco && (
          <SectionCard>
            <InfoBlock label="Endereço" value={data.endereco} />
          </SectionCard>
        )}

        {/* General info */}
        <SectionCard>
          <h2 className="text-base font-semibold text-foreground mb-1">
            Informações Gerais
          </h2>
          <InfoBlock label="Protocolo" value={data.protocolo} />
          {data.categoria && (
            <InfoBlock label="Categoria" value={data.categoria} />
          )}
          {data.subcategoria && (
            <InfoBlock label="Subcategoria" value={data.subcategoria} />
          )}
          {data.orgao && <InfoBlock label="Órgão" value={data.orgao} />}
          {data.isLoggedIn && data.origem && (
            <InfoBlock label="Origem do chamado" value={data.origem} />
          )}
        </SectionCard>
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader route="/minhas-solicitacoes" />
      <div className="pt-24 pb-32 px-4 flex flex-col gap-4 animate-pulse">
        <div className="h-8 bg-card rounded-xl w-3/4" />
        <div className="bg-card rounded-2xl p-4 h-32" />
        <div className="bg-card rounded-2xl p-4 h-20" />
        <div className="bg-card rounded-2xl p-4 h-48" />
      </div>
      <FloatNavigationWrapper />
    </div>
  )
}

function ErrorState({ protocolo }: { protocolo: string }) {
  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader route="/minhas-solicitacoes" />
      <div className="pt-24 pb-32 px-4 flex flex-col items-center justify-center text-center gap-2">
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
  const protocolo = params.id as string

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
            const os = json.ordens_de_servico?.[0]
            const history: RequestHistoryEntry[] = (os?.andamentos ?? []).map(
              (a: {
                evento?: string
                dataInsercao?: string
                descricao?: string
              }) => ({
                status: a.evento ?? '—',
                date: formatDate(a.dataInsercao),
                time: a.dataInsercao
                  ? new Date(a.dataInsercao).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '',
                description: a.descricao ?? '',
              })
            )
            if (history.length === 0) {
              history.push({
                status: normalizeStatus(json.status),
                date: formatDate(json.dataAbertura),
                time: json.dataAbertura
                  ? new Date(json.dataAbertura).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '',
                description: 'Solicitação registrada.',
              })
            }
            setData({
              protocolo: json.protocolo,
              servico: os?.servico ?? os?.subtema ?? '—',
              status: os?.status ?? json.status ?? '',
              dataAbertura: formatDate(json.dataAbertura),
              deadline: formatDate(os?.previsaoSLA),
              descricao: os?.descricao ?? '',
              endereco: os?.endereco
                ? [os.endereco.logradouro, os.endereco.bairro]
                    .filter(Boolean)
                    .join(', ')
                : '',
              orgao: os?.orgaoResponsavel ?? os?.orgaoResponsavelPai ?? '',
              categoria: os?.subtema ?? '',
              subcategoria: os?.servico ?? '',
              origem: json.origem ?? '',
              history,
              isLoggedIn: true,
            })
            setLoading(false)
            return
          }
        }
      } catch {
        // não logado ou erro — tenta público
      }

      // Fallback: consulta pública
      try {
        const res = await fetch(`/api/chamados-publico/${protocolo}`)
        if (res.ok) {
          const json = await res.json()
          const os = json.ordens_de_servico?.[0]
          const ultimo = os?.ultimoAndamento
          const history: RequestHistoryEntry[] = ultimo
            ? [
                {
                  status: ultimo.evento ?? normalizeStatus(ultimo.status),
                  date: formatDate(ultimo.dataInsercao),
                  time: ultimo.dataInsercao
                    ? new Date(ultimo.dataInsercao).toLocaleTimeString(
                        'pt-BR',
                        { hour: '2-digit', minute: '2-digit' }
                      )
                    : '',
                  description: ultimo.descricao ?? '',
                },
              ]
            : [
                {
                  status: normalizeStatus(json.status),
                  date: formatDate(json.dataAbertura),
                  time: '',
                  description: 'Solicitação registrada.',
                },
              ]
          setData({
            protocolo: json.protocolo,
            servico: os?.servico ?? '—',
            status: os?.status ?? json.status ?? '',
            dataAbertura: formatDate(json.dataAbertura),
            deadline: '',
            descricao: '',
            endereco: os?.endereco
              ? [os.endereco.logradouro, os.endereco.bairro]
                  .filter(Boolean)
                  .join(', ')
              : '',
            orgao: os?.orgaoResponsavel ?? os?.orgaoResponsavelPai ?? '',
            categoria: os?.subtema ?? '',
            subcategoria: os?.servico ?? '',
            origem: '',
            history,
            isLoggedIn: false,
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
  }, [protocolo])

  if (loading) return <LoadingState />
  if (notFound || !data) return <ErrorState protocolo={protocolo} />
  return <RequestDetail data={data} />
}
