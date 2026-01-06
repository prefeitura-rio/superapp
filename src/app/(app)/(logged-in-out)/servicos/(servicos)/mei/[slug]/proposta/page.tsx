import { mapLegalEntityToMeiCompanyData } from '@/lib/mei-utils'
import {
  getCitizenContactInfo,
  getUserLegalEntity,
} from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { MeiProposalClient } from './mei-proposal-client'

export default async function MeiProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf || !userInfo.name) {
    redirect(`/servicos/mei/${slug}`)
  }

  const result = await getUserLegalEntity(userInfo.cpf)
  if (!result) {
    redirect(`/servicos/mei/${slug}`)
  }

  const companyData = mapLegalEntityToMeiCompanyData(result.entity)

  // Override contact info with citizen's personal data (see getCitizenContactInfo for details)
  const citizenContact = await getCitizenContactInfo(userInfo.cpf)
  if (citizenContact) {
    companyData.telefone = citizenContact.telefone
    companyData.email = citizenContact.email
  }

  return <MeiProposalClient slug={slug} companyData={companyData} />
}
