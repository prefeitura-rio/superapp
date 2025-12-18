'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { MeiCompanyDetails } from './mei-company-details'
import { MeiEmptyState } from './mei-empty-state'
import type { MeiCompanyFullData } from './types'

interface MeuMeiClientProps {
  companyData: MeiCompanyFullData | null
}

export function MeuMeiClient({ companyData }: MeuMeiClientProps) {
  return (
    <main className="max-w-xl min-h-lvh mx-auto text-foreground">
      <SecondaryHeader defaultRoute="/servicos/mei/menu" fixed={false} />
      <div className="px-4 pt-4 pb-12">
        {companyData ? (
          <MeiCompanyDetails data={companyData} />
        ) : (
          <MeiEmptyState />
        )}
      </div>
    </main>
  )
}
