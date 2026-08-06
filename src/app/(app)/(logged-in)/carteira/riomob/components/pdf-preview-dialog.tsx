'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/ui/pagination'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// CDN worker avoids Turbopack/Next bundling issues with pdfjs-dist.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string | null
  title?: string
}

function PdfDocumentViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState(false)
  const pageWidth = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 64 : 640,
    640
  )

  if (loadError) {
    return (
      <p className="p-6 text-center text-sm text-foreground-light">
        Não foi possível carregar o PDF.
      </p>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-auto rounded-lg bg-secondary p-2">
        <Document
          file={fileUrl}
          loading={
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-foreground-light">
              <Loader2 className="size-5 animate-spin" />
              Carregando PDF...
            </div>
          }
          onLoadSuccess={({ numPages: nextNumPages }) => {
            setNumPages(nextNumPages)
            setPageNumber(1)
            setLoadError(false)
          }}
          onLoadError={() => setLoadError(true)}
          className="flex flex-col items-center"
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            loading={
              <div className="flex items-center justify-center p-10">
                <Loader2 className="size-5 animate-spin text-foreground-light" />
              </div>
            }
          />
        </Document>
      </div>

      <Pagination
        page={pageNumber}
        totalPages={numPages}
        onPageChange={setPageNumber}
        className="pt-1"
      />
    </div>
  )
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  fileUrl,
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
          <PdfDocumentViewer key={fileUrl} fileUrl={fileUrl} />
        ) : (
          <p className="p-6 text-center text-sm text-foreground-light">
            Arquivo indisponível.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
