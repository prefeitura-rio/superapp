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
import toast from 'react-hot-toast'
import { CertificateMenuItem } from './certificate-menu-item'

interface CoursesCertifiedDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseTitle: string
  studentName: string
  courseDuration: string
  issuingOrganization: string
  orgao_id?: string
  certificateUrl?: string // URL direta do certificado se disponível
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
  orgao_id,
  certificateUrl,
}: CoursesCertifiedDrawerProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const getCertificateData = (): CertificateData => {
    const data = {
      studentName,
      courseTitle,
      courseDuration,
      issuingOrganization,
      issueDate: formatDate(new Date()),
      orgao_id, // Passa o orgao_id para buscar o nome do órgão e selecionar o template correto
    }

    // Log para debug
    console.log('Dados do certificado:', data)

    return data
  }

  /**
   * Versão interna do handleDownload que não exibe toast de erro
   * Usada como fallback em outras funções
   */
  const handleDownloadInternal = async (): Promise<void> => {
    if (isGenerating) return

    // Se já existe uma URL de certificado, faz download direto
    if (certificateUrl) {
      try {
        const link = document.createElement('a')
        link.href = certificateUrl
        link.download = `${courseTitle}-certificado.pdf`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Erro ao baixar certificado:', error)
      }
      return
    }

    // Gera o certificado dinamicamente
    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      await generateAndDownload(certificateData, {
        fileName: `${courseTitle}-certificado.pdf`,
        download: true,
      })
    } catch (error) {
      console.error('Erro ao gerar certificado:', error)
      // Não exibe toast aqui - usado como fallback
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Se o curso já possui uma URL de certificado, usa diretamente
   * Caso contrário, gera o certificado dinamicamente
   */
  const handleDownload = async () => {
    try {
      await handleDownloadInternal()
    } catch (error) {
      // Exibe toast de erro apenas aqui
      toast.error('Erro ao gerar certificado')
    }
  }

  const handleView = async () => {
    if (isGenerating) return

    // Se já existe uma URL de certificado, abre diretamente
    if (certificateUrl) {
      window.open(certificateUrl, '_blank')
      return
    }

    // Gera o certificado dinamicamente
    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um blob e abre em nova aba
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const newWindow = window.open(url, '_blank')
      if (newWindow) {
        newWindow.onload = () => {
          URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Erro ao visualizar certificado:', error)
      // Exibe toast de erro
      toast.error('Erro ao gerar certificado')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (isGenerating) return

    // Se já existe uma URL de certificado, compartilha a URL diretamente
    if (certificateUrl) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `Certificado: ${courseTitle}`,
            text: `Confira meu certificado de conclusão do curso: ${courseTitle}`,
            url: certificateUrl,
          })
        } else {
          // Fallback: copia URL para clipboard ou abre em nova aba
          try {
            await navigator.clipboard.writeText(certificateUrl)
            toast.success(
              'URL do certificado copiada para a área de transferência'
            )
          } catch (clipboardError) {
            // Se não conseguir copiar, abre em nova aba
            window.open(certificateUrl, '_blank')
          }
        }
      } catch (error) {
        console.error('Erro ao compartilhar certificado:', error)
        // Fallback: abre a URL em nova aba
        window.open(certificateUrl, '_blank')
      }
      return
    }

    // Gera o certificado dinamicamente
    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um arquivo para compartilhar
      const file = new File([new Uint8Array(pdfBytes)], `${courseTitle}-certificado.pdf`, {
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
        await handleDownloadInternal()
      }
    } catch (error) {
      console.error('Erro ao compartilhar certificado:', error)
      // Exibe toast de erro
      toast.error('Erro ao gerar certificado')
      // Fallback para download (sem mostrar outro toast)
      try {
        await handleDownloadInternal()
      } catch (fallbackError) {
        // Não exibe outro toast, apenas loga o erro
        console.error('Erro no fallback de download:', fallbackError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = async () => {
    if (isGenerating) return

    // Se já existe uma URL de certificado, abre para impressão
    if (certificateUrl) {
      const printWindow = window.open(certificateUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
      return
    }

    // Gera o certificado dinamicamente
    setIsGenerating(true)
    try {
      const certificateData = getCertificateData()
      const pdfBytes = await generateCertificate(certificateData)

      // Cria um blob e abre para impressão
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
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
      // Exibe toast de erro
      toast.error('Erro ao gerar certificado')
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
