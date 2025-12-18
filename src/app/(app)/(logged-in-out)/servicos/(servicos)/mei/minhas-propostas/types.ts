export type ProposalStatus = 'aprovada' | 'em_analise' | 'recusada' | 'concluida'

export interface MeiProposal {
  id: number
  opportunityId: number
  opportunitySlug: string
  title: string
  coverImage?: string
  status: ProposalStatus
}
