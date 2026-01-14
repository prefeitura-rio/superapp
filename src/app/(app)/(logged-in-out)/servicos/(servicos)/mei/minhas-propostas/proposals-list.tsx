import { ProposalCard } from './proposal-card'
import type { MeiProposal } from './types'

interface ProposalsListProps {
  proposals: MeiProposal[]
}

export function ProposalsList({ proposals }: ProposalsListProps) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {proposals.map(proposal => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  )
}
