'use server'

import { deleteApiV1OportunidadesMeiIdPropostasPropostaId } from '@/http-courses/propostas-mei/propostas-mei'

interface DeleteProposalResult {
  success: boolean
  error?: string
}

export async function deleteProposal(
  opportunityId: number,
  proposalId: string
): Promise<DeleteProposalResult> {
  try {
    const res = await deleteApiV1OportunidadesMeiIdPropostasPropostaId(
      opportunityId,
      proposalId
    )

    if (res.status === 200) {
      return { success: true }
    }

    return { success: false, error: 'Erro ao cancelar proposta' }
  } catch (error) {
    console.error('[MEI] Error deleting proposal:', error)
    return { success: false, error: 'Erro ao cancelar proposta' }
  }
}
