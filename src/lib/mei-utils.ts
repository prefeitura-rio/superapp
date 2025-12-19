import type {
  ModelsOportunidadeMEI,
  ModelsPropostaMEI,
  ModelsPropostaMEIStatusCidadao,
} from '@/http-courses/models'
import type {
  MeiOpportunity,
  MeiOpportunityDetailData,
  MeiAttachment,
} from '@/app/components/mei'
import type {
  MeiProposal,
  ProposalStatus,
} from '@/app/(app)/(logged-in-out)/servicos/(servicos)/mei/minhas-propostas/types'

/**
 * Mapeia forma de pagamento da API para texto legível
 */
export function formatPaymentMethod(method?: string): string {
  const paymentMethodMap: Record<string, string> = {
    CHEQUE: 'Cheque',
    DINHEIRO: 'Dinheiro',
    CARTAO: 'Cartão',
    PIX: 'PIX',
    TRANSFERENCIA: 'Transferência Bancária',
  }

  if (!method || method === '') {
    return 'Não informado'
  }

  return paymentMethodMap[method] || method
}

/**
 * Formata o endereço completo a partir dos campos da API
 */
export function formatMeiAddress(api: ModelsOportunidadeMEI): string {
  const parts: string[] = []

  if (api.logradouro) {
    let addressLine = api.logradouro
    if (api.numero) {
      addressLine += `, ${api.numero}`
    }
    if (api.complemento) {
      addressLine += ` - ${api.complemento}`
    }
    parts.push(addressLine)
  }

  if (api.bairro) {
    parts.push(api.bairro)
  }

  if (api.cidade) {
    let cityLine = api.cidade
    if (api.estado) {
      cityLine += ` - ${api.estado}`
    }
    parts.push(cityLine)
  }

  return parts.join(', ') || 'Endereço não informado'
}

/**
 * Formata data ISO para formato brasileiro (DD/MM/YYYY)
 */
export function formatMeiDate(isoDate?: string): string {
  if (!isoDate) {
    return 'Não informado'
  }

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Mapeia gallery_images (array de URLs) para MeiAttachment[]
 */
export function mapGalleryToAttachments(
  galleryImages?: string[]
): MeiAttachment[] {
  if (!galleryImages || galleryImages.length === 0) {
    return []
  }

  return galleryImages.map((url, index) => ({
    id: index + 1,
    url: url,
    thumbnail: url,
    name: `Imagem ${index + 1}`,
  }))
}

/**
 * Mapper: API ModelsOportunidadeMEI -> Frontend MeiOpportunity (lista)
 */
export function mapApiToMeiOpportunity(
  api: ModelsOportunidadeMEI
): MeiOpportunity {
  return {
    id: api.id ?? 0,
    title: api.titulo ?? 'Sem título',
    expiresAt: api.data_expiracao ?? new Date().toISOString(),
    coverImage: api.cover_image,
  }
}

/**
 * Mapper: API ModelsOportunidadeMEI -> Frontend MeiOpportunityDetailData (detalhe)
 */
export function mapApiToMeiOpportunityDetail(
  api: ModelsOportunidadeMEI,
  organizationName?: string
): MeiOpportunityDetailData {
  return {
    id: api.id ?? 0,
    slug: String(api.id ?? 0),
    title: api.titulo ?? 'Sem título',
    expiresAt: api.data_expiracao ?? new Date().toISOString(),
    coverImage: api.cover_image,
    serviceType: 'MEI',
    description: api.descricao_servico ?? 'Descrição não disponível',
    organization: {
      name: organizationName || api.orgao_id || 'Órgão não informado',
    },
    location: {
      name: 'Local de execução',
      address: formatMeiAddress(api),
    },
    payment: {
      method: formatPaymentMethod(api.forma_pagamento),
      deadline: api.prazo_pagamento || 'Não informado',
    },
    executionDeadline: formatMeiDate(api.data_limite_execucao),
    attachments: mapGalleryToAttachments(api.gallery_images),
  }
}

/**
 * Mapeia status da API para status do frontend
 */
export function mapApiStatusToProposalStatus(
  statusCidadao?: ModelsPropostaMEIStatusCidadao
): ProposalStatus {
  const statusMap: Record<string, ProposalStatus> = {
    submitted: 'em_analise',
    approved: 'aprovada',
    rejected: 'recusada',
  }
  return statusMap[statusCidadao || ''] || 'em_analise'
}

/**
 * Mapper: API ModelsPropostaMEI -> Frontend MeiProposal
 * Requer dados da oportunidade para title e coverImage
 */
export function mapApiToMeiProposal(
  proposta: ModelsPropostaMEI,
  oportunidade: { titulo?: string; cover_image?: string }
): MeiProposal {
  return {
    id: Number(proposta.id) || 0,
    opportunityId: proposta.oportunidade_mei_id || 0,
    opportunitySlug: String(proposta.oportunidade_mei_id || 0),
    title: oportunidade.titulo || 'Oportunidade',
    coverImage: oportunidade.cover_image,
    status: mapApiStatusToProposalStatus(proposta.status_cidadao),
  }
}

