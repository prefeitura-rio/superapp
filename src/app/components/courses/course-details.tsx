'use client'

import { deleteEnrollment } from '@/actions/courses/delete-enrollment'
import { CalendarIcon, ChevronLeftIcon, MapPinIcon } from '@/assets/icons'
import { CourseStatusCard } from './course-status-card'

import { MarkdownRenderer } from '@/app/(app)/(logged-in-out)/servicos/categoria/[category-slug]/[...service-params]/(service-detail)/components/markdown-renderer'
import { ClockIcon } from '@/assets/icons/clock-icon'
import { CycleIcon } from '@/assets/icons/cycle-icon'
import { GroupIcon } from '@/assets/icons/group-icon'
import { PersonIcon } from '@/assets/icons/person-icon'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Separator } from '@/components/ui/separator'
import type { ModelsDepartmentResponse } from '@/http/models'
import {
  getCourseEnrollmentInfo,
  normalizeModalityDisplay,
} from '@/lib/course-utils'
import { formatDate, formatTimeRange } from '@/lib/date'
import type { UserInfo } from '@/lib/user-info'
import { getBackRoute } from '@/lib/utils'
import type { Course, CourseScheduleInfo, UserEnrollment } from '@/types'
import {
  shouldShowExternalPartnerBadge,
  shouldShowExternalPartnerModal,
} from '@/types/course'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ExternalPartnerCourseDrawer } from '../drawer-contents/external-partner-course-drawer'
import { AccessibilityBadge, IsExternalPartnerBadge } from './badges'

interface CourseDetailsProps {
  course: Course
  userEnrollment: UserEnrollment | null
  userInfo: UserInfo
  department: ModelsDepartmentResponse | null
}

// Utility functions

const getCourseScheduleInfo = (
  course: Course,
  selectedLocationId?: string,
  selectedScheduleId?: string
): CourseScheduleInfo => {
  const modality = course.modalidade?.toLowerCase()

  // Check for remote/online courses with multiple schedules
  if ((modality === 'online' || modality === 'remoto') && course.remote_class) {
    // If there are multiple schedules, find the selected one
    if (
      course.remote_class.schedules &&
      course.remote_class.schedules.length > 0
    ) {
      const selectedSchedule = selectedScheduleId
        ? course.remote_class.schedules.find(
            sch => sch.id === selectedScheduleId
          ) || course.remote_class.schedules[0]
        : course.remote_class.schedules[0]

      if (selectedSchedule) {
        return {
          startDate: selectedSchedule.class_start_date,
          endDate: selectedSchedule.class_end_date,
          time: selectedSchedule.class_time,
          days: selectedSchedule.class_days,
          vacancies: selectedSchedule.vacancies,
          address: null,
          neighborhood: null,
        }
      }
    }
    // Legacy structure: single remote_class
    return {
      startDate: course.remote_class.class_start_date,
      endDate: course.remote_class.class_end_date,
      time: course.remote_class.class_time,
      days: course.remote_class.class_days,
      vacancies: course.remote_class.vacancies,
      address: null,
      neighborhood: null,
    }
  }

  // Check for presencial/semipresencial courses
  if (
    (modality === 'presencial' || modality === 'semipresencial') &&
    course.locations &&
    course.locations.length > 0
  ) {
    // Find selected location or use first one
    const location = selectedLocationId
      ? course.locations.find(loc => loc.id === selectedLocationId) ||
        course.locations[0]
      : course.locations[0]

    // Find selected schedule or use first one
    const schedule =
      selectedScheduleId && location.schedules
        ? location.schedules.find(sch => sch.id === selectedScheduleId) ||
          location.schedules[0]
        : location.schedules?.[0]

    if (schedule) {
      return {
        startDate: schedule.class_start_date,
        endDate: schedule.class_end_date,
        time: schedule.class_time,
        days: schedule.class_days,
        vacancies: schedule.vacancies,
        address: location.address,
        neighborhood: location.neighborhood,
      }
    }
  }

  return {
    startDate: null,
    endDate: null,
    time: null,
    days: null,
    vacancies: null,
    address: null,
    neighborhood: null,
  }
}

// Format date or return fallback text
function formatDateOrFallback(dateString: string | null | undefined): string {
  const formatted = formatDate(dateString ?? null)
  return formatted || 'Data não informada'
}

// Sub-components
interface InfoRowProps {
  label: string
  value: string | number | null
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null

