'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { MeiEmptyState } from '../meu-mei/mei-empty-state'
import { ProposalsEmptyState } from './proposals-empty-state'
import { ProposalsList } from './proposals-list'
import type { MeiProposal } from './types'

interface MinhasPropostasClientProps {
  proposals: MeiProposal[]
  hasMei: boolean
}

export function MinhasPropostasClient({
  proposals,
  hasMei,
}: MinhasPropostasClientProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/servicos/mei/menu')
  }

  const renderContent = () => {
    if (!hasMei) {
      return <MeiEmptyState variant="propostas" />
    }

    if (proposals.length === 0) {
      return <ProposalsEmptyState />
    }

    return <ProposalsList proposals={proposals} />
  }

  return (
    <main className="max-w-xl min-h-lvh mx-auto text-foreground">
      <header className="px-4 py-4 relative w-full max-w-xl mx-auto bg-background text-foreground">
        <div className="flex justify-start">
          <IconButton icon={ChevronLeftIcon} onClick={handleBack} />
        </div>
      </header>
      <div className="px-4 pb-12">{renderContent()}</div>
    </main>
  )
}
