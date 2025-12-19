import { FloatNavigation } from '@/app/components/float-navigation'
import type { MeiOpportunity } from '@/app/components/mei'
import { MeiPageClient } from '@/app/components/mei'
import type { ModelsOportunidadeMEI } from '@/http-courses/models'
import { getApiV1OportunidadesMei } from '@/http-courses/oportunidades-mei/oportunidades-mei'
import { mapApiToMeiOpportunity } from '@/lib/mei-utils'
import { getUserInfoFromToken } from '@/lib/user-info'

interface OportunidadesMeiApiResponse {
  data: {
    oportunidades?: ModelsOportunidadeMEI[]
  }
  success?: boolean
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

export default async function MeiPage() {
  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  const opportunities = await getMeiOpportunities()

  return (
    <>
      <MeiPageClient opportunities={opportunities} isLoggedIn={isLoggedIn} />
      <FloatNavigation />
    </>
  )
}
