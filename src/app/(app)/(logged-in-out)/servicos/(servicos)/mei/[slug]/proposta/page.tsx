import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { MeiProposalClient } from './mei-proposal-client'

// Mock function to get MEI company data - will be replaced with real API call
async function getMeiCompanyData(_cpf: string) {
  // Simulating API response delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return {
    cnpj: '12.345.678/0001-95',
    razaoSocial: 'NOVA ERA TECNOLOGIA E SERVIÇOS LTDA',
    nomeFantasia: 'TECHNOVA',
    telefone: {
      ddi: '55',
      ddd: '21',
      valor: '99866-5327',
    },
    email: 'marina.duarte@gmail.com',
  }
}

export default async function MeiProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const userInfo = await getUserInfoFromToken()

  // Redirect to login if not authenticated
  if (!userInfo.cpf || !userInfo.name) {
    redirect(`/servicos/mei/${slug}`)
  }

  const companyData = await getMeiCompanyData(userInfo.cpf)

  return (
    <MeiProposalClient
      slug={slug}
      companyData={companyData}
    />
  )
}
