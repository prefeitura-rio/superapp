'use client'

import { cn } from '@/lib/utils'
import type { AccessibilityProps } from '@/types/course'
import Image from 'next/image'
import Link from 'next/link'
import { AccessibilityBadge, IsExternalPartnerBadge } from './badges'

interface CourseCardProps {
  courseId?: number
  title?: string
  modality?: string
  workload?: string
  provider?: string
  institutionaLogo?: string
  accessibility?: AccessibilityProps
  isExternalPartner?: boolean
  coverImage?: string
  className?: string
  variant?: 'vertical' | 'horizontal'
  badgesOutside?: boolean // Se true, badges aparecem embaixo do texto no layout horizontal
}

export function CourseCard({
  courseId,
  title,
  modality,
  workload,
  provider,
  institutionaLogo,
  accessibility,
  isExternalPartner,
  coverImage,
  className = '',
  variant = 'vertical',
  badgesOutside = false,
}: CourseCardProps) {
  // Layout horizontal: imagem à esquerda, texto à direita
  if (variant === 'horizontal') {
    return (
      <Link
        href={`/servicos/cursos/${courseId}`}
        className={cn(
          'w-full rounded-xl overflow-hidden bg-background cursor-pointer group flex gap-3',
          className
        )}
      >
        {/* Imagem à esquerda */}
        <div className="relative w-26 h-26 shrink-0 overflow-hidden rounded-xl">
          {coverImage && (
            <>
              <Image
                src={coverImage}
                alt="Imagem de capa do curso"
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              />
              {/* Badges dentro da imagem apenas se badgesOutside for false */}
              {!badgesOutside && (
                <div className="absolute bottom-1 left-1 flex flex-col gap-1">
                  {accessibility && (
                    <AccessibilityBadge accessibility={accessibility} />
                  )}
                  {isExternalPartner && <IsExternalPartnerBadge />}
                </div>
              )}
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-1 left-1 z-20 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
            {institutionaLogo ? (
              <div className="relative w-full h-full">
                <Image
                  src={institutionaLogo}
                  alt="Logo da instituição"
                  className="object-contain"
                  fill
                />
              </div>
            ) : (
              <span className="text-[8px] font-semibold text-foreground uppercase">
                {title?.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo à direita */}
        <div className="flex-1 flex flex-col justify-center py-2 min-w-0">
          <h3 className="text-sm font-medium text-foreground line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {modality} • {workload}
          </p>
          {/* Badges embaixo do texto se badgesOutside for true */}
          {badgesOutside && (
            <div className="flex flex-col gap-0.5 mt-2">
              {accessibility && (
                <AccessibilityBadge accessibility={accessibility} />
              )}
              {isExternalPartner && <IsExternalPartnerBadge />}
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Layout vertical padrão: imagem no topo, texto embaixo
  return (
    <Link
      href={`/servicos/cursos/${courseId}`}
      className={cn(
        'w-[197px] rounded-xl overflow-hidden bg-background cursor-pointer group block',
        className
      )}
    >
      <div className="relative w-full h-[120px] overflow-hidden rounded-xl">
        {coverImage && (
          <>
            <Image
              src={coverImage}
              alt="Imagem de capa do curso"
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
            <div className="absolute bottom-2 left-2 flex flex-col gap-1">
              {accessibility && (
                <AccessibilityBadge accessibility={accessibility} />
              )}
              {isExternalPartner && <IsExternalPartnerBadge />}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden">
          {institutionaLogo ? (
            <div className="relative w-full h-full">
              <Image
                src={institutionaLogo}
                alt="Logo da instituição"
                className="object-contain"
                fill
              />
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-foreground uppercase">
              {title?.charAt(0)}
            </span>
          )}
        </div>
      </div>

      <div className="py-2">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {modality} • {workload}
        </p>
      </div>
    </Link>
  )
}
