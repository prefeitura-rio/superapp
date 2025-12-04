'use client'

import { Badge } from '@/components/ui/badge'
import { normalizeModalityDisplay } from '@/lib/course-utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import {
  CoursesCertifiedDrawer,
  CoursesUnavailableDrawer,
} from '../drawer-contents/courses-certified-drawers'

interface Certificate {
  id: number
  title: string
  description?: string
  imageUrl?: string
  provider?: string
  orgao_id?: string
  status: string
  enrollmentId: string
  certificateUrl?: string
  enrolledAt: string
  updatedAt: string
  modalidade?: string
  workload?: string
  institutionalLogo?: string
  hasCertificate: boolean
  // Dados necessários para geração do certificado
  studentName: string
  courseDuration: string
  issuingOrganization: string
}

interface MyCertificatesCardProps {
  certificates: Certificate[]
  autoOpenCourseId?: string
}

function getCertificateStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'certificate_available':
      return 'bg-card-3 text-background dark:text-white'
    case 'certificate_pending':
      return 'bg-secondary text-foreground dark:text-white'
    default:
      return 'bg-secondary text-foreground dark:text-white'
  }
}

function getCertificateStatusText(status: string) {
  switch (status.toLowerCase()) {
    case 'certificate_available':
      return 'Certificado disponível'
    case 'certificate_pending':
      return 'Aguardando certificado'
    default:
      return 'Certificado indisponível'
  }
}

export function MyCertificatesCard({
  certificates,
  autoOpenCourseId,
}: MyCertificatesCardProps) {
  const [openCertified, setOpenCertified] = useState(false)
  const [openUnavailable, setOpenUnavailable] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Certificate | null>(null)

  // Auto-open modal if courseId is provided
  useEffect(() => {
    if (autoOpenCourseId) {
      const courseToOpen = certificates.find(
        cert => cert.id.toString() === autoOpenCourseId
      )
      if (courseToOpen) {
        setSelectedCourse(courseToOpen)
        if (courseToOpen.status === 'certificate_available') {
          setOpenCertified(true)
        } else if (courseToOpen.status === 'certificate_pending') {
          setOpenUnavailable(true)
        }
      }
    }
  }, [autoOpenCourseId, certificates])

  const handleCourseClick = (certificate: Certificate) => {
    if (certificate.status === 'certificate_available') {
      setSelectedCourse(certificate)
      setOpenCertified(true)
    } else if (certificate.status === 'certificate_pending') {
      setOpenUnavailable(true)
    }
  }

  return (
    <div className="flex flex-col">
      {certificates.map((certificate, index) => (
        <div key={certificate.id}>
          <button
            type="button"
            onClick={() => handleCourseClick(certificate)}
            className="flex items-center gap-3 rounded-lg py-4 bg-background transition cursor-pointer group w-full text-left"
          >
            <div className="relative w-30 h-30 overflow-hidden rounded-xl">
              {certificate.imageUrl ? (
                <Image
                  src={certificate.imageUrl}
                  alt={certificate.title}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-medium">
                    {certificate.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full  flex items-center justify-center shadow-sm">
                {certificate.institutionalLogo ? (
                  <Image
                    src={certificate.institutionalLogo}
                    alt="institutional logo"
                    width={36}
                    height={36}
                    className="object-contain rounded-full"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-[10px] font-semibold text-foreground uppercase">${certificate.provider?.charAt(0) || 'C'}</span>`
                      }
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-foreground uppercase">
                    {certificate.provider?.charAt(0) || 'C'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0 items-start">
              <p className="text-sm font-medium line-clamp-2 leading-snug text-foreground mb-2 text-left">
                {certificate.title}
              </p>
              <p className="text-xs text-muted-foreground mb-2 text-left">
                {normalizeModalityDisplay(certificate.modalidade)} •{' '}
                {certificate.workload}
              </p>
              <Badge
                className={cn(
                  'inline-block px-3 py-1 text-xs font-medium rounded-full w-fit self-start border',
                  getCertificateStatusColor(certificate.status)
                )}
              >
                {getCertificateStatusText(certificate.status)}
              </Badge>
            </div>
          </button>
          {index < certificates.length - 1 && (
            <div className="h-[1px] bg-border" />
          )}
        </div>
      ))}

      {/* Bottom Sheets */}
      <CoursesCertifiedDrawer
        open={openCertified}
        onOpenChange={setOpenCertified}
        courseTitle={selectedCourse?.title || ''}
        studentName={selectedCourse?.studentName || ''}
        courseDuration={selectedCourse?.courseDuration || ''}
        issuingOrganization={selectedCourse?.issuingOrganization || ''}
        orgao_id={selectedCourse?.orgao_id}
        certificateUrl={selectedCourse?.certificateUrl}
      />
      <CoursesUnavailableDrawer
        open={openUnavailable}
        onOpenChange={setOpenUnavailable}
      />
    </div>
  )
}
