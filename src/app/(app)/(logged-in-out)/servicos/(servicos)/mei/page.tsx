import { FloatNavigation } from '@/app/components/float-navigation'
import type { MeiOpportunity, MeiProposal } from '@/app/components/mei'
import { MeiPageClient } from '@/app/components/mei'
import type {
  ModelsOportunidadeMEI,
  ModelsPropostaMEI,
} from '@/http-courses/models'
import { getApiV1OportunidadesMei } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { getApiV1OportunidadesMeiId } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { getApiV1PropostasMeiPorEmpresa } from '@/http-courses/propostas-mei/propostas-mei'
import { mapApiToMeiOpportunity, mapApiToMeiProposal } from '@/lib/mei-utils'
import { getUserLegalEntity } from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'

export const dynamic = 'force-dynamic'

interface OportunidadesMeiApiResponse {
  data: {
    oportunidades?: ModelsOportunidadeMEI[]
  }
  success?: boolean
}

interface PropostasApiResponse {
  data?: ModelsPropostaMEI[]
  meta?: {
    page: number
    page_size: number
    total: number
  }
}

async function getMeiOpportunities(): Promise<MeiOpportunity[]> {
  try {
    const response = await getApiV1OportunidadesMei({
      page: 1,
      pageSize: 50,
      status: 'active',
    })

    if (response.status === 200) {
      const data = response.data as unknown as OportunidadesMeiApiResponse

      const opportunities =
        data?.data?.oportunidades ||
        (data?.data as unknown as ModelsOportunidadeMEI[]) ||
        (Array.isArray(data) ? data : [])

      if (Array.isArray(opportunities) && opportunities.length > 0) {
        return opportunities.map(mapApiToMeiOpportunity)
      }
    }

    return []
  } catch (error) {
    console.error('[MEI] Error fetching opportunities:', error)
    return []
  }
}

async function getUserProposals(cpf: string): Promise<MeiProposal[]> {
  try {
    // Buscar CNPJ do usuário
    const result = await getUserLegalEntity(cpf)
    if (!result?.cnpj) {
      return []
    }

    // Buscar propostas
    const proposalsRes = await getApiV1PropostasMeiPorEmpresa({
      meiEmpresaId: result.cnpj.replace(/\D/g, ''),
      page: 1,
      pageSize: 50,
    })

    if (proposalsRes.status !== 200 || !proposalsRes.data) {
      return []
    }

    const apiData = proposalsRes.data as PropostasApiResponse
    const propostas = apiData.data || []

    if (propostas.length === 0) {
      return []
    }

    // Para cada proposta, buscar dados da oportunidade
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
            console.error('[MEI] Error fetching opportunity:', e)
          }
        }

        return mapApiToMeiProposal(proposta, oportunidade)
      })
    )

    return proposals
  } catch (error) {
    console.error('[MEI] Error fetching user proposals:', error)
    return []
  }
}

export default async function MeiPage() {
  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  const opportunities = await getMeiOpportunities()

  let userProposals: MeiProposal[] = []
  if (isLoggedIn && userInfo.cpf) {
    userProposals = await getUserProposals(userInfo.cpf)
  }

  // Filtrar oportunidades que já têm proposta do usuário
  const userProposalOpportunityIds = new Set(
    userProposals.map(p => p.opportunityId)
  )
  const filteredOpportunities = opportunities.filter(
    op => !userProposalOpportunityIds.has(op.id)
  )

  return (
    <>
      <MeiPageClient
        opportunities={filteredOpportunities}
        userProposals={userProposals}
      />
      <FloatNavigation />
    </>
  )
}
