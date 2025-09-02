'use client'

import { deleteEnrollment } from '@/actions/courses/delete-enrollment'
import { ChevronLeftIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Separator } from '@/components/ui/separator'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import { getCourseEnrollmentInfo } from '@/lib/course-utils'
import type { UserInfo } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Types
interface UserEnrollment {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  course_id: number
}

interface RemoteClass {
  id: string
  curso_id: number
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  created_at: string
  updated_at: string
}

interface Location {
  id: string
  curso_id: number
  address: string
  neighborhood: string
  vacancies: number
  class_start_date: string
  class_end_date: string
  class_time: string
  class_days: string
  created_at: string
  updated_at: string
}

interface Course {
  id: number
  title: string
  description: string
  enrollment_start_date: string
  enrollment_end_date: string
  organization: string
  modalidade: string
  theme: string
  workload: string
  target_audience: string
  institutional_logo: string
  cover_image: string
  status: string
  has_certificate: boolean
  pre_requisitos?: string
  facilitator?: string
  objectives?: string
  expected_results?: string
  program_content?: string
  methodology?: string
  resources_used?: string
  material_used?: string
  teaching_material?: string
  remote_class?: RemoteClass | null
  locations?: Location[]
}

interface CourseScheduleInfo {
  startDate: string | null
  endDate: string | null
  time: string | null
  days: string | null
  vacancies: number | null
  address: string | null
  neighborhood: string | null
}

interface CourseDetailsProps {
  course: Course
  userEnrollment: UserEnrollment | null
  userInfo: UserInfo
}

// Utility functions
const formatDate = (dateString: string | null): string | null => {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR').replace(/\//g, '.')
  } catch {
    return null
  }
}

