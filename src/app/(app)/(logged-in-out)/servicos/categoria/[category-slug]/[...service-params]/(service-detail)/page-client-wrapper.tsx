'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { OfficialBanner } from '@/app/components/service'
import { PrefLogo } from '@/assets/icons/pref-logo'
import type { ModelsPrefRioService } from '@/http-busca-search/models/modelsPrefRioService'
import { useState } from 'react'
import { PageClient } from './page-client'

interface PageClientWrapperProps {
  serviceData: ModelsPrefRioService
  orgaoGestorName: string | null
}

export function PageClientWrapper({
  serviceData,
  orgaoGestorName,
}: PageClientWrapperProps) {
  const [bannerHeight, setBannerHeight] = useState(0)

  return (
    <>
      <OfficialBanner onHeightChange={setBannerHeight} />

      <div className="min-h-lvh max-w-[896px] mx-auto">
        <SecondaryHeader
          logo={<PrefLogo fill="var(--primary)" className="h-8 w-20" />}
          showSearchButton
          className="max-w-[896px]"
          style={{ top: `${bannerHeight}px` }}
        />

        <div className="pt-20 md:pt-24 pb-20 px-4">
          <PageClient
            serviceData={serviceData}
            orgaoGestorName={orgaoGestorName}
          />
        </div>
      </div>
    </>
  )
}
