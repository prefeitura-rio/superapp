'use client'

import { MyCertificatesCard } from '@/app/components/courses/certified-card'
import { useUserEnrollments } from '@/hooks/courses/use-user-enrollments'
import { useMemo } from 'react'

interface CertificatesContentProps {
  autoOpenCourseId?: string
  studentName: string
}

export function CertificatesContent({
  autoOpenCourseId,
  studentName,
}: CertificatesContentProps) {
  const { data: enrollmentsData, isLoading } = useUserEnrollments()

  const certificates = useMemo(() => {
    const enrollments = enrollmentsData?.enrollments || []
    return enrollments
      .filter(
        (enrollment: any) =>
          (enrollment.status === 'concluded' ||
            enrollment.status === 'approved') &&
          enrollment.curso.has_certificate === true
      )
      .map((enrollment: any) => ({
        ...enrollment.curso,
        id: enrollment.course_id,
        title: enrollment.curso?.title || 'Curso',
        description: enrollment.curso?.description,
        imageUrl: enrollment.curso?.cover_image,
        institutionalLogo: enrollment.curso?.institutional_logo,
        provider: enrollment.curso?.organization,
        orgao_id: enrollment.curso?.orgao_id,
        status:
          enrollment.status === 'concluded'
            ? 'certificate_available'
            : 'certificate_pending',
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.enrolled_at,
        updatedAt: enrollment.updated_at,
        certificateUrl: enrollment.certificate_url,
        modalidade: enrollment.curso?.modalidade,
        workload: enrollment.curso?.workload,
        hasCertificate: enrollment.curso?.has_certificate === true,
        studentName,
        courseDuration: enrollment.curso?.workload || 'Duração não informada',
        issuingOrganization: enrollment.curso?.organization || '',
      }))
      .filter((course: any) => course.id)
  }, [enrollmentsData, studentName])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="flex items-center gap-3 py-4 animate-pulse"
          >
            <div className="w-24 h-24 rounded-xl bg-card shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-card rounded w-3/4" />
              <div className="h-4 bg-card rounded w-1/2" />
              <div className="h-6 bg-card rounded-full w-24 mt-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="overflow-hidden mt-20 px-4 flex justify-center items-center">
        <p className="block text-lg text-muted-foreground text-center">
          Você ainda não possui nenhum certificado.
        </p>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden mt-16 px-4">
      <h1 className="text-base font-medium text-foreground">Certificados</h1>
      <MyCertificatesCard
        certificates={certificates}
        autoOpenCourseId={autoOpenCourseId}
      />
    </div>
  )
}
