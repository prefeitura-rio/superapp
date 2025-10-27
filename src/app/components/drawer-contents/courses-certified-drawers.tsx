'use client'

import { DownloadIcon, EyeIcon, PrinterIcon, ShareIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import {
  formatDate,
  generateAndDownload,
  generateCertificate,
} from '@/lib/certificate-generator'
import type { CertificateData } from '@/types/certificate'
import { useState } from 'react'
import { CertificateMenuItem } from './certificate-menu-item'

interface CoursesCertifiedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle: string
  studentName: string
  courseDuration: string
  issuingOrganization: string
}

interface CoursesUnavailableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoursesCertifiedDrawer({
  open,
  onOpenChange,
  courseTitle,
  studentName,
  courseDuration,
  issuingOrganization,
}: CoursesCertifiedDrawerProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const getCertificateData = (): CertificateData => {
    const data = {
      studentName,
      courseTitle,
      courseDuration,
      issuingOrganization,
      issueDate: formatDate(new Date()),
    }

    // Log para debug
    console.log('Dados do certificado:', data)

    return data
  }

  const handleDownload = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      await generateAndDownload(certificateData, {
        fileName: `${courseTitle}-certificado.pdf`,
        download: true,
      })
    } catch (error) {
      console.error('Erro ao gerar certificado:', error)
      // Aqui você pode adicionar um toast de erro
    } finally {
      setIsGenerating(false)
    }
  }

  const handleView = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um blob e abre em nova aba
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const newWindow = window.open(url, '_blank')
      if (newWindow) {
        newWindow.onload = () => {
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Erro ao visualizar certificado:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um arquivo para compartilhar
      const file = new File([pdfBytes], `${courseTitle}-certificado.pdf`, {
        type: 'application/pdf',
      })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Certificado: ${courseTitle}`,
          text: `Confira meu certificado de conclusão do curso: ${courseTitle}`,
          files: [file],
        })
      } else {
        // Fallback: gera e faz download
        await handleDownload()
      }
    } catch (error) {
      console.error('Erro ao compartilhar certificado:', error)
      // Fallback para download
      await handleDownload()
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um blob e abre para impressão
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Erro ao imprimir certificado:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={courseTitle}
      headerClassName="text-left p-0 mb-6"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-2 pt-5 font-medium leading-6 text-popover-foreground">
            Parabéns! Você concluiu o curso e já pode baixar o seu certificado.
          </h2>
          <div>
            <p className="text-sm text-foreground mb-1 leading-5 pt-3">Curso</p>
            <p className="text-sm leading-5 text-muted-foreground">
              {courseTitle}
            </p>
          </div>
        </div>

        <div className="space-y-0">
          <CertificateMenuItem
            icon={<DownloadIcon className="h-5 w-5" />}
            label={isGenerating ? 'Gerando...' : 'Baixar'}
            onClick={handleDownload}
            disabled={isGenerating}
            isFirst
          />
          <CertificateMenuItem
            icon={<ShareIcon className="h-5 w-5" />}
            label={isGenerating ? 'Gerando...' : 'Compartilhar'}
            onClick={handleShare}
            disabled={isGenerating}
          />
          <CertificateMenuItem
            icon={<EyeIcon className="h-5 w-5" />}
            label={isGenerating ? 'Gerando...' : 'Visualizar'}
            onClick={handleView}
            disabled={isGenerating}
          />
          <CertificateMenuItem
            icon={<PrinterIcon className="h-5 w-5" />}
            label={isGenerating ? 'Gerando...' : 'Imprimir'}
            onClick={handlePrint}
            disabled={isGenerating}
            isLast
          />
        </div>
      </div>
    </BottomSheet>
  )
}

export function CoursesUnavailableDrawer({
  open,
  onOpenChange,
}: CoursesUnavailableDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Certificado Indisponível"
      headerClassName="text-center p-0 mb-6"
    >
      <div className="text-left md:text-center py-4">
        <p className="text-sm text-popover-foreground leading-5">
          O certificado ainda não está disponível.
        </p>
      </div>
    </BottomSheet>
  )
}
