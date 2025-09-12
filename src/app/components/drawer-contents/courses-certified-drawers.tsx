'use client'

import { DownloadIcon, EyeIcon, PrinterIcon, ShareIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CertificateMenuItem } from './certificate-menu-item'

interface CoursesCertifiedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle: string
  certificateUrl: string
}

interface CoursesUnavailableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CoursesCertifiedDrawer({
  open,
  onOpenChange,
  courseTitle,
  certificateUrl,
}: CoursesCertifiedDrawerProps) {
  const handleDownload = () => {
    if (certificateUrl) {
      const link = document.createElement('a')
      link.href = certificateUrl
      link.download = `${courseTitle}-certificado.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleView = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (navigator.share && certificateUrl) {
      try {
        await navigator.share({
          title: `Certificado: ${courseTitle}`,
          text: `Confira meu certificado de conclusão do curso: ${courseTitle}`,
          url: certificateUrl,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
        // Fallback para copiar URL
        navigator.clipboard.writeText(certificateUrl)
      }
    } else if (certificateUrl) {
      // Fallback para copiar URL
      navigator.clipboard.writeText(certificateUrl)
    }
  }

  const handlePrint = () => {
    if (certificateUrl) {
      const printWindow = window.open(certificateUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
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
            label="Baixar"
            onClick={handleDownload}
            isFirst
          />
          <CertificateMenuItem
            icon={<ShareIcon className="h-5 w-5" />}
            label="Compartilhar"
            onClick={handleShare}
          />
          <CertificateMenuItem
            icon={<EyeIcon className="h-5 w-5" />}
            label="Visualizar"
            onClick={handleView}
          />
          <CertificateMenuItem
            icon={<PrinterIcon className="h-5 w-5" />}
            label="Imprimir"
            onClick={handlePrint}
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
