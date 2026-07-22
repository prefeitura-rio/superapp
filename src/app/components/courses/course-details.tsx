'use client'

import { deleteEnrollment } from '@/actions/courses/delete-enrollment'
import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'
import { CourseStatusCard } from './course-status-card'

import { MarkdownRenderer } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/components/markdown-renderer'
import { CalendarIcon } from '@/assets/icons'
import { CircleCheckIcon } from '@/assets/icons/circle-check-icon'
import { ClockIcon } from '@/assets/icons/clock-icon'
import { CycleIcon } from '@/assets/icons/cycle-icon'
import { GroupIcon } from '@/assets/icons/group-icon'
import { PersonIcon } from '@/assets/icons/person-icon'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { oportunidadesCariocasLogoDark } from '@/constants/bucket'
import { useUserEnrollment } from '@/hooks/courses/use-user-enrollment'
import type { ModelsCurso } from '@/http-courses/models'
import type { ModelsDepartmentResponse } from '@/http/models'
import {
  getCourseEnrollmentInfo,
  getCourseLatestOpenEnrollmentEnd,
  isScheduleEnrollmentClosed,
  normalizeModalityDisplay,
  shouldGrayscaleCourseCover,
} from '@/lib/course-utils'
import { formatDate, formatTimeRange } from '@/lib/date'
import { cn } from '@/lib/utils'
import { getBackRoute } from '@/lib/utils'
import type { Course } from '@/types'
import {
  shouldShowExternalPartnerBadge,
  shouldShowExternalPartnerModal,
} from '@/types/course'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ExternalPartnerCourseDrawer } from '../drawer-contents/external-partner-course-drawer'
import { IsExternalPartnerBadge } from './badges'

interface CourseDetailsProps {
  course: Course
  department: ModelsDepartmentResponse | null
}

// Sub-components

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