const getCourseScheduleInfo = (course: Course): CourseScheduleInfo => {
  const modality = course.modalidade?.toLowerCase()

  // Check for remote/online courses
  if ((modality === 'online' || modality === 'remoto') && course.remote_class) {
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
    const firstLocation = course.locations[0]
    return {
      startDate: firstLocation.class_start_date,
      endDate: firstLocation.class_end_date,
      time: firstLocation.class_time,
      days: firstLocation.class_days,
      vacancies: firstLocation.vacancies,
      address: firstLocation.address,
      neighborhood: firstLocation.neighborhood,
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

// Sub-components
interface InfoRowProps {
  label: string
  value: string | number | null
}

function InfoRow({ label, value }: InfoRowProps) {
  if (!value) return null

  return (
    <div className="flex flex-row items-start justify-start gap-1">
      <div className="text-muted-foreground text-xs md:text-sm">{label}</div>
      <div className="text-xs text-foreground md:text-sm">{value}</div>
    </div>
  )
}

interface CourseHeaderProps {
  course: Course
  onBack: () => void
}

function CourseHeader({ course, onBack }: CourseHeaderProps) {
  const router = useRouter()
  return (
    <div className="h-[320px] md:h-[380px] w-full relative">
      <div className="flex justify-start">
        <IconButton
          icon={ChevronLeftIcon}
          className="top-4 left-4 absolute z-10"
          onClick={() => router.push('/servicos/cursos')}
        />
      </div>
      {course.cover_image && (
        <Image
          src={course.cover_image}
          alt={course.title || ''}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        <span className="text-white/80 text-sm capitalize">
          {course.theme || 'Curso'}
        </span>
        <h1 className="text-white font-bold text-2xl md:text-3xl leading-snug">
          {course.title || 'Título não disponível'}
        </h1>
      </div>
    </div>
  )
}

interface CourseInfoProps {
  course: Course
}

function CourseInfo({ course }: CourseInfoProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          {course.institutional_logo ? (
            <Image
              src={course.institutional_logo}
              alt="provider"
              width={25}
              height={25}
            />
          ) : (
            <span className="text-2.5 font-semibold text-foreground uppercase">
              {course.organization?.charAt(0)}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm">
          {course.organization || 'Instituição não informada'}
        </p>
      </div>
    </div>
  )
}

interface CourseMetadataProps {
  course: Course
}

function CourseMetadata({ course }: CourseMetadataProps) {
  return (
    <div className="flex justify-between px-4 pt-4 text-xs md:text-sm">
      <div className="flex gap-4">
        <div>
          <p className="text-muted-foreground">Modalidade</p>
          <p className="font-medium">{course.modalidade || 'Não informado'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Carga horária</p>
          <p className="font-medium">{course.workload || 'Não informado'}</p>
        </div>
        {course.enrollment_end_date && (
          <div>
            <p className="text-muted-foreground">Inscrições até</p>
            <p className="font-medium">
              {new Date(course.enrollment_end_date)
                .toLocaleDateString('pt-BR')
                .replace(/\//g, '.')}
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
      <InfoRow label="Horário" value={scheduleInfo.time} />
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

interface CourseContentProps {
  course: Course
}

function CourseContent({ course }: CourseContentProps) {
  const contentSections = [
    {
      key: 'pre_requisitos',
      title: 'Pré-requisitos para obtenção do certificado',
    },
    { key: 'facilitator', title: 'Facilitador' },
    { key: 'objectives', title: 'Objetivos da capacitação' },
    { key: 'expected_results', title: 'Resultados esperados' },
    { key: 'program_content', title: 'Conteúdo programático' },
    { key: 'methodology', title: 'Metodologia' },
    { key: 'resources_used', title: 'Recursos utilizados' },
    { key: 'material_used', title: 'Material utilizado' },
    { key: 'teaching_material', title: 'Material didático' },
  ]

  const renderContentWithLineBreaks = (content: string) => {
    const parts = content
      .split(';')
      .map(part => part.trim())
      .filter(part => part.length > 0)

    if (parts.length === 1) {
      return (
        <p className="text-xs md:text-sm text-muted-foreground">{content}</p>
      )
    }

    return (
      <div className="text-xs md:text-sm text-muted-foreground">
        {parts.map((part, index) => (
          <p key={index} className={index > 0 ? 'mt-1' : ''}>
            {part}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 space-y-6">
      {contentSections.map(({ key, title }) => {
        const content = course[key as keyof Course] as string
        if (!content) return null

        return (
          <div key={key}>
            <h2 className="text-sm md:text-base leading-4 font-semibold mb-2">
              {title}
            </h2>
            {renderContentWithLineBreaks(content)}
          </div>
        )
      })}

      {/* <div>
        <h2 className="text-sm font-semibold mb-2">Certificado</h2>
        <p className="text-xs md:text-sm text-muted-foreground">
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
}: CourseDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const enrollmentInfo = getCourseEnrollmentInfo(course as any)
  const scheduleInfo = getCourseScheduleInfo(course)

  const courseSubscriptionHref = userInfo.cpf
    ? `/servicos/cursos/confirmar-informacoes/${course.id}`
    : `${REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}`

  const handleCancelEnrollment = async () => {
    if (!userEnrollment || isDeleting) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteEnrollment(course.id, userEnrollment.id)
      if (!result.success) {
        setError(result.error || 'Falha ao cancelar inscrição')
        console.error('Failed to cancel enrollment:', result.error)
      }
    } catch (error) {
      const errorMessage = 'Erro ao cancelar inscrição. Tente novamente.'
      setError(errorMessage)
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
    const buttonClasses =
      'block text-sm w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

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

    return (
      <Link href={courseSubscriptionHref} className={buttonClasses}>
        {enrollmentInfo.buttonText}
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-3xl">
        {/* Error message */}
        {error && (
          <div className="p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Confirmation Bottom Sheet */}
        <BottomSheet
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          title="Confirmar cancelamento"
          headerClassName="text-center p-0 mb-6"
        >
          <div className="text-center p-4">
            <h2 className="text-md mb-4">Confirmar cancelamento</h2>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja cancelar sua inscrição neste curso?
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 max-w-4xl mx-auto p-4">
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

        <CourseHeader course={course} onBack={() => router.back()} />
        <CourseInfo course={course} />
        <CourseMetadata course={course} />

        <div className="px-4 py-8 pb-0 text-muted-foreground text-xs md:text-base leading-4 md:leading-6">
          {course.description || 'Descrição não disponível'}
        </div>

        {!isEnrolled && (
          <div className="px-4 pb-2 py-8 w-full max-w-4xl">
            {renderActionButton()}
          </div>
        )}

        <Separator className="my-6 max-w-[90%] md:max-w-[96%] mx-auto" />

        <CourseSchedule scheduleInfo={scheduleInfo} />

        <Separator className="my-6 max-w-[90%] md:max-w-[96%] mx-auto" />

        <CourseContent course={course} />

        <div className="p-4 w-full max-w-4xl pt-8">{renderActionButton()}</div>
      </div>
    </div>
  )
}
