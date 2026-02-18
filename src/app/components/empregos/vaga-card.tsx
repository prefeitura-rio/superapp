'use client'

import { MapPinIcon } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { Briefcase, DollarSign } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export interface VagaBadge {
  text: string
  type?: 'modality' | 'bairro' | 'salary' | 'acessivel_pcd' | 'preferencial_pcd'
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
      return <Briefcase className="h-3.5 w-3.5 shrink-0" />
    case 'bairro':
      return <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
    case 'salary':
      return <DollarSign className="h-3.5 w-3.5 shrink-0" />
    case 'acessivel_pcd':
    case 'preferencial_pcd':
      return null
    default:
      return null
  }
}

export function VagaCard({ vaga, variant, className }: VagaCardProps) {
  const isRecent = variant === 'recent'

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
        {(isRecent ? vaga.badges.slice(0, 3) : vaga.badges).map(
          (badge, index) => (
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
          )
        )}
      </div>
    </Link>
  )
}
