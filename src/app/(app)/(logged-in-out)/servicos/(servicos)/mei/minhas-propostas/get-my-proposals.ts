import type { ModelsPropostaMEI } from '@/http-courses/models'
import { getApiV1OportunidadesMeiId } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { getApiV1PropostasMeiPorEmpresa } from '@/http-courses/propostas-mei/propostas-mei'
import { mapApiToMeiProposal } from '@/lib/mei-utils'
import type { MeiProposal } from './types'

interface PropostasResponse {
  data?: ModelsPropostaMEI[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

export async function getMyProposals(cnpj: string): Promise<MeiProposal[]> {
  try {
    const response = await getApiV1PropostasMeiPorEmpresa({
      meiEmpresaId: cnpj.replace(/\D/g, ''),
    })

    if (response.status !== 200 || !response.data) {
      console.error('[MEI Proposals] API error:', response.status)
      return []
    }

    const apiData = response.data as PropostasResponse
    const propostas = apiData.data || []

    if (propostas.length === 0) {
      return []
    }

    // 2. Para cada proposta, buscar dados da oportunidade
    const proposals = await Promise.all(
      propostas.map(async proposta => {
        let oportunidade: { titulo?: string; cover_image?: string } = {}

        if (proposta.oportunidade_mei_id) {
          try {
            const opRes = await getApiV1OportunidadesMeiId(
              proposta.oportunidade_mei_id
            )
            if (opRes.status === 200 && opRes.data) {
              oportunidade = {
                titulo: opRes.data.titulo,
                cover_image: opRes.data.cover_image,
              }
            }
          } catch (e) {
            console.error('[MEI Proposals] Error fetching opportunity:', e)
          }
        }

        return mapApiToMeiProposal(proposta, oportunidade)
      })
    )

    return proposals
  } catch (error) {
    console.error('[MEI Proposals] Error fetching proposals:', error)
    return []
  }
}
