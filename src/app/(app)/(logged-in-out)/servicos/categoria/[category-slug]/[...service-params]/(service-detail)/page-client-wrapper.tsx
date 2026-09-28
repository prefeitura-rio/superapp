'use client'

import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { OfficialBanner } from '@/app/components/service'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import type { ServiceTicketFlags } from '@/lib/carta-servicos/types'
import { PageClient } from './page-client'

interface PageClientWrapperProps {
  serviceData: ModelsPrefRioService
  orgaoGestorName: string | null
  categorySlug: string
  ticketFlags?: ServiceTicketFlags
}

export function PageClientWrapper({
  serviceData,
  orgaoGestorName,
  categorySlug,
  ticketFlags,
}: PageClientWrapperProps) {
  return (
    <>
      <OfficialBanner />

      <div className="max-w-4xl mx-auto">
        <HeaderWrapperClient />

        <div className="pb-20 px-4">
          <PageClient
            serviceData={serviceData}
            orgaoGestorName={orgaoGestorName}
            ticketFlags={ticketFlags}
          />
        </div>
      </div>
    </>
  )
}
