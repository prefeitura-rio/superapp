'use client'

import { PdfPreviewDialog } from '@/app/(app)/(logged-in)/carteira/riomob/components/pdf-preview-dialog'
import { InfoIcon } from '@/assets/icons/info-icon'
import { XIcon } from '@/assets/icons/x-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { type RiomobFileKind, isGcsObjectUrl } from '@/lib/riomob/file-types'
import {
  RiomobSignedReadError,
  requestRiomobSignedRead,
} from '@/lib/riomob/request-signed-read'
import {
  RiomobUploadError,
  uploadRiomobFile,
  validateRiomobFile,
} from '@/lib/riomob/upload-file'
import { cn } from '@/lib/utils'
import { FileText, ImageIcon, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

function isPdfName(name?: string | null) {
  return !!name && /\.pdf$/i.test(name)
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
  const [isOpeningPdf, setIsOpeningPdf] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)
  const [pdfDialogUrl, setPdfDialogUrl] = useState<string | null>(null)

  const displayName = fileName || pendingFile?.name
  const isPdf =
    isPdfName(displayName) || pendingFile?.type === 'application/pdf'

  const setUploading = (value: boolean) => {
    setIsUploading(value)
    onUploadingChange?.(value)
  }

  const revokePreviewUrl = () => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    previewUrlRef.current = null
    setPreviewUrl(null)
  }

  const setBlobPreview = (file: File) => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current)
    }
    const next = URL.createObjectURL(file)
    previewUrlRef.current = next
    setPreviewUrl(next)
  }

  // Edit/image flow: load signed URL for image thumbnail (skip for PDF — icon only)
  useEffect(() => {
    if (!fileUrl || !isGcsObjectUrl(fileUrl)) return
    if (previewUrlRef.current?.startsWith('blob:')) return
    if (isPdfName(fileName) || isPdfName(fileUrl)) return

    let cancelled = false

    void requestRiomobSignedRead(fileUrl)
      .then(signedUrl => {
        if (cancelled) return
        previewUrlRef.current = signedUrl
        setPreviewUrl(signedUrl)
      })
      .catch(() => {
        // Keep ImageIcon fallback when signed-read fails
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl, fileName])

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

  const handleOpenPdf = async () => {
    if (isUploading || hasError || isOpeningPdf) return

    setIsOpeningPdf(true)
    try {
      let url = previewUrl
      if (!url && fileUrl) {
        url = isGcsObjectUrl(fileUrl)
          ? await requestRiomobSignedRead(fileUrl)
          : fileUrl
      }
      if (!url) {
        toast.error('Arquivo indisponível para visualização')
        return
      }
      setPdfDialogUrl(url)
      setPdfDialogOpen(true)
    } catch (err) {
      toast.error(
        err instanceof RiomobSignedReadError
          ? err.message
          : 'Não foi possível abrir o PDF'
      )
    } finally {
      setIsOpeningPdf(false)
    }
  }

  const displaySize =
    typeof fileSize === 'number' ? fileSize : pendingFile?.size
  const canPreview =
    !isUploading && !hasError && (!!previewUrl || (!!fileUrl && isPdf))

  const fileMeta = (
    <div className="flex flex-col min-w-0">
      <p className="text-sm text-foreground truncate">{displayName}</p>
      {typeof displaySize === 'number' && (
        <p className="text-sm text-foreground-light">
          {isUploading
            ? 'Enviando...'
            : isOpeningPdf
              ? 'Abrindo...'
              : hasError
                ? 'Falha no envio'
                : formatFileSize(displaySize)}
        </p>
      )}
    </div>
  )

  const thumbnail = (
    <div className="bg-card flex items-center justify-center rounded-lg size-10 shrink-0 overflow-hidden">
      {isPdf ? (
        // Lucide fallback — sem FileText em src/assets/icons
        <FileText className="size-5 text-foreground" />
      ) : previewUrl ? (
        <img src={previewUrl} alt="" className="size-full object-cover" />
      ) : (
        // Lucide fallback — sem ImageIcon em src/assets/icons
        <ImageIcon className="size-5 text-foreground" />
      )}
    </div>
  )

  const previewTrigger = (
    <button
      type="button"
      className="flex items-center gap-4 min-w-0 text-left"
      aria-label={`Visualizar ${displayName}`}
      onClick={isPdf ? () => void handleOpenPdf() : undefined}
      disabled={isPdf && isOpeningPdf}
    >
      {thumbnail}
      {fileMeta}
    </button>
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
        <div className="bg-secondary flex items-center justify-between rounded-xl p-4 w-full">
          {canPreview && !isPdf && previewUrl ? (
            <PhotoProvider>
              <PhotoView src={previewUrl}>{previewTrigger}</PhotoView>
            </PhotoProvider>
          ) : canPreview && isPdf ? (
            previewTrigger
          ) : (
            <div className="flex items-center gap-4 min-w-0 opacity-70">
              {thumbnail}
              {fileMeta}
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
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
          </div>
        </div>
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
