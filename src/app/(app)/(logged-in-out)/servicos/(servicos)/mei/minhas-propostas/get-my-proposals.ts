import { getPropostasMeiPorEmpresa } from '@/http-courses/propostas-mei/propostas-mei'
import { getApiV1OportunidadesMeiId } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { mapApiToMeiProposal } from '@/lib/mei-utils'
import type { ModelsPropostaMEI } from '@/http-courses/models'
import type { MeiProposal } from './types'

interface PropostasResponse {
  propostas?: ModelsPropostaMEI[]
  total?: number
}

export async function getMyProposals(cnpj: string): Promise<MeiProposal[]> {
  try {
    // 1. Buscar propostas do MEI
    const response = await getPropostasMeiPorEmpresa({
      meiEmpresaId: cnpj.replace(/\D/g, ''),
      page: 1,
      pageSize: 50,
    })

    if (response.status !== 200 || !response.data) {
      console.error('[MEI Proposals] API error:', response.status)
      return []
    }

    const data = response.data as PropostasResponse
    const propostas = data.propostas || []

    if (propostas.length === 0) {
      return []
    }

    // 2. Para cada proposta, buscar dados da oportunidade
    const proposals = await Promise.all(
      propostas.map(async (proposta) => {
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
