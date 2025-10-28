'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
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
    <div className="flex flex-col gap-3">
      {certificates.map(certificate => (
        <button
          type="button"
          key={certificate.id}
          onClick={() => handleCourseClick(certificate)}
          className={cn(
            'flex items-center gap-4 rounded-lg p-3 bg-background  transition cursor-pointer group w-full text-left'
          )}
        >
          <div className="relative w-30 h-30 overflow-hidden rounded-xl flex-shrink-0">
            <Image
              src={certificate.imageUrl || ''}
              alt={certificate.title}
              fill
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              {certificate.institutionalLogo ? (
                <Image
                  src={certificate.institutionalLogo}
                  alt="provider"
                  width={15}
                  height={15}
                />
              ) : (
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {certificate.provider?.charAt(0) || 'C'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-foreground mb-2">
              {certificate.title}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {certificate.modalidade} • {certificate.workload}
            </p>
            <Badge
              className={cn(
                'inline-block px-3 text-xs font-normal rounded-full w-fit border',
                getCertificateStatusColor(certificate.status)
              )}
            >
              {getCertificateStatusText(certificate.status)}
            </Badge>
          </div>
        </button>
      ))}

      {/* Bottom Sheets */}
      <CoursesCertifiedDrawer
        open={openCertified}
        onOpenChange={setOpenCertified}
        courseTitle={selectedCourse?.title || ''}
        studentName={selectedCourse?.studentName || ''}
        courseDuration={selectedCourse?.courseDuration || ''}
        issuingOrganization={selectedCourse?.issuingOrganization || ''}
        provider={selectedCourse?.provider || ''}
        certificateUrl={selectedCourse?.certificateUrl}
      />
      <CoursesUnavailableDrawer
        open={openUnavailable}
        onOpenChange={setOpenUnavailable}
      />
    </div>
  )
}
