'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { ProposalsEmptyState } from './proposals-empty-state'
import { ProposalsList } from './proposals-list'
import type { MeiProposal } from './types'

interface MinhasPropostasClientProps {
  proposals: MeiProposal[]
}

export function MinhasPropostasClient({
  proposals,
}: MinhasPropostasClientProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/servicos/mei/menu')
  }

  return (
    <main className="max-w-xl min-h-lvh mx-auto text-foreground">
      <header className="px-4 py-4 relative w-full max-w-xl mx-auto bg-background text-foreground">
        <div className="flex justify-start">
          <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        </div>
      </header>
      <div className="px-4 pb-12">
        {proposals.length > 0 ? (
          <ProposalsList proposals={proposals} />
        ) : (
          <ProposalsEmptyState />
        )}
      </div>
    </main>
  )
}
