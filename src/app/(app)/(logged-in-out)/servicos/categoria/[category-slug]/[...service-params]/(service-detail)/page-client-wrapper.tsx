'use client'

import { Breadcrumb } from '@/app/components/breadcrumb'
import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type {
  ServiceContentFormat,
  ServiceRatingTarget,
  ServiceTicketFlags,
} from '@/lib/carta-servicos/types'
import { PageClient } from './page-client'

interface PageClientWrapperProps {
  serviceData: ModelsPrefRioService
  orgaoGestorName: string | null
  categorySlug: string
  categoryName?: string
  contentFormat?: ServiceContentFormat
  ticketFlags?: ServiceTicketFlags
  ratingTarget?: ServiceRatingTarget
  isPreview?: boolean
}

export function PageClientWrapper({
  serviceData,
  orgaoGestorName,
  categorySlug,
  categoryName,
  contentFormat = 'markdown',
  ticketFlags,
  ratingTarget,
  isPreview = false,
}: PageClientWrapperProps) {
  const serviceTitle = serviceData.nome_servico ?? ''
  const catLabel = categoryName ?? decodeURIComponent(categorySlug)
  const catHref = `/servicos/categoria/${encodeURIComponent(categorySlug)}`

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <HeaderWrapperClient />
        <Breadcrumb
          items={[
            { label: 'Página inicial', href: '/' },
            { label: 'Serviços', href: '/servicos' },
            { label: catLabel, href: catHref },
            { label: serviceTitle },
          ]}
        />

        <main className="pb-20 px-4">
          <PageClient
            serviceData={serviceData}
            orgaoGestorName={orgaoGestorName}
            contentFormat={contentFormat}
            ticketFlags={ticketFlags}
            ratingTarget={isPreview ? undefined : ratingTarget}
            isPreview={isPreview}
          />
        </main>
      </div>
    </>
  )
}
