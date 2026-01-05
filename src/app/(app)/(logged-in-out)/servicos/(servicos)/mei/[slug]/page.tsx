import {
  MeiOpportunityDetailClient,
  type MeiOpportunityDetailData,
} from '@/app/components/mei'
import type { UserMeiContext } from '@/app/components/mei/service-type-drawer'
import { getApiV1OportunidadesMeiId } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { getApiV1PropostasMeiPorEmpresa } from '@/http-courses/propostas-mei/propostas-mei'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import {
  mapApiToMeiOpportunityDetail,
  mapSituacaoCadastral,
} from '@/lib/mei-utils'
import { getUserLegalEntity } from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

async function getMeiOpportunityBySlug(
  slug: string
): Promise<MeiOpportunityDetailData | null> {
  try {
    const id = Number.parseInt(slug, 10)
    if (Number.isNaN(id)) {
      return null
    }

    const response = await getApiV1OportunidadesMeiId(id)

    if (response.status !== 200 || !response.data) {
      return null
    }

    const opportunity = response.data

    let organizationName: string | undefined
    if (opportunity.orgao_id) {
      try {
        const departmentResponse = await getDepartmentsCdUa(
          opportunity.orgao_id
        )
        if (departmentResponse.status === 200 && departmentResponse.data) {
          organizationName = departmentResponse.data.nome_ua
        }
      } catch (departmentError) {
        console.error(
          '[MEI] Error fetching department data, continuing without it:',
          departmentError
        )
      }
    }

    return mapApiToMeiOpportunityDetail(opportunity, organizationName)
  } catch (error) {
    console.error('[MEI] Error fetching opportunity:', error)
    return null
  }
}

export default async function MeiOpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  let userMeiContext: UserMeiContext = {
    isLoggedIn,
    hasMei: false,
    situacaoCadastral: undefined,
    userCnaes: undefined,
  }

  let userCnpj: string | undefined
  let userProposal: { id: string; status: string } | null = null

  if (isLoggedIn && userInfo.cpf) {
    const result = await getUserLegalEntity(userInfo.cpf)
    if (result) {
      const { entity, cnpj } = result
      userCnpj = cnpj
      userMeiContext = {
        isLoggedIn: true,
        hasMei: true,
        situacaoCadastral: mapSituacaoCadastral(
          entity.situacao_cadastral?.descricao
        ),
        userCnaes: [
          entity.cnae_fiscal,
          ...(entity.cnae_secundarias || []),
        ].filter(Boolean) as string[],
      }
    }
  }

  // Buscar proposta existente do usuário para esta oportunidade
  if (userMeiContext.hasMei && userCnpj) {
    try {
      const proposalsRes = await getApiV1PropostasMeiPorEmpresa({
        meiEmpresaId: userCnpj.replace(/\D/g, ''),
        page: 1,
        pageSize: 50,
      })

      if (proposalsRes.status === 200 && proposalsRes.data) {
        const apiData = proposalsRes.data as {
          data?: Array<{
            id?: string
            oportunidade_mei_id?: number
            status_cidadao?: string
          }>
        }
        const propostas = apiData.data || []
        const opportunityId = Number.parseInt(slug, 10)

        const existingProposal = propostas.find(
          p => p.oportunidade_mei_id === opportunityId
        )

        if (existingProposal?.id) {
          userProposal = {
            id: existingProposal.id,
            status: existingProposal.status_cidadao || 'submitted',
          }
        }
      }
    } catch (error) {
      console.error('[MEI] Error checking existing proposal:', error)
    }
  }

  const opportunity = await getMeiOpportunityBySlug(slug)

  if (!opportunity) {
    notFound()
  }

  return (
    <MeiOpportunityDetailClient
      opportunity={opportunity}
      userMeiContext={userMeiContext}
      userProposal={userProposal}
    />
  )
}
