'use client'

import { Pagination } from '@/components/ui/pagination'
import { isGcsObjectUrl } from '@/lib/cadmicro/file-types'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Served from /public (copied from pdfjs-dist on postinstall/prebuild) to avoid Turbopack bundling the worker.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

type PdfFileSource = string | { data: Uint8Array }

function isBrowserLocalUrl(url: string) {
  return url.startsWith('blob:') || url.startsWith('data:')
}

function needsGcsContentProxy(url: string) {
  return (
    isGcsObjectUrl(url) || url.startsWith('https://storage.googleapis.com/')
  )
}

export function PdfDocumentViewer({
  fileUrl,
  vehicleId,
}: {
  fileUrl: string
  vehicleId?: string
}) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [loadError, setLoadError] = useState(false)
  const [fileSource, setFileSource] = useState<PdfFileSource | null>(null)
  const [isResolving, setIsResolving] = useState(true)

  const pageWidth = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 64 : 640,
    640
  )

  useEffect(() => {
    let cancelled = false

    async function resolveSource() {
      setIsResolving(true)
      setLoadError(false)
      setFileSource(null)
      setNumPages(0)
      setPageNumber(1)

      try {
        if (isBrowserLocalUrl(fileUrl)) {
          if (!cancelled) setFileSource(fileUrl)
          return
        }

        if (needsGcsContentProxy(fileUrl)) {
          const objectUrl = fileUrl.split('?')[0]
          const res = await fetch('/api/cadmicro/files/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              objectUrl,
              ...(vehicleId ? { vehicleId } : {}),
            }),
          })
          if (!res.ok) {
            throw new Error('content proxy failed')
          }
          const buffer = await res.arrayBuffer()
          if (!cancelled) {
            setFileSource({ data: new Uint8Array(buffer) })
          }
          return
        }

        if (!cancelled) setFileSource(fileUrl)
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setIsResolving(false)
      }
    }

    void resolveSource()

    return () => {
      cancelled = true
    }
  }, [fileUrl, vehicleId])

  if (loadError) {
    return (
      <p className="p-6 text-center text-sm text-foreground-light">
        Não foi possível carregar o PDF.
      </p>
    )
  }

  if (isResolving || !fileSource) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-foreground-light">
        <Loader2 className="size-5 animate-spin" />
        Carregando PDF...
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="min-h-0 flex-1 overflow-auto rounded-lg  p-2">
        <Document
          file={fileSource}
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
