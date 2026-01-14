import { mapLegalEntityToMeiCompanyData } from '@/lib/mei-utils'
import {
  getCitizenContactInfo,
  getUserLegalEntity,
} from '@/lib/mei-utils.server'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { MeiProposalClient } from './mei-proposal-client'
import { getApiV1PropostasMeiPorEmpresa } from '@/http-courses/propostas-mei/propostas-mei'

export default async function MeiProposalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { slug } = await params
  const { mode } = await searchParams
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

  // Sempre buscar proposta existente para determinar se está em modo de edição
  let existingProposal = null
  try {
    const cnpj = result.cnpj.replace(/\D/g, '')
    const proposalsRes = await getApiV1PropostasMeiPorEmpresa({
      meiEmpresaId: cnpj,
      page: 1,
      pageSize: 50,
    })

    if (proposalsRes.status === 200 && proposalsRes.data) {
      const apiData = proposalsRes.data as {
        data?: Array<{
          id?: string
          oportunidade_mei_id?: number
          valor_proposta?: number
          prazo_execucao?: string
          aceita_custos_integrais?: boolean
          status_cidadao?: string
        }>
      }
      const propostas = apiData.data || []
      const opportunityId = Number.parseInt(slug, 10)

      const proposal = propostas.find(
        p => p.oportunidade_mei_id === opportunityId
      )

      if (proposal && proposal.id) {
        // Apenas propostas com status 'submitted' podem ser editadas
        if (proposal.status_cidadao === 'submitted') {
          existingProposal = {
            id: proposal.id,
            value: proposal.valor_proposta || 0,
            duration: Number.parseInt(proposal.prazo_execucao || '0', 10),
            acceptedTerms: proposal.aceita_custos_integrais || false,
          }
        } else if (mode === 'edit') {
          // Se mode=edit mas proposta não está em status 'submitted', redireciona
          redirect(`/servicos/mei/${slug}`)
        }
        // Se há proposta mas não está em status 'submitted' e não é mode=edit,
        // existingProposal fica null (usuário não deveria estar aqui, mas não redirecionamos para não quebrar outros fluxos)
      } else if (mode === 'edit') {
        // Se mode=edit mas não encontrou proposta para editar, redireciona
        redirect(`/servicos/mei/${slug}`)
      }
    }
  } catch (error) {
    console.error('[MEI Proposal] Error fetching existing proposal:', error)
    // Se estava em modo de edição explícito e deu erro, redireciona
    if (mode === 'edit') {
      redirect(`/servicos/mei/${slug}`)
    }
    // Se não estava em modo de edição, apenas continua (existingProposal será null)
  }

  return (
    <MeiProposalClient
      slug={slug}
      companyData={companyData}
      existingProposal={existingProposal}
    />
  )
}
