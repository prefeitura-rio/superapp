'use server'

import { postApiV1OportunidadesMeiIdPropostas } from '@/http-courses/propostas-mei/propostas-mei'

interface SubmitProposalData {
  oportunidadeId: number
  meiEmpresaId: string
  valorProposta: number
  prazoExecucaoDias: number
  aceitaCustosIntegrais: boolean
  telefone: string
  email: string
}

export async function submitMeiProposal(data: SubmitProposalData): Promise<{
  success: boolean
  data?: unknown
  error?: string
}> {
  try {
    const response = await postApiV1OportunidadesMeiIdPropostas(
      data.oportunidadeId,
      {
        mei_empresa_id: data.meiEmpresaId,
        valor_proposta: data.valorProposta,
        prazo_execucao: data.prazoExecucaoDias.toString(),
        aceita_custos_integrais: data.aceitaCustosIntegrais,
      }
    )

    if (response.status === 201) {
      return {
        success: true,
        data: response.data,
      }
    }

    let errorMessage = 'Erro ao enviar proposta'
    const errorData = 'data' in response ? response.data : null

    console.error(
      '[MEI Proposal] Full error response:',
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
      `[MEI Proposal] API returned status ${response.status}:`,
      errorMessage
    )
    return {
      success: false,
      error: errorMessage,
    }
  } catch (error) {
    console.error('[MEI Proposal] Error submitting:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