  return (
    <div className="flex flex-row items-start justify-start gap-1">
      <div className="text-foreground-light text-xs md:text-sm">{label}</div>
      <div className="text-xs text-foreground md:text-sm">{value}</div>
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

    // If previous route contains "confirmar-informacoes", go to courses list
    if (previousRoute && previousRoute.includes('confirmar-informacoes')) {
      router.push('/servicos/cursos/')
      return
    }

    const backRoute = getBackRoute('/servicos/cursos/')
    router.push(backRoute)
  }
  return (
    <div className="h-[320px] md:h-[380px] w-full relative">
      <div className="flex justify-start">
        <IconButton
          icon={ChevronLeftIcon}
          className="top-4 left-4 absolute z-10"
          onClick={handleBack}
        />
      </div>
      {course.cover_image && (
        <>
          <Image
            src={course.cover_image}
            alt={course.title || ''}
            fill
            className="object-cover"
          />
          <div className="absolute top-6 right-2 flex flex-col gap-1">
            {course.accessibility && (
              <AccessibilityBadge accessibility={course.accessibility} />
            )}
            {shouldShowExternalPartnerBadge(course.course_management_type) && (
              <IsExternalPartnerBadge />
            )}
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <h1 className="text-white font-bold text-2xl md:text-3xl leading-snug">
          {course.title || 'Título não disponível'}
        </h1>
      </div>
    </div>
  )
}

interface CourseInfoProps {
  course: Course
  department: ModelsDepartmentResponse | null
}

function CourseInfo({ course, department }: CourseInfoProps) {
  // Use department data if available, otherwise fall back to course.organization
  const organizationName =
    department?.nome_ua || course.organization || 'Instituição não informada'
  const organizationInitial = organizationName.charAt(0)

  // Mobile: sigla_ua, Desktop: nome_ua
  const mobileName =
    department?.sigla_ua || course.organization || 'Instituição não informada'
  const desktopName =
    department?.nome_ua || course.organization || 'Instituição não informada'

  return (
    <div className="flex p-4 gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden">
          {course.institutional_logo ? (
            <Image
              src={course.institutional_logo}
              alt="Logo da instituição"
              className="w-full h-full object-cover rounded-full"
              width={40}
              height={40}
            />
          ) : (
            <span className="text-2.5 font-semibold text-foreground uppercase">
              {organizationInitial}
            </span>
          )}
        </div>
        <p className="text-sm block sm:hidden">{mobileName}</p>
        <p className="text-sm hidden sm:block">{desktopName}</p>
      </div>

      {shouldShowExternalPartnerBadge(course.course_management_type) && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden">
            {course.external_partner_logo_url ? (
              <Image
                src={course.external_partner_logo_url}
                alt="Logo do parceiro"
                className="w-full h-full object-cover rounded-full"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-2.5 font-semibold text-foreground uppercase">
                {course.external_partner_name?.charAt(0)}
              </span>
            )}
          </div>
          <p className="text-sm">
            {course.external_partner_name || 'Parceiro não informado'}
          </p>
        </div>
      )}
    </div>
  )
}

interface CourseMetadataProps {
  course: Course
}

function CourseMetadata({ course }: CourseMetadataProps) {
  return (
    <div className="flex justify-between px-4 text-sm">
      <div className="flex gap-4">
        <div>
          <p className="text-foreground-light">Modalidade</p>
          <p className="font-normal">
            {course.modalidade === 'LIVRE_FORMACAO_ONLINE'
              ? 'Remoto'
              : normalizeModalityDisplay(course.modalidade) || 'Não informado'}
          </p>
        </div>
        <div>
          <p className="text-foreground-light">Carga horária</p>
          <p className="font-normal">{course.workload || 'Não informado'}</p>
        </div>
        {course.enrollment_end_date && (
          <div>
            <p className="text-foreground-light">Inscrições até</p>
            <p className="font-normal">
              {formatDate(course.enrollment_end_date)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CourseScheduleProps {
  scheduleInfo: CourseScheduleInfo
}

function CourseSchedule({ scheduleInfo }: CourseScheduleProps) {
  return (
    <div className="flex flex-col items-start px-4 gap-2">
      <InfoRow label="Data início" value={formatDate(scheduleInfo.startDate)} />
      <InfoRow label="Data final" value={formatDate(scheduleInfo.endDate)} />
      <InfoRow label="Horário" value={formatTimeRange(scheduleInfo.time)} />
      <InfoRow label="Dias de aula" value={scheduleInfo.days} />
      <InfoRow label="Vagas" value={scheduleInfo.vacancies} />
      {scheduleInfo.address && (
        <InfoRow
          label="Endereço"
          value={`${scheduleInfo.address}${
            scheduleInfo.neighborhood ? ` - ${scheduleInfo.neighborhood}` : ''
          }`}
        />
      )}
    </div>
  )
}

interface OnlineClassSelectionProps {
  course: Course
  selectedClassId: string | null
  onClassSelect: (classId: string) => void
}

function OnlineClassSelection({
  course,
  selectedClassId,
  onClassSelect,
}: OnlineClassSelectionProps) {
  const modality = course.modalidade?.toLowerCase()

  // Only show for online/remote courses with multiple schedules
  if (modality !== 'online' && modality !== 'remoto') {
    return null
  }

  if (
    !course.remote_class?.schedules ||
    course.remote_class.schedules.length === 0
  ) {
    return null
  }

  const onlineClasses = course.remote_class.schedules
  const hasMultipleClasses = onlineClasses.length > 1

  // If only one class, don't show selection but show the class info
  if (!hasMultipleClasses) {
    const singleClass = onlineClasses[0]
    return (
      <div className="space-y-4">
        <div className="pt-12 px-4 space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground-light">
              <GroupIcon />
              <span>Turma</span>
            </div>
            <div className="space-y-2.5 text-sm text-foreground-light">
              <div className="flex items-center gap-3">
                <CalendarIcon />
                <span>Data início</span>
                <span className="text-foreground">
                  {formatDate(singleClass.class_start_date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon />
                <span>Data final</span>
                <span className="text-foreground">
                  {formatDate(singleClass.class_end_date)}
                </span>
              </div>
              {singleClass.class_days && (
                <div className="flex items-center gap-3">
                  <CycleIcon />
                  <span>Dias de aula</span>
                  <span className="text-foreground">
                    {singleClass.class_days}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <PersonIcon />
                <span>Vagas</span>
                <span className="text-foreground">{singleClass.vacancies}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedClass =
    onlineClasses.find(cls => cls.id === selectedClassId) || onlineClasses[0]

  return (
    <div className="space-y-4">
      {/* Class Icon Label */}
      <div className="pt-12 px-4 flex items-center gap-2 text-foreground-light text-sm">
        <GroupIcon />
        <span>Selecione a turma</span>
      </div>

      {/* Horizontal Scrollable Class Cards */}
      <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-3 pl-4 pb-2">
          {onlineClasses.map((onlineClass, index) => (
            <button
              type="button"
              key={onlineClass.id}
              onClick={() => onClassSelect(onlineClass.id)}
              className={`flex-shrink-0 w-[280px] p-4 rounded-lg border-1 text-left transition-all hover:border-muted-foreground hover:bg-secondary ${
                selectedClassId === onlineClass.id
                  ? 'border-muted-foreground bg-secondary'
                  : 'border-none bg-card cufrsor-pointer'
              }`}
            >
              <h4 className="font-medium text-foreground text-sm md:text-sm line-clamp-2">
                Turma {index + 1}
              </h4>
              <p className="text-xs md:text-sm text-foreground-light mt-1">
                {!onlineClass.class_start_date && !onlineClass.class_end_date
                  ? 'Datas a serem definidas'
                  : `${formatDateOrFallback(onlineClass.class_start_date)} - ${formatDateOrFallback(onlineClass.class_end_date)}`}
              </p>
            </button>
          ))}
          {/* Spacer for right padding in horizontal scroll */}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Separator */}
      <Separator className="max-w-[90%] md:max-w-[96%] mx-auto" />

      {/* Class Information with Icons */}
      {selectedClass && (
        <div className="px-4 space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground-light">
              <GroupIcon />
              <span className="flex flex-row gap-3">
                Turma{' '}
                <span className="text-foreground block">
                  {onlineClasses.findIndex(cls => cls.id === selectedClass.id) +
                    1}
                </span>
              </span>
            </div>

            {/* Class Details with Icons */}
            <div className="space-y-2.5 text-sm text-foreground-light">
              {/* Data início */}
              {selectedClass.class_start_date && (
                <div className="flex items-center gap-3">
                  <CalendarIcon />
                  <span>Data início</span>
                  <span className="text-foreground">
                    {formatDate(selectedClass.class_start_date)}
                  </span>
                </div>
              )}

              {/* Data final */}
              {selectedClass.class_end_date && (
                <div className="flex items-center gap-3">
                  <CalendarIcon />
                  <span>Data final</span>
                  <span className="text-foreground">
                    {formatDate(selectedClass.class_end_date)}
                  </span>
                </div>
              )}

              {/* Dias de aula */}
              {selectedClass.class_days && (
                <div className="flex items-center gap-3">
                  <CycleIcon />
                  <span>Dias de aula</span>
                  <span className="text-foreground">
                    {selectedClass.class_days}
                  </span>
                </div>
              )}

              {/* Vagas */}
              <div className="flex items-center gap-3">
                <PersonIcon />
                <span>Vagas</span>
                <span className="text-foreground">
                  {selectedClass.vacancies}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
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

  // Only show for presencial/semipresencial courses
  if (modality !== 'presencial' && modality !== 'semipresencial') {
    return null
  }

  if (!course.locations || course.locations.length === 0) {
    return null
  }

  const selectedLocation = course.locations.find(
    loc => loc.id === selectedLocationId
  )

  const hasMultipleSchedules =
    selectedLocation &&
    selectedLocation.schedules &&
    selectedLocation.schedules.length > 1

  const hasMultipleLocations = course.locations.length > 1

  return (
    <div className="space-y-4">
      {/* Location Icon Label */}
      <div className="pt-12 px-4 flex items-center gap-2 text-foreground-light text-sm">
        <MapPinIcon />
        <span>{hasMultipleLocations ? 'Selecione a unidade' : 'Unidade'}</span>
      </div>

      {/* Horizontal Scrollable Location Cards */}
      <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-3 pl-4 pb-2">
          {course.locations.map(location => (
            <button
              type="button"
              key={location.id}
              onClick={() => onLocationSelect(location.id)}
              className={`flex-shrink-0 w-[280px] p-4 rounded-lg border-1 text-left transition-all hover:border-muted-foreground hover:bg-secondary ${
                selectedLocationId === location.id
                  ? 'border-muted-foreground bg-secondary'
                  : 'border-none bg-card cursor-pointer'
              }`}
            >
              <h4 className="font-medium text-foreground text-sm md:text-sm line-clamp-2">
                {location.address}
              </h4>
              <p className="text-xs md:text-sm text-foreground-light mt-1">
                {location.neighborhood}
              </p>
            </button>
          ))}
          {/* Spacer for right padding in horizontal scroll */}
          <div className="flex-shrink-0 w-4" aria-hidden="true" />
        </div>
      </div>

      {/* Separator */}
      <Separator className="max-w-[90%] md:max-w-[96%] mx-auto" />

      {/* Schedule Information with Icons */}
      {selectedLocation?.schedules && selectedLocation.schedules.length > 0 && (
        <div className="px-4 space-y-4 text-sm">
          {selectedLocation.schedules.map((schedule, index) => (
            <div key={schedule.id} className="w-full">
              <div className="space-y-3">
                {/* Show "Turma n" only if there are multiple schedules */}
                {hasMultipleSchedules && (
                  <div className="flex items-center gap-3  text-foreground-light">
                    <GroupIcon />
                    <span className="flex flex-row gap-3">
                      Turma{' '}
                      <span className="text-foreground block">{index + 1}</span>
                    </span>
                  </div>
                )}

                {/* Schedule Details with Icons */}
                <div className="space-y-2.5 text-sm text-foreground-light">
                  {/* Data início */}
                  <div className="flex items-center gap-3">
                    <CalendarIcon />
                    <span>Data início</span>
                    <span className="text-foreground">
                      {formatDate(schedule.class_start_date)}
                    </span>
                  </div>

                  {/* Data final */}
                  <div className="flex items-center gap-3">
                    <CalendarIcon />
                    <span>Data final</span>
                    <span className="text-foreground">
                      {formatDate(schedule.class_end_date)}
                    </span>
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-3">
                    <ClockIcon />
                    <span>Horário</span>
                    <span className="text-foreground">
                      {formatTimeRange(schedule.class_time)}
                    </span>
                  </div>

                  {/* Dias de aula */}
                  {schedule.class_days && (
                    <div className="flex items-center gap-3">
                      <CycleIcon />
                      <span>Dias de aula</span>
                      <span className="text-foreground">
                        {schedule.class_days}
                      </span>
                    </div>
                  )}

                  {/* Vagas */}
                  <div className="flex items-center gap-3">
                    <PersonIcon />
                    <span>Vagas</span>
                    <span className="text-foreground">
                      {schedule.vacancies}
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator between schedules (only if there are multiple schedules and not the last one) */}
              {hasMultipleSchedules &&
                index < selectedLocation.schedules.length - 1 && (
                  <Separator className="mt-4" />
                )}
            </div>
          ))}
        </div>
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
export function CourseDetails({
  course,
  userEnrollment,
  userInfo,
  department,
}: CourseDetailsProps) {
  const router = useRouter()
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
        <CourseHeader course={course} />
        <CourseInfo course={course} department={department} />
        <CourseMetadata course={course} />
        {userEnrollment?.status && (
          <CourseStatusCard
            status={userEnrollment.status as any}
            className="mx-4"
          />
        )}
        <div className="px-4 py-6 pb-0">
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
        {(!isEnrolled || enrollmentInfo.status === 'certificate_available') && (
          <div className="px-4 pb-2 py-8 w-full max-w-4xl">
            {renderActionButton()}
          </div>
        )}
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
        <div className="my-12" />
        <CourseContent course={course} />
        <div className="p-4 w-full max-w-4xl pt-8">{renderActionButton()}</div>
      </div>
    </div>
  )
}
