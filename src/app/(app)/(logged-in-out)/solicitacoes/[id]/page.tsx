'use client'

import { StatusBadge } from '@/app/(app)/(logged-in)/minhas-solicitacoes/components/status-badge'
import { MOCK_REQUESTS } from '@/app/(app)/(logged-in)/minhas-solicitacoes/mock-data'
import type {
  RequestHistoryEntry,
  RequestStatus,
} from '@/app/(app)/(logged-in)/minhas-solicitacoes/types'
import { FloatNavigationWrapper } from '@/app/components/float-navigation-wrapper'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { notFound, useParams } from 'next/navigation'

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
  isLast,
}: {
  entry: RequestHistoryEntry
  isLast: boolean
}) {
  return (
    <div className="flex gap-3">
      {/* timeline col */}
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

export default function RequestDetailPage() {
  const params = useParams()
  const request = MOCK_REQUESTS.find(r => r.id === params.id)

  if (!request) {
    notFound()
  }

  return (
    <div className="max-w-4xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader route="/minhas-solicitacoes" />

      <div className="pt-24 pb-32 px-4 flex flex-col gap-4">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground leading-tight">
          {request.title}
        </h1>

        {/* History card: badge + protocol + timeline */}
        <SectionCard>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={request.status} />
            <span className="text-xs text-foreground-light bg-background border border-border rounded-full px-3 py-0.5">
              {request.protocol}
            </span>
          </div>
          {request.history.map((entry, i) => (
            <HistoryItem
              key={i}
              entry={entry}
              isLast={i === request.history.length - 1}
            />
          ))}
        </SectionCard>

        {/* Dates */}
        <SectionCard>
          <div className="grid grid-cols-2 gap-4">
            <InfoBlock label="Data de abertura" value={request.date} />
            <InfoBlock label="Prazo limite" value={request.deadline} />
          </div>
        </SectionCard>

        {/* Description */}
        <SectionCard>
          <InfoBlock label="Descrição" value={request.description} />
        </SectionCard>

        {/* Address */}
        <SectionCard>
          <InfoBlock label="Endereço" value={request.address} />
        </SectionCard>

        {/* General info */}
        <SectionCard>
          <h2 className="text-base font-semibold text-foreground mb-1">
            Informações Gerais
          </h2>
          <InfoBlock label="Protocolo" value={request.protocol} />
          <InfoBlock label="Categoria" value={request.category} />
          <InfoBlock label="Subcategoria" value={request.subcategory} />
          <InfoBlock label="Órgão" value={request.organ} />
          <InfoBlock label="Origem do chamado" value={request.origin} />
        </SectionCard>
      </div>

      <FloatNavigationWrapper />
    </div>
  )
}
