'use client'

import { InfoIcon } from '@/assets/icons/info-icon'
import { XIcon } from '@/assets/icons/x-icon'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { ImageIcon } from 'lucide-react'
import { useRef } from 'react'
import toast from 'react-hot-toast'

const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
]
const ACCEPTED_EXTENSIONS = '.png,.jpeg,.jpg,.pdf'
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024

interface FileUploadFieldProps {
  label: string
  description: string
  buttonLabel: string
  showInfoIcon?: boolean
  onInfoClick?: () => void
  fileName?: string
  fileSize?: number
  onFileSelect: (file: File, previewUrl: string) => void
  onFileRemove: () => void
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

export function FileUploadField({
  label,
  description,
  buttonLabel,
  showInfoIcon = false,
  onInfoClick,
  fileName,
  fileSize,
  onFileSelect,
  onFileRemove,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePickFile = () => {
    inputRef.current?.click()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    const isAcceptedMime = ACCEPTED_MIME_TYPES.includes(file.type)
    const isAcceptedExtension =
      extension === 'png' ||
      extension === 'jpeg' ||
      extension === 'jpg' ||
      extension === 'pdf'

    if (!isAcceptedMime && !isAcceptedExtension) {
      toast.error('Formato inválido. Use PNG, JPEG ou PDF.')
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Arquivo maior que 7MB.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    onFileSelect(file, previewUrl)
  }

  return (
    <div className="bg-card flex flex-col gap-4 rounded-xl p-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <p className="text-sm text-primary font-normal leading-5">{label}</p>
          {showInfoIcon && (
            <button
              type="button"
              aria-label="Mais informações"
              className="shrink-0 text-primary"
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
      >
        {buttonLabel}
      </CustomButton>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleChange}
      />

      {fileName && (
        <div className="bg-secondary flex items-center justify-between rounded-xl p-4 w-full">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-card flex items-center justify-center rounded-lg size-10 shrink-0">
              <ImageIcon className="size-5 text-foreground" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm text-foreground truncate">{fileName}</p>
              {typeof fileSize === 'number' && (
                <p className="text-sm text-foreground-light">
                  {formatFileSize(fileSize)}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            aria-label="Remover arquivo"
            className="shrink-0 p-1 text-foreground"
            onClick={onFileRemove}
          >
            <XIcon className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}
