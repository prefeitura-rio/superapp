import { ImageIcon } from 'lucide-react'
import type { VehicleDocument } from '../../mocks/vehicles'

interface VerifiedDocumentSectionProps {
  message: string
  document: VehicleDocument
}

export function VerifiedDocumentSection({
  message,
  document,
}: VerifiedDocumentSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-5 text-foreground-light">{message}</p>
      <div className="flex w-full items-center rounded-xl bg-secondary p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card">
            {/* Lucide fallback — sem ImageIcon em src/assets/icons */}
            <ImageIcon className="size-5 text-foreground" />
          </div>
          <div className="flex min-w-0 flex-col text-sm leading-5">
            <span className="truncate text-foreground">
              {document.fileName}
            </span>
            <span className="text-foreground-light">
              {document.fileSizeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
