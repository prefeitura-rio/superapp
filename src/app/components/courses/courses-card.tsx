'use client'

import type { ModelsCurso } from '@/http-courses/models'
import { shouldGrayscaleCourseCover } from '@/lib/course-utils'
import { cn } from '@/lib/utils'
import type { AccessibilityProps, CourseManagementType } from '@/types/course'

import Image from 'next/image'
import Link from 'next/link'
import {
  AccessibilityPillBadge,
  ModalityBadge,
  ScholarshipBadge,
  WorkloadBadge,
} from './badges'

const PT_MONTHS = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
]

function parseDateLocal(dateString: string): Date {
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getEnrollmentText(enrollmentEndDate?: string): string | null {
  if (!enrollmentEndDate) return null
  const endDate = parseDateLocal(enrollmentEndDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (today > endDate) return 'Inscrições encerradas'
  return `Inscrições até ${endDate.getDate()} ${PT_MONTHS[endDate.getMonth()]}`
}

interface CourseCardProps {
  courseId?: number
  title?: string
  modality?: string
  workload?: string
  provider?: string
  institutionaLogo?: string
  accessibility?: AccessibilityProps
  /** @deprecated Use courseManagementType instead */
  isExternalPartner?: boolean
  courseManagementType?: CourseManagementType
  coverImage?: string
  className?: string
  variant?: 'vertical' | 'horizontal'
  /** @deprecated No longer used */
  badgesOutside?: boolean
  enrollmentEndDate?: string
  hasBolsa?: boolean
  /** Full course object — used to grayscale cover when enrollment is unavailable */
  course?: ModelsCurso
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
  courseManagementType,
  coverImage,
  className = '',
  variant = 'vertical',
  enrollmentEndDate,
  hasBolsa = false,
  course,
}: CourseCardProps) {
  const enrollmentText = getEnrollmentText(enrollmentEndDate)
  const isEnrollmentClosed = enrollmentText === 'Inscrições encerradas'
  const isCoverGrayscale = course
    ? shouldGrayscaleCourseCover(course)
    : isEnrollmentClosed

  const badgeHoverClasses =
    'group-hover:bg-terciary group-hover:text-foreground-light'

  // Layout horizontal: imagem à esquerda, texto à direita
  if (variant === 'horizontal') {
    return (
      <Link
        href={`/servicos/cursos/${courseId}`}
        className={cn('w-full cursor-pointer group flex gap-3', className)}
      >
        {/* Imagem à esquerda */}
        <div className="relative w-26 h-26 shrink-0 overflow-hidden rounded-xl">
          {coverImage && (
            <Image
              src={coverImage}
              alt="Imagem de capa do curso"
              fill
              className={cn(
                'object-cover transition-transform duration-300 ease-in-out group-hover:scale-105',
                isCoverGrayscale && 'grayscale'
              )}
            />
          )}

          <div className="absolute top-1 left-1 z-20 w-6.5 h-6.5 rounded-full flex items-center justify-center overflow-hidden border border-[#E2E8F0] bg-white">
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
        <div className="flex-1 flex flex-col justify-center py-2 min-w-0 gap-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-2">
            {title}
          </h3>
          {enrollmentText && (
            <p className="text-xs text-card-2 leading-4 font-normal">
              {enrollmentText}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            <ModalityBadge modality={modality} />
            <WorkloadBadge workload={workload} />
            {hasBolsa && <ScholarshipBadge />}
            <AccessibilityPillBadge accessibility={accessibility} />
          </div>
        </div>
      </Link>
    )
  }

  // Layout vertical: imagem no topo, texto embaixo
  return (
    <Link
      href={`/servicos/cursos/${courseId}`}
      className={cn(
        'w-[212px] h-[252px] rounded-2xl overflow-hidden bg-card cursor-pointer group flex flex-col hover:bg-secondary transition-colors duration-200',
        className
      )}
    >
      {/* Imagem — cantos superiores cortados pelo overflow-hidden do card, sem radius em baixo */}
      <div className="relative w-full h-[100px] overflow-hidden">
        {coverImage && (
          <Image
            src={coverImage}
            alt="Imagem de capa do curso"
            fill
            className={cn('object-cover', isCoverGrayscale && 'grayscale')}
          />
        )}

        <div className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-[#E2E8F0] bg-white">
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

      {/* Conteúdo */}
      <div className="px-4 py-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {title}
        </h3>
        {enrollmentText && (
          <p className="mt-1 text-xs text-card-2 leading-4 font-normal">
            {enrollmentText}
          </p>
        )}
        <div className="flex flex-wrap gap-1 mt-auto pt-3">
          <ModalityBadge
            modality={modality}
            className={`bg-secondary ${badgeHoverClasses}`}
          />
          <WorkloadBadge
            workload={workload}
            className={`bg-secondary ${badgeHoverClasses}`}
          />
          {hasBolsa && (
            <ScholarshipBadge className={`bg-secondary ${badgeHoverClasses}`} />
          )}
          <AccessibilityPillBadge
            accessibility={accessibility}
            className={`bg-secondary ${badgeHoverClasses}`}
          />
        </div>
      </div>
    </Link>
  )
}
