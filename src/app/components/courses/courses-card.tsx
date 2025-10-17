'use client'

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
}: CourseCardProps) {
  return (
    <Link
      href={`/servicos/cursos/${courseId}`}
      className="w-[197px] rounded-xl overflow-hidden bg-background cursor-pointer group block"
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
