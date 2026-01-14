'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export interface MeiOpportunity {
  id: number
  title: string
  expiresAt: string
  coverImage?: string
}

interface MeiOpportunityCardProps {
  opportunity: MeiOpportunity
  className?: string
}

function formatExpirationTime(expiresAt: string): string {
  const now = new Date()
  const expirationDate = new Date(expiresAt)
  const diffMs = expirationDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'Expirado'
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `Expira em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
  }

  return `Expira em ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
}

export function MeiOpportunityCard({
  opportunity,
  className,
}: MeiOpportunityCardProps) {
  return (
    <Link
      href={`/servicos/mei/${opportunity.id}`}
      className={cn(
        'w-full rounded-xl overflow-hidden bg-background cursor-pointer group',
        // Mobile: horizontal layout
        'flex gap-3',
        // Desktop (>=576px): vertical layout
        'sm:flex-col sm:gap-0',
        className
      )}
    >
      {/* Image container */}
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl bg-muted',
          // Mobile: fixed size square
          'w-26 h-26',
          // Desktop: full width, fixed height
          'sm:w-full sm:h-[120px]'
        )}
      >
        {opportunity.coverImage ? (
          <Image
            src={opportunity.coverImage}
            alt={opportunity.title}
            fill
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-2xl font-bold text-primary">
              {opportunity.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 flex flex-col justify-center min-w-0',
          // Mobile
          'py-2',
          // Desktop
          'sm:py-2'
        )}
      >
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {opportunity.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatExpirationTime(opportunity.expiresAt)}
        </p>
      </div>
    </Link>
  )
}
