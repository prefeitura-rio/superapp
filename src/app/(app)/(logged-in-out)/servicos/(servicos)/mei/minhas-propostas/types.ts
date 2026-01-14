export type ProposalStatus = 'aprovada' | 'em_analise' | 'recusada' | 'concluida'

export interface MeiProposal {
  id: string
  opportunityId: number
  opportunitySlug: string
  title: string
  coverImage?: string
  status: ProposalStatus
}
