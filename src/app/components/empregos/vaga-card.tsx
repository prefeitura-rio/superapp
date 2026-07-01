'use client'

import {
  BriefcaseIcon,
  CltIcon,
  MapPinIcon,
  PcdIcon,
  SalaryIcon,
  UsersIcon,
} from '@/assets/icons'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export interface VagaBadge {
  text: string
  type?:
    | 'modality'
    | 'bairro'
    | 'salary'
    | 'regime'
    | 'para_pcd'
    | 'preferencial_pcd'
    | 'exclusivo_pcd'
    | 'contratacoes'
}

export interface VagaCardData {
  id: string
  titulo: string
  empresaNome: string
  empresaLogo?: string
  empresaCnpj?: string
  badges: VagaBadge[]
  dataPublicacao?: string
}

interface VagaCardProps {
  vaga: VagaCardData
  variant: 'recent' | 'all'
  className?: string
}

function BadgeIcon({ type }: { type: VagaBadge['type'] }) {
  if (!type) return null
  switch (type) {
    case 'modality':
      return <BriefcaseIcon className="h-3 w-3 shrink-0" />
    case 'regime':
      return <CltIcon className="h-3 w-3 shrink-0" />
    case 'bairro':
      return <MapPinIcon className="h-3 w-3 shrink-0" />
    case 'salary':
      return <SalaryIcon className="h-3 w-3 shrink-0" />
    case 'para_pcd':
    case 'preferencial_pcd':
    case 'exclusivo_pcd':
      return <PcdIcon className="h-3 w-3 shrink-0" />
    case 'contratacoes':
      return <UsersIcon className="h-3 w-3 shrink-0" />
    default:
      return null
  }
}

const PCD_TYPES = new Set<VagaBadge['type']>([
  'para_pcd',
  'preferencial_pcd',
  'exclusivo_pcd',
])

const BADGE_PRIORITY: Partial<Record<NonNullable<VagaBadge['type']>, number>> =
  {
    regime: 0,
    modality: 1,
    para_pcd: 2,
    preferencial_pcd: 2,
    exclusivo_pcd: 2,
    bairro: 3,
    contratacoes: 100,
  }

function sortBadges(badges: VagaBadge[]): VagaBadge[] {
  return [...badges].sort((a, b) => {
    const pa = a.type ? (BADGE_PRIORITY[a.type] ?? 99) : 99
    const pb = b.type ? (BADGE_PRIORITY[b.type] ?? 99) : 99
    return pa - pb
  })
}

export function VagaCard({ vaga, variant, className }: VagaCardProps) {
  const isRecent = variant === 'recent'

  const displayedBadges = isRecent
    ? (() => {
        const contratacoesBadge = vaga.badges.filter(
          b => b.type === 'contratacoes'
        )
        const accessibility = vaga.badges.filter(
          b => b.type && PCD_TYPES.has(b.type)
        )
        const others = sortBadges(
          vaga.badges.filter(
            b =>
              !b.type || (!PCD_TYPES.has(b.type) && b.type !== 'contratacoes')
          )
        )
        const remainingSlots = Math.max(0, 3 - accessibility.length)
        return sortBadges([
          ...accessibility,
          ...others.slice(0, remainingSlots),
          ...contratacoesBadge,
        ])
      })()
    : sortBadges(vaga.badges)

  return (
    <Link
      href={`/servicos/trabalho/${vaga.id}`}
      className={cn(
        'flex flex-col transition-opacity hover:opacity-90 overflow-hidden min-h-0',
        isRecent &&
          'justify-between p-4 bg-[#3E5782] text-background shrink-0 rounded-2xl shadow-[0_2px_10px_1px_rgba(0,0,0,0.20)]',
        !isRecent && 'justify-between p-6 bg-card rounded-2xl',
        className
      )}
    >
      {/* Header: logo + nome da empresa + data de publicação */}
      <div className="flex items-start gap-2 shrink-0">
        <div className="size-8 shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center">
          {vaga.empresaLogo ? (
            <Image
              src={vaga.empresaLogo}
              alt={vaga.empresaNome}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <span
              className={cn(
                'text-[10px] font-semibold uppercase',
                isRecent ? 'text-[#3E5782]' : 'text-muted-foreground'
              )}
            >
              {vaga.empresaNome?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              'text-xs font-normal leading-4 line-clamp-1 min-w-0',
              isRecent ? 'text-white' : 'text-card-foreground'
            )}
          >
            {vaga.empresaNome}
          </span>
          {vaga.dataPublicacao && (
            <span
              className={cn(
                'font-sans text-xs font-normal leading-4 tracking-normal',
                isRecent ? 'text-[rgba(255,255,255,0.60)]' : 'text-[#0084D1]'
              )}
            >
              Publicada em {vaga.dataPublicacao}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'text-base font-medium line-clamp-2 leading-5 shrink-0',
          isRecent ? 'text-white' : 'text-card-foreground'
        )}
      >
        {vaga.titulo}
      </h3>

      {/* Info badges */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1 self-stretch content-center min-h-0 shrink-0">
        {displayedBadges.map((badge, index) => (
          <span
            key={`${badge.text}-${index}`}
            className={cn(
              'inline-flex items-center justify-center gap-1 py-0.5 px-3 rounded-full font-sans font-normal leading-4 tracking-normal',
              isRecent
                ? 'bg-white/10 text-white text-xs'
                : 'bg-foreground/5 text-xs'
            )}
            style={
              !isRecent
                ? { color: 'var(--theme-color-foreground-light, #71717B)' }
                : undefined
            }
          >
            {!isRecent && <BadgeIcon type={badge.type} />}
            <span>{badge.text}</span>
          </span>
        ))}
      </div>
    </Link>
  )
}
