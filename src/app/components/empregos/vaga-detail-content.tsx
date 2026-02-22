'use client'

import { EtapasProcessoSeletivoCard } from '@/app/components/empregos/etapas-processo-seletivo-card'
import type { VagaBadge } from '@/app/components/empregos/vaga-card'
import { VagaParceriaCard } from '@/app/components/empregos/vaga-parceria-card'
import { MarkdownRenderer } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/components/markdown-renderer'
import { MapPinIcon } from '@/assets/icons'
import { ChevronLeftIcon, ChevronRightIcon, ShareIcon } from '@/assets/icons'
import { buildAuthUrl } from '@/constants/url'
import type { VagaDetail } from '@/lib/emprego-utils'
import { Accessibility, Briefcase, DollarSign, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface VagaDetailContentProps {
  vaga: VagaDetail
  isLoggedIn: boolean
  /** Indica se o usuário já se candidatou a esta vaga */
  hasCandidatura?: boolean
}

function DetailBadgeIcon({ type }: { type: VagaBadge['type'] }) {
  if (!type) return <FileText className="h-3.5 w-3.5 shrink-0" />
  switch (type) {
    case 'modality':
      return <Briefcase className="h-3.5 w-3.5 shrink-0" />
    case 'bairro':
      return <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
    case 'salary':
      return <DollarSign className="h-3.5 w-3.5 shrink-0" />
    case 'acessivel_pcd':
    case 'preferencial_pcd':
      return <Accessibility className="h-3.5 w-3.5 shrink-0" />
    default:
      return <FileText className="h-3.5 w-3.5 shrink-0" />
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 text-sm font-normal leading-5 first:pt-0 last:pb-0">
      <span className="shrink-0 text-foreground-light">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  )
}

function SectionBlock({
  title,
  content,
  className,
}: {
  title: string
  content: string
  className?: string
}) {
  if (!content?.trim()) return null
  return (
    <section className="pt-6">
      <h3 className="text-sm font-normal leading-5 text-foreground">{title}</h3>
      <MarkdownRenderer
        content={content}
        className={className ?? 'text-foreground-light text-sm leading-5 font-normal'}
      />
    </section>
  )
}

export function VagaDetailContent({
  vaga,
  isLoggedIn,
  hasCandidatura = false,
}: VagaDetailContentProps) {
  const router = useRouter()
  const hasEtapas = (vaga.etapasProcessoSeletivo?.length ?? 0) > 0

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: vaga.titulo,
          text: `${vaga.titulo} - ${vaga.empresaNome}`,
          url: window.location.href,
        })
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard?.writeText(window.location.href)
    }
  }

  const candidacyButtonClassName =
    'bg-[#3E5782] hover:bg-[#3E5782]/90 text-white border-0 rounded-full'

  return (
    <div className="max-w-4xl mx-auto text-foreground">
      {/* Capa: colada no topo, sem padding externo, borda apenas embaixo */}
      <header className="bg-[#3E5782] rounded-b-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full w-11 h-11 bg-black/5 text-white hover:bg-black/20 hover:cursor-pointer transition-colors"
            aria-label="Voltar"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center rounded-full w-11 h-11  text-white hover:cursor-pointer"
            aria-label="Compartilhar"
          >
            <ShareIcon className="h-5 w-5 text-white" />
          </button>
        </div>
        <h1 className="text-3xl leading-9 font-medium text-white mt-12">
          {vaga.titulo}
        </h1>
        <p className="text-sm text-white leading-5 pb-6 font-normal">
          Inscrições até {vaga.dataEncerramentoInscricoes}
        </p>
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-3">
          {vaga.badges.map((badge, index) => (
            <span
              key={`${badge.text}-${index}`}
              className="inline-flex items-center justify-center gap-1 py-0.5 px-3 rounded-full bg-white/10 text-white"
            >
              <DetailBadgeIcon type={badge.type} />
              <span className="text-xs">{badge.text}</span>
            </span>
          ))}
        </div>
      </header>

      {/* Conteúdo abaixo da capa com padding */}
      <div className="p-4">
        {/* Informação da empresa - link para detalhe da empresa quando houver CNPJ */}
        {vaga.empresaCnpj ? (
          <Link
            href={`/servicos/empresas/${encodeURIComponent(vaga.empresaCnpj)}`}
            className="flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90"
          >
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-card flex items-center justify-center">
              {vaga.empresaLogo ? (
                <Image
                  src={vaga.empresaLogo}
                  alt={vaga.empresaNome}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {vaga.empresaNome?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <span className="flex-1 min-w-0 text-sm font-normal leading-5 text-foreground line-clamp-2">
              {vaga.empresaNome}
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-foreground" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-full bg-card flex items-center justify-center">
              {vaga.empresaLogo ? (
                <Image
                  src={vaga.empresaLogo}
                  alt={vaga.empresaNome}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {vaga.empresaNome?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <span className="flex-1 min-w-0 text-sm font-normal leading-5 text-foreground line-clamp-2">
              {vaga.empresaNome}
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-foreground" />
          </div>
        )}

        {/* Descrição */}
        {vaga.descricao ? (
          <MarkdownRenderer
            content={vaga.descricao}
            className="text-sm font-normal leading-5 text-foreground-light mt-4"
          />
        ) : null}

        {/* Botão quando o usuário ainda não se candidatou; etapas quando já se candidatou e a vaga tem etapas */}
        {(!hasCandidatura || hasEtapas) && (
          <div className="mt-6">
            {hasCandidatura ? (
              <EtapasProcessoSeletivoCard
                etapas={vaga.etapasProcessoSeletivo ?? []}
                etapaAtualCandidatura={vaga.etapaAtualCandidatura}
                statusCandidatura={vaga.statusCandidatura}
                hasCandidatura
              />
            ) : isLoggedIn ? (
              <Link
                href={`/servicos/empregos/${vaga.id}/inscricao`}
                className={`inline-flex items-center justify-center gap-2 w-full rounded-full font-normal text-sm border transition-all duration-200 px-6 py-3 h-12 ${candidacyButtonClassName}`}
              >
                Candidatar-se à vaga
              </Link>
            ) : (
              <Link
                href={buildAuthUrl(`/servicos/empregos/${vaga.id}/inscricao`)}
                className="inline-flex items-center justify-center gap-2 w-full rounded-full font-normal text-sm border transition-all duration-200 px-6 py-3 h-12 bg-[#3E5782] hover:bg-[#3E5782]/90 text-white"
              >
                Fazer login para se candidatar
              </Link>
            )}
          </div>
        )}

        {/* Informações gerais */}
        <h2 className="text-sm font-normal leading-5 text-foreground mt-8">
          Informações gerais
        </h2>
        <div className="bg-card rounded-xl p-6 mt-2">
          <InfoRow label="Valor da Vaga" value={vaga.valorVaga || '—'} />
          <InfoRow
            label="Regime de contratação"
            value={vaga.regimeContratacao || '—'}
          />
          <InfoRow
            label="Modelo de trabalho"
            value={vaga.modeloTrabalho || '—'}
          />
          <InfoRow
            label="Local de trabalho"
            value={vaga.localTrabalho || '—'}
          />
          <InfoRow
            label="Data limite de inscrição"
            value={vaga.dataLimiteInscricao || '—'}
          />
          {vaga.acessibilidade && vaga.acessibilidade !== 'Não informado' && (
            <InfoRow label="Acessibilidade" value={vaga.acessibilidade} />
          )}
        </div>

        {/* Requisitos, Diferenciais, Responsabilidades, Benefícios */}
        <SectionBlock title="Requisitos" content={vaga.requisitos} />
        <SectionBlock title="Diferenciais" content={vaga.diferenciais ?? ''} />
        <SectionBlock
          title="Responsabilidades"
          content={vaga.responsabilidades ?? ''}
        />
        <SectionBlock title="Benefícios" content={vaga.beneficios} />

        {/* Etapas do processo seletivo: só na posição inferior quando a vaga tem etapas e o usuário NÃO está candidato (quando está candidato, já foi exibido no lugar do botão) */}
        {hasEtapas && !hasCandidatura && (
          <div className="mt-6">
            <EtapasProcessoSeletivoCard
              etapas={vaga.etapasProcessoSeletivo ?? []}
              etapaAtualCandidatura={vaga.etapaAtualCandidatura}
              statusCandidatura={vaga.statusCandidatura}
              hasCandidatura={false}
            />
          </div>
        )}

        {vaga.orgaoParceiro ? (
          <VagaParceriaCard orgaoParceiro={vaga.orgaoParceiro} />
        ) : null}
      </div>
    </div>
  )
}
