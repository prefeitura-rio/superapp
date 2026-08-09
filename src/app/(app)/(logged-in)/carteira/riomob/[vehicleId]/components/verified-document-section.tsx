'use client'

import { DocumentFileCard } from '@/app/components/riomob/document-file-card'
import { PdfPreviewDialog } from '@/app/components/riomob/pdf-preview-dialog'
import {
  useInvalidateRiomobSignedUrl,
  useRiomobSignedUrl,
} from '@/hooks/riomob/use-riomob-signed-url'
import { isGcsObjectUrl } from '@/lib/riomob/file-types'
import { isPdfName } from '@/lib/riomob/file-utils'
import type { VehicleDocument } from '@/lib/riomob/types'
import { FileText, ImageIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'

interface VerifiedDocumentSectionProps {
  message: string
  document: VehicleDocument
  vehicleId: string
}

export function VerifiedDocumentSection({
  message,
  document,
  vehicleId,
}: VerifiedDocumentSectionProps) {
  const isPdf = isPdfName(document.fileName) || isPdfName(document.url)
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
  const invalidate = useInvalidateRiomobSignedUrl()
  const invalidatedForKeyRef = useRef<string | null>(null)
  const invalidateKey = `${document.url}|${vehicleId}`

  const { url: previewUrl, isLoading: isLoadingPreview } = useRiomobSignedUrl(
    isPdf ? null : document.url,
    { vehicleId, enabled: !isPdf }
  )

  const handleOpenPdf = () => {
    setPdfDialogOpen(true)
  }

  const handleImageUnavailable = () => {
    toast.error('Não foi possível abrir o arquivo')
  }

  const handleImageError = () => {
    if (
      !isGcsObjectUrl(document.url) ||
      invalidatedForKeyRef.current === invalidateKey
    ) {
      return
    }
    invalidatedForKeyRef.current = invalidateKey
    void invalidate(document.url, vehicleId)
  }

  const thumbnail = isPdf ? (
    <FileText className="size-5 stroke-[1.5] text-foreground" />
  ) : previewUrl ? (
    <img
      src={previewUrl}
      alt=""
      className="size-full object-cover"
      onError={handleImageError}
    />
  ) : (
    <ImageIcon className="size-5 stroke-[1.5] text-foreground" />
  )

  const canOpenImage = !isPdf && !!previewUrl

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-5 text-foreground-light">{message}</p>
      <DocumentFileCard
        fileName={document.fileName}
        sizeLabel={document.fileSizeLabel}
        thumbnail={thumbnail}
        photoSrc={canOpenImage ? previewUrl : undefined}
        onClick={
          isPdf
            ? handleOpenPdf
            : !canOpenImage
              ? handleImageUnavailable
              : undefined
        }
        busy={isLoadingPreview}
        busyLabel="Carregando..."
        aria-label={`Abrir ${document.fileName}`}
      />
      <PdfPreviewDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        fileUrl={isPdf ? document.url : null}
        vehicleId={vehicleId}
        title={document.fileName}
      />
    </div>
  )
}
