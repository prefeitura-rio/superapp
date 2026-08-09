'use client'

import { isGcsObjectUrl } from '@/lib/riomob/file-types'
import {
  RiomobSignedReadError,
  requestRiomobSignedRead,
} from '@/lib/riomob/request-signed-read'
import { ImageIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { VehicleDocument } from '../../mocks/vehicles'

interface VerifiedDocumentSectionProps {
  message: string
  document: VehicleDocument
  vehicleId: string
}

async function resolveOpenableUrl(
  url: string,
  vehicleId: string
): Promise<string> {
  if (!isGcsObjectUrl(url)) return url
  return requestRiomobSignedRead(url, { vehicleId })
}

export function VerifiedDocumentSection({
  message,
  document,
  vehicleId,
}: VerifiedDocumentSectionProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleOpen = async () => {
    if (isOpening) return
    setIsOpening(true)
    try {
      const openUrl = await resolveOpenableUrl(document.url, vehicleId)
      window.open(openUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      const description =
        err instanceof RiomobSignedReadError
          ? err.message
          : 'Não foi possível abrir o arquivo'
      toast.error(description)
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-5 text-foreground-light">{message}</p>
      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={isOpening}
        className="flex w-full items-center rounded-xl bg-secondary p-4 text-left transition-opacity disabled:opacity-70"
        aria-label={`Abrir ${document.fileName}`}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card">
              {/* Lucide fallback — sem ImageIcon em src/assets/icons */}
              {isOpening ? (
                <Loader2 className="size-5 animate-spin text-foreground" />
              ) : (
                <ImageIcon className="size-5 text-foreground" />
              )}
            </div>
            <div className="flex min-w-0 flex-col text-sm leading-5">
              <span className="truncate text-foreground">
                {document.fileName}
              </span>
              <span className="text-foreground-light">
                {isOpening ? 'Abrindo...' : document.fileSizeLabel}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-sm text-primary">
            {document.fileName.toLowerCase().endsWith('.pdf') ? 'Abrir' : 'Ver'}
          </span>
        </div>
      </button>
    </div>
  )
}
