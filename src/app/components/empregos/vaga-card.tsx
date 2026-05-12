'use client'

import { BriefcaseIcon, CltIcon, MapPinIcon, PcdIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { DollarSign } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export interface VagaBadge {
  text: string
  type?:
    | 'modality'
    | 'bairro'
    | 'salary'
    | 'regime'
    | 'acessivel_pcd'
    | 'preferencial_pcd'
    | 'exclusivo_pcd'
}

export interface VagaCardData {
  id: string
  titulo: string
  empresaNome: string
  empresaLogo?: string
  empresaCnpj?: string
  badges: VagaBadge[]
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
      return <DollarSign className="h-3 w-3 shrink-0" />
    case 'acessivel_pcd':
    case 'preferencial_pcd':
    case 'exclusivo_pcd':
      return <PcdIcon className="h-3 w-3 shrink-0" />
    default:
      return null
  }
}

const PCD_TYPES = new Set<VagaBadge['type']>([
  'acessivel_pcd',
  'preferencial_pcd',
  'exclusivo_pcd',
])

const BADGE_PRIORITY: Partial<Record<NonNullable<VagaBadge['type']>, number>> =
  {
    modality: 0,
    acessivel_pcd: 1,
    preferencial_pcd: 1,
    exclusivo_pcd: 1,
    bairro: 2,
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
        const accessibility = vaga.badges.filter(
          b => b.type && PCD_TYPES.has(b.type)
        )
        const others = sortBadges(
          vaga.badges.filter(b => !b.type || !PCD_TYPES.has(b.type))
        )
        const remainingSlots = Math.max(0, 3 - accessibility.length)
        return sortBadges([
          ...accessibility,
          ...others.slice(0, remainingSlots),
        ])
      })()
    : sortBadges(vaga.badges)

  return (
    <Link
      href={`/servicos/empregos/${vaga.id}`}
      className={cn(
        'flex flex-col justify-between p-4 rounded-3xl transition-opacity hover:opacity-90 overflow-hidden min-h-0',
        isRecent && 'bg-[#3E5782] text-background shrink-0',
        !isRecent && 'bg-card',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
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
        <span
          className={cn(
            'text-xs font-normal leading-4 line-clamp-2 min-w-0',
            isRecent ? 'text-white' : 'text-card-foreground'
          )}
        >
          {vaga.empresaNome}
        </span>
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
              'inline-flex items-center justify-center gap-1 py-0.5 px-3 rounded-full',
              isRecent
                ? 'bg-white/10 text-white'
                : 'bg-foreground/5 text-foreground'
            )}
          >
            {!isRecent && <BadgeIcon type={badge.type} />}
            <span className="text-xs">{badge.text}</span>
          </span>
        ))}
      </div>
    </Link>
  )
}
