'use client'

import { deleteEnrollment } from '@/actions/courses/delete-enrollment'
import { ChevronLeftIcon } from '@/assets/icons'
import { CourseStatusCard } from './course-status-card'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import { Separator } from '@/components/ui/separator'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import { getCourseEnrollmentInfo } from '@/lib/course-utils'
import { formatDate, formatTimeRange } from '@/lib/date'
import type { UserInfo } from '@/lib/user-info'
import type { Course, CourseScheduleInfo, UserEnrollment } from '@/types'
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
}

// Utility functions

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
  onBack?: () => void
}

function CourseHeader({ course, onBack }: CourseHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }
    router.push('/servicos/cursos/')
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
            {course.is_external_partner && <IsExternalPartnerBadge />}
          </div>
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
        {course.theme && (
          <span className="text-white/80 text-sm capitalize">
            {course.theme}
          </span>
        )}
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
              {course.organization?.charAt(0)}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm">
          {course.organization || 'Instituição não informada'}
        </p>
      </div>

      {course.is_external_partner && (
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
          <p className="text-xs md:text-sm">
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
    <div className="flex justify-between px-4 text-xs md:text-sm">
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
      <InfoRow label="Horário" value={formatTimeRange(scheduleInfo.time!)} />
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
    { key: 'target_audience', title: 'Público-alvo' },
  ]

  return (
    <div className="px-4 space-y-6">
      {contentSections.map(({ key, title }) => {
        const content = course[key as keyof Course] as string
        if (!content) return null

        return (
          <div key={key} className="whitespace-pre-line">
            <h2 className="text-sm md:text-base leading-4 font-semibold mb-2">
              {title}
            </h2>
            <div className="text-xs md:text-sm text-muted-foreground">
              {content}
            </div>
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isExternalDrawerOpen, setIsExternalDrawerOpen] = useState(false)

  const enrollmentInfo = getCourseEnrollmentInfo(
    course as any,
    userEnrollment as any
  )
  const scheduleInfo = getCourseScheduleInfo(course)

  const courseSubscriptionHref = userInfo.cpf
    ? `/servicos/cursos/confirmar-informacoes/${course.id}`
    : `${REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}`

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
    const buttonClasses =
      'block text-sm md:text-base w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

    // Handle certificate available status
    if (enrollmentInfo.status === 'certificate_available') {
      return (
        <Link href="/servicos/cursos/certificados" className={buttonClasses}>
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

    if (course.is_external_partner && course.external_partner_url) {
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
      <Link href={courseSubscriptionHref} className={buttonClasses}>
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
            <p className="text-muted-foreground mb-2">
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
        <CourseInfo course={course} />
        <CourseMetadata course={course} />
        {userEnrollment?.status && (
          <CourseStatusCard
            status={userEnrollment.status as any}
            className="mx-4"
          />
        )}
        <div className="px-4 py-6 pb-0 text-muted-foreground text-xs md:text-base leading-4 md:leading-6 whitespace-pre-line">
          {course.description || 'Descrição não disponível'}
        </div>
        {(!isEnrolled || enrollmentInfo.status === 'certificate_available') && (
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
