import { parseSalesforcePreviewOrigins } from '@/lib/carta-servicos/preview-protocol'
import type { Metadata } from 'next'
import { PreviewClient } from './preview-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pré-visualização do serviço',
  robots: { index: false, follow: false },
}

export default function ServicePreviewPage() {
  const allowedOrigins = parseSalesforcePreviewOrigins(
    process.env.SALESFORCE_PREVIEW_ORIGINS
  )

  return <PreviewClient allowedOrigins={allowedOrigins} />
}
