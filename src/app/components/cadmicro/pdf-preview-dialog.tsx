'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// O pdfjs-dist acessa `DOMMatrix` ao ser importado e quebra o SSR de qualquer
// página que importe este dialog (a de adicionar veículo respondia 500).
const PdfDocumentViewer = dynamic(
  () => import('./pdf-document-viewer').then(mod => mod.PdfDocumentViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-foreground-light">
        <Loader2 className="size-5 animate-spin" />
        Carregando PDF...
      </div>
    ),
  }
)

interface PdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** blob: URL or stable GCS object URL (not a browser-fetched signed URL). */
  fileUrl: string | null
  /** Required when object CPF path ≠ logged-in citizen (conductor). */
  vehicleId?: string
  title?: string
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  fileUrl,
  vehicleId,
  title = 'Visualizar PDF',
}: PdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-3 overflow-hidden sm:max-w-3xl"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader className="min-w-0">
          <DialogTitle
            className="min-w-0 truncate pr-8 text-left text-base font-medium"
            title={title}
          >
            {title}
          </DialogTitle>
        </DialogHeader>

        {fileUrl ? (
          <PdfDocumentViewer
            key={`${fileUrl}:${vehicleId ?? ''}`}
            fileUrl={fileUrl}
            vehicleId={vehicleId}
          />
        ) : (
          <p className="p-6 text-center text-sm text-foreground-light">
            Arquivo indisponível.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
