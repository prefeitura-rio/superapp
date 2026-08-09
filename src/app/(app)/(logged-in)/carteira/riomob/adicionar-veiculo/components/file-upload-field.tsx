'use client'

import { DocumentFileCard } from '@/app/components/riomob/document-file-card'
import { PdfPreviewDialog } from '@/app/components/riomob/pdf-preview-dialog'
import { InfoIcon } from '@/assets/icons/info-icon'
import { XIcon } from '@/assets/icons/x-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import {
  useInvalidateRiomobSignedUrl,
  useRiomobSignedUrl,
} from '@/hooks/riomob/use-riomob-signed-url'
import { type RiomobFileKind, isGcsObjectUrl } from '@/lib/riomob/file-types'
import { formatFileSizeLabel, isPdfName } from '@/lib/riomob/file-utils'
import {
  RiomobUploadError,
  uploadRiomobFile,
  validateRiomobFile,
} from '@/lib/riomob/upload-file'
import { cn } from '@/lib/utils'
import { FileText, ImageIcon, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const ACCEPTED_EXTENSIONS = '.png,.jpeg,.jpg,.pdf'

interface FileUploadFieldProps {
  label: string
  description: string
  buttonLabel: string
  kind: RiomobFileKind
  showInfoIcon?: boolean
  onInfoClick?: () => void
  fileName?: string
  fileSize?: number
  /** Stable GCS object URL — enables preview/open after upload or on edit. */
  fileUrl?: string
  error?: string
  onFileSelect: (file: File, objectUrl: string) => void
  onFileRemove: () => void
  onUploadingChange?: (isUploading: boolean) => void
}

export function FileUploadField({
  label,
  description,
  buttonLabel,
  kind,
  showInfoIcon = false,
  onInfoClick,
  fileName,
  fileSize,
  fileUrl,
  error,
  onFileSelect,
  onFileRemove,
  onUploadingChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [blobPreviewUrl, setBlobPreviewUrl] = useState<string | null>(null)
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
  const [pdfDialogUrl, setPdfDialogUrl] = useState<string | null>(null)
  const invalidate = useInvalidateRiomobSignedUrl()
  const invalidatedForUrlRef = useRef<string | null>(null)

  const displayName = fileName || pendingFile?.name
  const isPdf =
    isPdfName(displayName) || pendingFile?.type === 'application/pdf'
  const hasLocalBlob = !!blobPreviewUrl?.startsWith('blob:')

  const { url: signedPreviewUrl } = useRiomobSignedUrl(isPdf ? null : fileUrl, {
    enabled: !isPdf && !hasLocalBlob,
  })

  const previewUrl = hasLocalBlob ? blobPreviewUrl : signedPreviewUrl

  const setUploading = (value: boolean) => {
    setIsUploading(value)
    onUploadingChange?.(value)
  }

  const revokePreviewUrl = () => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = null
    setBlobPreviewUrl(null)
  }

  const setBlobPreview = (file: File) => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const next = URL.createObjectURL(file)
    previewUrlRef.current = next
    setBlobPreviewUrl(next)
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handlePickFile = () => {
    if (isUploading) return
    inputRef.current?.click()
  }

  const uploadFile = async (file: File) => {
    const validationError = validateRiomobFile(file)
    if (validationError) {
      toast.error(validationError)
      setPendingFile(null)
      setHasError(false)
      return
    }

    setPendingFile(file)
    setHasError(false)
    setBlobPreview(file)
    setUploading(true)

    try {
      const result = await uploadRiomobFile(file, kind)
      onFileSelect(file, result.objectUrl)
      setPendingFile(null)
      setHasError(false)
    } catch (err) {
      setHasError(true)
      const message =
        err instanceof RiomobUploadError
          ? err.message
          : 'Erro no upload. Tente novamente.'
      toast.error(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    void uploadFile(file)
  }

  const handleRetry = () => {
    if (!pendingFile || isUploading) return
    void uploadFile(pendingFile)
  }

  const handleRemove = () => {
    if (isUploading) return
    setPendingFile(null)
    setHasError(false)
    setPdfDialogOpen(false)
    setPdfDialogUrl(null)
    revokePreviewUrl()
    onFileRemove()
  }

  const handleOpenPdf = () => {
    if (isUploading || hasError) return

    const url =
      (blobPreviewUrl?.startsWith('blob:') ? blobPreviewUrl : null) ||
      fileUrl ||
      previewUrl

    if (!url) {
      toast.error('Arquivo indisponível para visualização')
      return
    }

    setPdfDialogUrl(url)
    setPdfDialogOpen(true)
  }

  const handleImageError = () => {
    if (!fileUrl || !isGcsObjectUrl(fileUrl) || hasLocalBlob) return
    if (invalidatedForUrlRef.current === fileUrl) return
    invalidatedForUrlRef.current = fileUrl
    void invalidate(fileUrl)
  }

  const displaySize =
    typeof fileSize === 'number' ? fileSize : pendingFile?.size
  const canPreview =
    !isUploading && !hasError && (!!previewUrl || (!!fileUrl && isPdf))
  const sizeLabel =
    typeof displaySize === 'number'
      ? isUploading
        ? 'Enviando...'
        : hasError
          ? 'Falha no envio'
          : formatFileSizeLabel(displaySize)
      : ''

  const thumbnail = (
    <>
      {isPdf ? (
        // Lucide fallback — sem FileText em src/assets/icons
        <FileText className="size-5 text-foreground" />
      ) : previewUrl ? (
        <img
          src={previewUrl}
          alt=""
          className="size-full object-cover"
          onError={handleImageError}
        />
      ) : (
        // Lucide fallback — sem ImageIcon em src/assets/icons
        <ImageIcon className="size-5 text-foreground" />
      )}
    </>
  )

  const actions = (
    <>
      {hasError && pendingFile && (
        <button
          type="button"
          aria-label="Tentar novamente"
          className="p-1 text-foreground"
          onClick={handleRetry}
          disabled={isUploading}
        >
          {/* Lucide fallback — sem ícone de retry em src/assets/icons */}
          <RotateCcw className="size-5" />
        </button>
      )}
      <button
        type="button"
        aria-label="Remover arquivo"
        className="p-1 text-foreground"
        onClick={handleRemove}
        disabled={isUploading}
      >
        <XIcon className="size-5" />
      </button>
    </>
  )

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl p-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'text-sm font-normal leading-5',
              error ? 'text-destructive' : 'text-primary'
            )}
          >
            {label}
          </p>
          {showInfoIcon && (
            <button
              type="button"
              aria-label="Mais informações"
              className={cn(
                'shrink-0',
                error ? 'text-destructive' : 'text-primary'
              )}
              onClick={onInfoClick}
            >
              <InfoIcon className="size-5" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground-light font-normal leading-5">
          {description}
        </p>
      </div>

      <CustomButton
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        className="bg-secondary hover:bg-secondary/80 text-foreground"
        onClick={handlePickFile}
        loading={isUploading}
        disabled={isUploading}
      >
        {buttonLabel}
      </CustomButton>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />

      {displayName && (
        <DocumentFileCard
          fileName={displayName}
          sizeLabel={sizeLabel}
          thumbnail={thumbnail}
          photoSrc={canPreview && !isPdf && previewUrl ? previewUrl : undefined}
          onClick={canPreview && isPdf ? handleOpenPdf : undefined}
          disabled={!canPreview}
          actions={actions}
        />
      )}

      <PdfPreviewDialog
        open={pdfDialogOpen}
        onOpenChange={setPdfDialogOpen}
        fileUrl={pdfDialogUrl}
        title={displayName ?? 'Visualizar PDF'}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
