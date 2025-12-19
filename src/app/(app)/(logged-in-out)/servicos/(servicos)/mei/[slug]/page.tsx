import {
  MeiOpportunityDetailClient,
  type MeiOpportunityDetailData,
} from '@/app/components/mei'
import { getApiV1OportunidadesMeiId } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { mapApiToMeiOpportunityDetail } from '@/lib/mei-utils'
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

  const opportunity = await getMeiOpportunityBySlug(slug)

  if (!opportunity) {
    notFound()
  }

  return (
    <MeiOpportunityDetailClient
      opportunity={opportunity}
      isLoggedIn={isLoggedIn}
    />
  )
}
