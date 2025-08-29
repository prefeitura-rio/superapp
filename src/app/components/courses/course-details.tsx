'use client'

import { deleteEnrollment } from '@/actions/courses/delete-enrollment'
import { ChevronLeftIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { IconButton } from '@/components/ui/custom/icon-button'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserEnrollment {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  course_id: number
}

export function CourseDetails({ 
  course, 
  userEnrollment 
}: { 
  course: any
  userEnrollment: UserEnrollment | null
}) {
  const provider = course.organization
  const cover_image = course.cover_image
  const institutional_logo = course.institutional_logo
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const courseSubscriptionHref = `/servicos/cursos/confirmar-informacoes/${course.id}`

  const handleCancelEnrollment = async () => {
    if (!userEnrollment || isDeleting) return
    
    setIsDeleting(true)
    setError(null)
    
    try {
      const result = await deleteEnrollment(course.id, userEnrollment.id)
      if (result.success) {
      } else {
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

  const isEnrolled = userEnrollment && ['pending', 'approved', 'rejected', 'cancelled'].includes(userEnrollment.status)

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
              Tem certeza que deseja cancelar sua inscrição neste curso? Esta ação não pode ser desfeita.
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

        <div className="h-[320px] md:h-[380px] w-full relative">
          <div className="flex justify-start">
            <IconButton
              icon={ChevronLeftIcon}
              className="top-4 left-4 absolute z-10"
              onClick={() => router.back()}
            />
          </div>
          {cover_image && (
          <Image
            src={course.cover_image || ''}
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

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              {institutional_logo ? (
                <Image
                  src={institutional_logo}
                  alt="provider"
                  width={25}
                  height={25}
                />
              ) : (
                <span className="text-[10px] font-semibold text-foreground uppercase">
                  {provider?.charAt(0)}
                </span>
              )}
            </div>
            <p>{provider || 'Instituição não informada'}</p>
          </div>
        </div>

        <div className="flex justify-between p-4 text-sm">
          <div className="flex gap-4">
            <div>
              <p className="text-muted-foreground">Modalidade</p>
              <p className="font-medium">{course.modalidade || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carga horária</p>
              <p className="font-medium">{course.workload || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Inscrições até</p>
              <p className="font-medium">
                {course.enrollment_end_date ? new Date(course.enrollment_end_date).toLocaleDateString('pt-BR') : 'Não informado'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 w-full max-w-4xl">
          {isEnrolled ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isDeleting}
              className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar inscrição
            </button>
          ) : (
            <Link
              href={courseSubscriptionHref}
              className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none"
            >
              Inscreva-se
            </Link>
          )}
        </div>

        <div className="p-4 text-muted-foreground text-sm leading-relaxed">
          {course.description || 'Descrição não disponível'}
        </div>

        <div className="p-4 space-y-6">
          {course.pre_requisitos && (
            <div>
              <h2 className="text-base font-semibold mb-2">Pré-requisitos</h2>
              <p className="text-sm text-muted-foreground">
                {course.pre_requisitos}
              </p>
            </div>
          )}

          <div>
            <h2 className="text-base font-semibold mb-2">Orientações gerais</h2>
            <p className="text-sm text-muted-foreground">
              A capacitação pode incluir atividades presenciais, e os
              participantes devem seguir todas as orientações enviadas pela
              instituição responsável.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-2">Certificado</h2>
            <p className="text-sm text-muted-foreground">
              {course.has_certificate 
                ? 'Os participantes que concluírem o curso com aproveitamento receberão certificado válido emitido pela instituição promotora.'
                : 'Este curso não oferece certificado.'
              }
            </p>
          </div>
        </div>

        <div className="p-4 w-full max-w-4xl">
          {isEnrolled ? (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isDeleting}
              className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar inscrição
            </button>
          ) : (
            <Link
              href={courseSubscriptionHref}
              className="block w-full py-3 text-center text-foreground rounded-full hover:brightness-90 hover:bg-card transition bg-card outline-none focus:outline-none focus:ring-0 active:outline-none"
            >
              Inscreva-se
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
