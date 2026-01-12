'use server'

import { putApiV1OportunidadesMeiIdPropostasPropostaId } from '@/http-courses/propostas-mei/propostas-mei'

interface UpdateProposalData {
  oportunidadeId: number
  propostaId: string
  meiEmpresaId: string
  valorProposta: number
  prazoExecucaoDias: number
  aceitaCustosIntegrais: boolean
  telefone: string
  email: string
}

export async function updateMeiProposal(data: UpdateProposalData): Promise<{
  success: boolean
  data?: unknown
  error?: string
}> {
  try {
    const response = await putApiV1OportunidadesMeiIdPropostasPropostaId(
      data.oportunidadeId,
      data.propostaId,
      {
        mei_empresa_id: data.meiEmpresaId,
        valor_proposta: data.valorProposta,
        prazo_execucao: data.prazoExecucaoDias.toString(),
        aceita_custos_integrais: data.aceitaCustosIntegrais,
      }
    )

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      }
    }

    let errorMessage = 'Erro ao atualizar proposta'
    const errorData = 'data' in response ? response.data : null

    console.error(
      '[MEI Proposal Update] Full error response:',
      JSON.stringify(errorData, null, 2)
    )

    if (errorData && typeof errorData === 'object') {
      if ('message' in errorData && errorData.message) {
        errorMessage = errorData.message as string
      } else if ('error' in errorData && errorData.error) {
        errorMessage = errorData.error as string
      }
    }

    console.error(
      `[MEI Proposal Update] API returned status ${response.status}:`,
      errorMessage
    )
    return {
      success: false,
      error: errorMessage,
    }
  } catch (error) {
    console.error('[MEI Proposal Update] Error updating:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