function getEnrollmentText(enrollmentEndDate?: string | null): string | null {
  if (!enrollmentEndDate) return null
  const endDate = parseDateLocal(enrollmentEndDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (today > endDate) return null
  return `Inscrições até ${endDate.getDate()} ${PT_MONTHS[endDate.getMonth()]}`
}

interface MetaCardProps {
  label: string
  value: string | number | null | undefined
}

function MetaCard({ label, value }: MetaCardProps) {
  if (!value) return null
  return (
    <div className="flex flex-col items-start p-5 rounded-xl bg-card gap-0.5">
      <span className="text-foreground-light text-sm font-normal leading-5">
        {label}
      </span>
      <span className="text-foreground text-sm font-normal leading-5">
        {value}
      </span>
    </div>
  )
}

interface CourseHeaderProps {
  course: Course
  onBack?: () => void
}

function CourseHeader({ course, onBack }: CourseHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    // Check if previous route contains "confirmar-informacoes"
    let previousRoute: string | null = null
    if (typeof window !== 'undefined') {
      try {
        previousRoute = sessionStorage.getItem('previousRoute')
      } catch (error) {
        // sessionStorage might be unavailable
      }
    }

    // If previous route contains "confirmar-informacoes" or "trocar-turma", go to courses list
    if (
      previousRoute &&
      (previousRoute.includes('confirmar-informacoes') ||
        previousRoute.includes('trocar-turma'))
    ) {
      router.push('/servicos/cursos/')
      return
    }

    const backRoute = getBackRoute('/servicos/cursos/')
    router.push(backRoute)
  }
  return (
    <div className="h-[280px] md:h-[340px] w-full relative">
      {/* Header bar: botão + logo centralizados verticalmente */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center px-4 py-4">
        <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        <div className="absolute inset-x-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <Link href="/servicos/cursos">
              <Image
                src={oportunidadesCariocasLogoDark}
                alt="Oportunidades Cariocas"
                width={170}
                height={38}
                priority
              />
            </Link>
          </div>
        </div>
      </div>

      {course.cover_image && (
        <Image
          src={course.cover_image}
          alt={course.title || ''}
          fill
          className={cn(
            'object-cover',
            shouldGrayscaleCourseCover(course as ModelsCurso) && 'grayscale'
          )}
        />
      )}
    </div>
  )
}

interface CourseInfoProps {
  course: Course
  department: ModelsDepartmentResponse | null
}

function CourseInfo({ course, department }: CourseInfoProps) {
  const organizationName =
    department?.nome_ua || course.organization || 'Instituição não informada'
  const organizationInitial = organizationName.charAt(0)
  const mobileName =
    department?.sigla_ua || course.organization || 'Instituição não informada'
  const desktopName =
    department?.nome_ua || course.organization || 'Instituição não informada'

  const hasExternalPartner = shouldShowExternalPartnerBadge(
    course.course_management_type
  )

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center p-5 rounded-xl bg-card gap-3">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0">
          {course.institutional_logo ? (
            <Image
              src={course.institutional_logo}
              alt="Logo da instituição"
              className="w-full h-full object-cover rounded-full"
              width={40}
              height={40}
            />
          ) : (
            <span className="text-xs font-semibold text-foreground uppercase">
              {organizationInitial}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground-light text-sm font-normal leading-5">
            {hasExternalPartner
              ? 'Curso oferecido e gerido por'
              : 'Curso oferecido por'}
          </span>
          <span className="text-foreground text-sm font-normal leading-5 block sm:hidden">
            {mobileName}
          </span>
          <span className="text-foreground text-sm font-normal leading-5 hidden sm:block">
            {desktopName}
          </span>
        </div>
      </div>
      {hasExternalPartner && (
        <div className="flex items-center p-5 rounded-xl bg-card gap-3">
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0">
            {course.external_partner_logo_url ? (
              <Image
                src={course.external_partner_logo_url}
                alt="Logo do parceiro"
                className="w-full h-full object-cover rounded-full"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-xs font-semibold text-foreground uppercase">
                {course.external_partner_name?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground-light text-sm font-normal leading-5">
              Em parceria com
            </span>
            <span className="text-foreground text-sm font-normal leading-5">
              {course.external_partner_name || 'Parceiro não informado'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface CourseMetadataProps {
  course: Course
}

function CourseMetadata({ course }: CourseMetadataProps) {
  const modality =
    course.modalidade === 'LIVRE_FORMACAO_ONLINE'
      ? 'Remoto'
      : normalizeModalityDisplay(course.modalidade) || undefined

  const firstStartDate = (() => {
    const mod = course.modalidade?.toLowerCase()
    if ((mod === 'online' || mod === 'remoto') && course.remote_class) {
      const schedules = course.remote_class.schedules
      if (schedules && schedules.length > 0)
        return formatDate(schedules[0].class_start_date)
      return formatDate(course.remote_class.class_start_date)
    }
    if (course.locations && course.locations.length > 0) {
      const schedule = course.locations[0].schedules?.[0]
      if (schedule) return formatDate(schedule.class_start_date)
    }
    return null
  })()

  const accessibilityLabel = course.accessibility
    ? typeof course.accessibility === 'string'
      ? course.accessibility
      : ((course.accessibility as any)?.label ?? null)
    : null

  // "Inscrições até" do curso = encerramento mais distante entre as turmas
  // ABERTAS (com fallback para a data do curso).
  const enrollmentUntil = getCourseLatestOpenEnrollmentEnd(course as any)

  const items = [
    { label: 'Carga horária', value: course.workload },
    { label: 'Modalidade', value: modality },
    ...(enrollmentUntil
      ? [{ label: 'Inscrições até', value: formatDate(enrollmentUntil) }]
      : []),
    ...(accessibilityLabel
      ? [{ label: 'Acessibilidade', value: accessibilityLabel }]
      : []),
    ...(firstStartDate
      ? [{ label: 'Data início', value: firstStartDate }]
      : []),
  ].filter(item => item.value)

  const isOdd = items.length % 2 !== 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={
            isOdd && index === items.length - 1
              ? 'col-span-2 sm:col-span-1'
              : ''
          }
        >
          <MetaCard label={item.label} value={item.value} />
        </div>
      ))}
    </div>
  )
}

interface OnlineClassSelectionProps {
  course: Course
  selectedClassId: string | null
  onClassSelect: (classId: string) => void
}

const SCROLL_STEP = 208 + 12 // card width + gap

function ScrollableCards({
  children,
  count,
  label,
}: {
  children: ReactNode
  count: number
  label?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasMovedRef = useRef(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  useEffect(() => {
    const container = scrollRef.current
    if (!container || count < 3) return

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      hasMovedRef.current = false
      startXRef.current = e.pageX - container.offsetLeft
      scrollLeftRef.current = container.scrollLeft
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
      container.querySelectorAll('button').forEach(b => {
        b.style.userSelect = 'none'
      })
    }
    const handleMouseLeave = () => {
      isDraggingRef.current = false
      hasMovedRef.current = false
      container.style.cursor = 'grab'
      container.style.userSelect = ''
      container.querySelectorAll('button').forEach(b => {
        b.style.userSelect = ''
      })
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
      container.style.cursor = 'grab'
      container.style.userSelect = ''
      container.querySelectorAll('button').forEach(b => {
        b.style.userSelect = ''
      })
      setTimeout(() => {
        hasMovedRef.current = false
      }, 0)
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      e.preventDefault()
      hasMovedRef.current = true
      container.scrollLeft =
        scrollLeftRef.current -
        (e.pageX - container.offsetLeft - startXRef.current) * 2
    }
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 768) {
        e.preventDefault()
        container.scrollLeft += e.deltaX + e.deltaY
      }
    }
    const handleClick = (e: MouseEvent) => {
      if (hasMovedRef.current && (e.target as HTMLElement).closest('button')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    container.addEventListener('mousedown', handleMouseDown, true)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mouseup', handleMouseUp, true)
    container.addEventListener('mousemove', handleMouseMove, true)
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('click', handleClick, true)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, true)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mouseup', handleMouseUp, true)
      container.removeEventListener('mousemove', handleMouseMove, true)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('click', handleClick, true)
    }
  }, [count])

  const showChevrons = canScrollLeft || canScrollRight

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Label row with chevrons — chevrons só em desktop quando há overflow */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-foreground-light text-sm">{label}</span>
        )}
        {showChevrons && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() =>
                scrollRef.current?.scrollBy({
                  left: -SCROLL_STEP,
                  behavior: 'smooth',
                })
              }
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon
                width={20}
                height={20}
                className={canScrollLeft ? 'text-foreground' : 'text-[#A1A1A1]'}
              />
            </button>
            <button
              type="button"
              onClick={() =>
                scrollRef.current?.scrollBy({
                  left: SCROLL_STEP,
                  behavior: 'smooth',
                })
              }
              disabled={!canScrollRight}
              aria-label="Próximo"
              className="flex items-center justify-center"
            >
              <ChevronRightIcon
                width={20}
                height={20}
                className={
                  canScrollRight ? 'text-foreground' : 'text-[#A1A1A1]'
                }
              />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
          count >= 3 &&
            'md:cursor-grab md:active:cursor-grabbing [&_button]:md:cursor-grab'
        )}
      >
        <div className="flex gap-3 pb-2">
          {children}
          <div className="shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

function ScheduleRow({
  icon,
  label,
  value,
}: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm leading-5">
      <span className="text-foreground-light shrink-0">{icon}</span>
      <span className="text-foreground-light">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function ScheduleCards({ schedules }: { schedules: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      {schedules.map((schedule, index) => (
        <div
          key={schedule.id}
          className="flex flex-col p-5 rounded-xl bg-card gap-2.5"
        >
          <ScheduleRow icon={<GroupIcon />} label="Turma" value={index + 1} />
          {schedule.enrollment_end_date && (
            <ScheduleRow
              icon={<CircleCheckIcon />}
              label="Inscrições até"
              value={formatDate(schedule.enrollment_end_date)}
            />
          )}
          {schedule.class_start_date && (
            <ScheduleRow
              icon={<CalendarIcon />}
              label="Data início"
              value={formatDate(schedule.class_start_date)}
            />
          )}
          {schedule.class_end_date && (
            <ScheduleRow
              icon={<CalendarIcon />}
              label="Data final"
              value={formatDate(schedule.class_end_date)}
            />
          )}
          {schedule.class_time && (
            <ScheduleRow
              icon={<ClockIcon />}
              label="Horário"
              value={formatTimeRange(schedule.class_time)}
            />
          )}
          {schedule.class_days && (
            <ScheduleRow
              icon={<CycleIcon />}
              label="Dias de aula"
              value={schedule.class_days}
            />
          )}
          <ScheduleRow
            icon={<PersonIcon />}
            label="Vagas"
            value={schedule.vacancies}
          />
        </div>
      ))}
    </div>
  )
}

function OnlineClassSelection({
  course,
  selectedClassId,
  onClassSelect,
}: OnlineClassSelectionProps) {
  const modality = course.modalidade?.toLowerCase()

  if (modality !== 'online' && modality !== 'remoto') return null
  if (
    !course.remote_class?.schedules ||
    course.remote_class.schedules.length === 0
  )
    return null

  const onlineClasses = course.remote_class.schedules
  const hasMultiple = onlineClasses.length > 1

  // A turma só aceita inscrição quando ainda tem vagas E o próprio período de
  // inscrição não encerrou.
  const isClassAvailable = (onlineClass: any) => {
    if (isScheduleEnrollmentClosed(onlineClass)) return false
    return (
      onlineClass.remaining_vacancies !== undefined &&
      onlineClass.remaining_vacancies !== null &&
      onlineClass.remaining_vacancies > 0
    )
  }

  if (!hasMultiple) {
    return (
      <div className="space-y-4 pt-4">
        <ScheduleCards schedules={onlineClasses} />
      </div>
    )
  }

  const selectedClass =
    onlineClasses.find(cls => cls.id === selectedClassId) || onlineClasses[0]

  return (
    <div className="space-y-4 pt-4">
      <ScrollableCards count={onlineClasses.length} label="Selecione a turma">
        {onlineClasses.map((onlineClass, index) => {
          const isAvailable = isClassAvailable(onlineClass)
          const isSelected = selectedClassId === onlineClass.id
          return (
            <button
              type="button"
              key={onlineClass.id}
              onClick={() => isAvailable && onClassSelect(onlineClass.id)}
              disabled={!isAvailable}
              className={cn(
                'shrink-0 w-[200px] p-4 rounded-xl border text-left transition-all',
                isAvailable
                  ? 'hover:border-muted-foreground hover:bg-secondary cursor-pointer'
                  : 'opacity-50 cursor-not-allowed',
                isSelected
                  ? 'border-muted-foreground bg-secondary'
                  : 'border-transparent bg-card'
              )}
            >
              <h4 className="font-medium text-foreground text-sm">
                Turma {index + 1}
                {!isAvailable && (
                  <span className="text-muted-foreground text-xs ml-2">
                    {isScheduleEnrollmentClosed(onlineClass)
                      ? '(Inscrições encerradas)'
                      : '(Sem vagas)'}
                  </span>
                )}
              </h4>
              <p className="text-xs text-foreground-light mt-1">
                {!onlineClass.class_start_date && !onlineClass.class_end_date
                  ? 'Datas a serem definidas'
                  : `${formatDate(onlineClass.class_start_date) || 'N/D'} - ${formatDate(onlineClass.class_end_date) || 'N/D'}`}
              </p>
            </button>
          )
        })}
      </ScrollableCards>

      {selectedClass && <ScheduleCards schedules={[selectedClass]} />}
    </div>
  )
}

interface LocationSelectionProps {
  course: Course
  selectedLocationId: string | null
  onLocationSelect: (locationId: string) => void
}

function LocationSelection({
  course,
  selectedLocationId,
  onLocationSelect,
}: LocationSelectionProps) {
  const modality = course.modalidade?.toLowerCase()

  if (modality !== 'presencial' && modality !== 'semipresencial') return null
  if (!course.locations || course.locations.length === 0) return null

  const hasMultipleLocations = course.locations.length > 1
  const selectedLocation =
    course.locations.find(loc => loc.id === selectedLocationId) ??
    course.locations[0]

  return (
    <div className="space-y-4 pt-4">
      <ScrollableCards
        count={course.locations.length}
        label={
          hasMultipleLocations
            ? 'Selecione a unidade para mais detalhes'
            : 'Unidade'
        }
      >
        {course.locations.map(location => {
          const isSelected = selectedLocationId === location.id
          return (
            <button
              type="button"
              key={location.id}
              onClick={() => onLocationSelect(location.id)}
              className={cn(
                'shrink-0 w-[200px] p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2',
                isSelected
                  ? 'border-muted-foreground bg-secondary'
                  : 'border-transparent bg-card hover:border-muted-foreground hover:bg-secondary'
              )}
            >
              {location.neighborhood && (
                <h4 className="text-foreground text-sm font-medium leading-4">
                  {location.neighborhood}
                </h4>
              )}
              {location.address && (
                <p className="text-foreground-light text-xs font-normal leading-4">
                  {location.address}
                </p>
              )}
            </button>
          )
        })}
      </ScrollableCards>

      {selectedLocation?.schedules && selectedLocation.schedules.length > 0 && (
        <ScheduleCards schedules={selectedLocation.schedules} />
      )}
    </div>
  )
}

interface CourseContentProps {
  course: Course
}

function CourseContent({ course }: CourseContentProps) {
  const contentSections = [
    {
      key: 'pre_requisitos',
      title: 'Pré-requisitos para o certificado',
      useMarkdown: true,
    },
    { key: 'facilitator', title: 'Facilitador', useMarkdown: false },
    { key: 'objectives', title: 'Objetivos da capacitação', useMarkdown: true },
    {
      key: 'expected_results',
      title: 'Resultados esperados',
      useMarkdown: true,
    },
    {
      key: 'program_content',
      title: 'Conteúdo programático',
      useMarkdown: true,
    },
    { key: 'methodology', title: 'Metodologia', useMarkdown: true },
    { key: 'resources_used', title: 'Recursos utilizados', useMarkdown: true },
    { key: 'material_used', title: 'Material utilizado', useMarkdown: true },
    { key: 'teaching_material', title: 'Material didático', useMarkdown: true },
    { key: 'target_audience', title: 'Público-alvo', useMarkdown: true },
  ]

  return (
    <div className="px-4 space-y-6">
      {contentSections.map(({ key, title, useMarkdown }) => {
        const content = course[key as keyof Course] as string
        if (!content) return null

        return (
          <div key={key}>
            <h2 className="text-sm md:text-base leading-4 font-semibold mb-2">
              {title}
            </h2>
            {useMarkdown ? (
              <MarkdownRenderer
                className="text-sm text-foreground-light"
                content={content}
              />
            ) : (
              <div className="text-sm text-foreground-light whitespace-pre-line">
                {content}
              </div>
            )}
          </div>
        )
      })}

      {/* <div>
        <h2 className="text-sm font-semibold mb-2">Certificado</h2>
        <p className="text-xs md:text-sm text-foreground-light">
          {course.has_certificate
            ? 'Os participantes que concluírem o curso com aproveitamento receberão certificado válido emitido pela instituição promotora.'
            : 'Este curso não oferece certificado.'}
        </p>
      </div> */}
    </div>
  )
}

// Main component
export function CourseDetails({ course, department }: CourseDetailsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: enrollmentData, isLoading: isLoadingEnrollment } =
    useUserEnrollment(course.id)
  const userEnrollment = enrollmentData?.enrollment ?? null

  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isExternalDrawerOpen, setIsExternalDrawerOpen] = useState(false)

  const modality = course.modalidade?.toLowerCase()
  const isOnlineCourse = modality === 'online' || modality === 'remoto'
  const hasOnlineClasses =
    isOnlineCourse &&
    course.remote_class?.schedules &&
    course.remote_class.schedules.length > 0

  // State for location selection (for presencial/semipresencial courses)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    course.locations && course.locations.length > 0
      ? course.locations[0].id
      : null
  )

  // State for online class selection (for online courses)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    hasOnlineClasses &&
      course.remote_class?.schedules &&
      course.remote_class.schedules.length > 0
      ? course.remote_class.schedules[0].id
      : null
  )

  const enrollmentInfo = getCourseEnrollmentInfo(
    course as any,
    userEnrollment as any
  )

  // Build subscription href with selected location or class if available
  const buildCourseSubscriptionHref = () => {
    const baseUrl = `/servicos/cursos/confirmar-informacoes/${course.id}`
    const params = new URLSearchParams()

    if (selectedLocationId) {
      params.set('locationId', selectedLocationId)
    }

    if (selectedClassId && hasOnlineClasses) {
      params.set('classId', selectedClassId)
    }

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId)
  }

  // Handle online class selection
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
  }

  const handleCancelEnrollment = async () => {
    if (!userEnrollment || isDeleting) return

    setIsDeleting(true)

    try {
      const result = await deleteEnrollment(course.id, userEnrollment.id)
      if (!result.success) {
        toast.error(result.error || 'Falha ao cancelar inscrição')
        console.error('Failed to cancel enrollment:', result.error)
      } else {
        toast.success('Inscrição cancelada com sucesso')
        await queryClient.invalidateQueries({ queryKey: ['user-enrollments'] })
        await queryClient.invalidateQueries({
          queryKey: ['user-enrollment', course.id],
        })
      }
    } catch (error) {
      const errorMessage = 'Erro ao cancelar inscrição. Tente novamente.'
      toast.error(errorMessage)
      console.error('Error cancelling enrollment:', error)
    } finally {
      setIsDeleting(false)
      setShowConfirmation(false)
    }
  }

  const isEnrolled =
    userEnrollment &&
    ['pending', 'approved', 'rejected', 'cancelled'].includes(
      userEnrollment.status
    )

  const renderActionButton = () => {
    if (isLoadingEnrollment) {
      return <div className="w-full h-12 rounded-full bg-card animate-pulse" />
    }

    // Don't render button if user concluded course without certificate
    if (userEnrollment?.status === 'concluded' && !course.has_certificate) {
      return null
    }

    const isAvailable = enrollmentInfo.status === 'available'
    const baseButtonClasses =
      'block text-sm md:text-base w-full py-3 text-center rounded-full hover:brightness-90 transition outline-none focus:outline-none focus:ring-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

    const buttonClasses = isAvailable
      ? `${baseButtonClasses} bg-primary text-background hover:bg-primary`
      : `${baseButtonClasses} bg-card text-foreground hover:bg-card`

    // Handle certificate available status
    if (enrollmentInfo.status === 'certificate_available') {
      return (
        <Link
          href={`/servicos/cursos/certificados?courseId=${course.id}`}
          className={buttonClasses}
        >
          {enrollmentInfo.buttonText}
        </Link>
      )
    }

    // Handle rejected status specifically
    if (userEnrollment?.status === 'rejected') {
      return (
        <button type="button" disabled className={buttonClasses}>
          Inscrição recusada
        </button>
      )
    }

    // Handle approved/pending status - show both "Trocar turma" and "Cancelar inscrição" buttons
    if (
      userEnrollment?.status === 'approved' ||
      userEnrollment?.status === 'pending'
    ) {
      return (
        <div className="flex flex-col gap-3">
          <Link
            href={`/servicos/cursos/${course.id}/trocar-turma`}
            className={`${baseButtonClasses} bg-primary text-background hover:bg-primary`}
          >
            Trocar turma / horário
          </Link>
          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            disabled={isDeleting}
            className={`${baseButtonClasses} bg-card text-foreground hover:bg-card`}
          >
            Cancelar inscrição
          </button>
        </div>
      )
    }

    if (isEnrolled) {
      return (
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          disabled={isDeleting}
          className={buttonClasses}
        >
          Cancelar inscrição
        </button>
      )
    }

    if (enrollmentInfo.isDisabled) {
      return (
        <button type="button" disabled className={buttonClasses}>
          {enrollmentInfo.buttonText}
        </button>
      )
    }

    if (
      shouldShowExternalPartnerModal(course.course_management_type) &&
      course.external_partner_url
    ) {
      return (
        <>
          <button
            type="button"
            onClick={() => setIsExternalDrawerOpen(true)}
            className={buttonClasses}
          >
            {enrollmentInfo.buttonText}
          </button>

          <ExternalPartnerCourseDrawer
            open={isExternalDrawerOpen}
            onOpenChange={setIsExternalDrawerOpen}
            externalPartnerUrl={course.external_partner_url}
          />
        </>
      )
    }

    return (
      <Link href={buildCourseSubscriptionHref()} className={buttonClasses}>
        {enrollmentInfo.buttonText}
      </Link>
    )
  }

  const enrollmentText = getEnrollmentText(course.enrollment_end_date)

  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        {/* Confirmation Bottom Sheet */}
        <BottomSheet
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          title="Confirmar cancelamento"
          headerClassName="text-center p-0 mb-6"
        >
          <div className="text-center p-2">
            <h2 className="text-base mb-4">Confirmar cancelamento</h2>
            <p className="text-foreground-light mb-2">
              Tem certeza que deseja cancelar sua inscrição neste curso?
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 max-w-4xl mx-auto p-2">
            <CustomButton
              variant="primary"
              size="lg"
              className="py-6 w-full"
              onClick={() => setShowConfirmation(false)}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              variant="secondary"
              size="lg"
              className="py-6 w-full"
              onClick={handleCancelEnrollment}
              disabled={isDeleting}
            >
              {isDeleting ? 'Cancelando...' : 'Confirmar'}
            </CustomButton>
          </div>
        </BottomSheet>

        {/* Cover image */}
        <CourseHeader course={course} />

        {/* Content area — bottom-sheet visual */}
        <div className="flex flex-col items-center self-stretch rounded-t-2xl bg-background -mt-4 relative z-10">
          {/* Drag indicator */}
          <div className="w-[37px] h-1 rounded-full bg-[#E4E4E4] mt-4 mb-0 shrink-0" />

          <div className="flex flex-col gap-4 px-4 w-full pt-4">
            {/* Title + enrollment deadline — 4px gap between them */}
            <div className="flex flex-col gap-1">
              <h1 className="text-foreground font-medium text-3xl leading-9 tracking-tight">
                {course.title || 'Título não disponível'}
              </h1>
              {enrollmentText && (
                <p className="text-card-2 text-sm font-normal leading-5">
                  {enrollmentText}
                </p>
              )}
            </div>

            {/* Status card */}
            {userEnrollment?.status && (
              <CourseStatusCard
                status={userEnrollment.status as any}
                className="w-full"
                hasCertificate={course.has_certificate}
              />
            )}

            {/* Action buttons for approved/pending - above description */}
            {(userEnrollment?.status === 'approved' ||
              userEnrollment?.status === 'pending') && (
              <div className="w-full">{renderActionButton()}</div>
            )}

            {/* Description */}
            <div>
              {course.description ? (
                <MarkdownRenderer
                  className="text-sm text-foreground-light"
                  content={course.description}
                />
              ) : (
                <div className="text-foreground-light text-base leading-4 md:leading-6">
                  Descrição não disponível
                </div>
              )}
            </div>

            {/* Metadata cards */}
            <CourseMetadata course={course} />

            {/* Offered by card — 8px gap from metadata */}
            <div className="-mt-2">
              <CourseInfo course={course} department={department} />
            </div>

            {/* Enroll button — below "Curso oferecido por", 32px gap */}
            {(!isEnrolled ||
              enrollmentInfo.status === 'certificate_available') && (
              <div className="w-full mt-4">{renderActionButton()}</div>
            )}

            {/* Location / schedule selection */}
            <LocationSelection
              course={course}
              selectedLocationId={selectedLocationId}
              onLocationSelect={handleLocationSelect}
            />
            <OnlineClassSelection
              course={course}
              selectedClassId={selectedClassId}
              onClassSelect={handleClassSelect}
            />

            {/* Extra content sections */}
            <div className="mt-8">
              <CourseContent course={course} />
            </div>

            {/* Bottom action button */}
            {userEnrollment?.status !== 'approved' &&
              userEnrollment?.status !== 'pending' && (
                <div className="w-full pt-4 pb-4">{renderActionButton()}</div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
