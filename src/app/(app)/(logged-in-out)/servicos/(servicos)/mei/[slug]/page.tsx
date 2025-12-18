import {
  MeiOpportunityDetailClient,
  type MeiOpportunityDetailData,
} from '@/app/components/mei'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

const MOCK_OPPORTUNITIES: Record<string, MeiOpportunityDetailData> = {
  '1': {
    id: 1,
    slug: '1',
    title:
      'Reparador de máquinas e aparelhos de refrigeração e ventilação para uso comercial e industrial',
    serviceType: 'Manutenção e reparação de máquinas e equipamentos',
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    coverImage:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop',
    description: `A Secretaria de Meio Ambiente do Recife, no uso de suas atribuições legais, torna pública a necessidade de contratação de Microempreendedor Individual (MEI) para execução de serviços de limpeza preventiva de aparelhos de ar-condicionado instalados nesta Pasta, conforme especificações abaixo: Relação dos equipamentos: 17 (dezessete) aparelhos de 9.000 BTU; 05 (cinco) aparelhos de 12.000 BTU; 05 (cinco) aparelhos de 24.000 BTU; 09 (nove) aparelhos de 30.000 BTU. Observações importantes: Todos os equipamentos possuem tempo de uso inferior a oito meses.

O serviço a ser prestado restringe-se exclusivamente à limpeza preventiva; A contratação será formalizada via Plataforma +Brasil, conforme disposições legais aplicáveis.

O pagamento será realizado via empenho em até 10 dias após a conclusão do serviço: Destina-se exclusivamente à participação de MEIs regularmente cadastrados e habilitados para a atividade de manutenção e limpeza de aparelhos de climatização.`,
    organization: {
      name: 'Secretaria Municipal de Saúde',
    },
    location: {
      name: 'Prédio da Secretaria Municipal de Saúde',
      address: 'Avenida Presidente Vargas, 1153 - Centro',
    },
    payment: {
      method: 'Empenho',
      deadline: '30 dias após emissão de nota fiscal',
    },
    executionDeadline: '29/04/2026',
    attachments: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&q=60',
        name: 'Equipamento de refrigeração',
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&q=60',
        name: 'Sistema de ventilação',
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=60',
        name: 'Imagem do Equipamento',
      },
    ],
  },
  '2': {
    id: 2,
    slug: '2',
    title: 'Reparador de extintor de incêndio',
    serviceType: 'Manutenção de equipamentos de segurança',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    coverImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    description: `Serviço de recarga e manutenção de extintores de incêndio para as unidades da Secretaria Municipal de Saúde.

O serviço inclui:
- Inspeção visual dos extintores
- Verificação de pressão e peso
- Recarga quando necessário
- Substituição de peças danificadas
- Emissão de certificado de conformidade`,
    organization: {
      name: 'Secretaria Municipal de Saúde',
    },
    location: {
      name: 'Almoxarifado Central',
      address: 'Rua do Lavradio, 180 - Centro',
    },
    payment: {
      method: 'Empenho',
      deadline: '30 dias após emissão de nota fiscal',
    },
    executionDeadline: '15/03/2026',
    attachments: [],
  },
  '3': {
    id: 3,
    slug: '3',
    title: 'Técnico em manutenção de equipamentos industriais',
    serviceType: 'Manutenção de equipamentos industriais',
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    coverImage:
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
    description: `Contratação de MEI para execução de serviços de manutenção preventiva e corretiva em equipamentos industriais da unidade.

Escopo dos serviços:
- Diagnóstico de falhas em equipamentos
- Manutenção preventiva programada
- Substituição de componentes desgastados
- Ajustes e calibrações necessárias
- Relatório técnico detalhado`,
    organization: {
      name: 'Secretaria Municipal de Obras',
    },
    location: {
      name: 'Galpão de Manutenção',
      address: 'Rua México, 125 - Centro',
    },
    payment: {
      method: 'Empenho',
      deadline: '15 dias após emissão de nota fiscal',
    },
    executionDeadline: '10/02/2026',
    attachments: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=300&fit=crop&q=60',
        name: 'Lista de Equipamentos',
      },
    ],
  },
  '4': {
    id: 4,
    slug: '4',
    title: 'Eletricista de manutenção predial',
    serviceType: 'Serviços elétricos prediais',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    coverImage:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&h=600&fit=crop',
    description: `Contratação de eletricista MEI para serviços de manutenção elétrica predial nas instalações da secretaria.

Serviços necessários:
- Revisão do quadro de distribuição
- Troca de disjuntores defeituosos
- Instalação de novos pontos elétricos
- Verificação de aterramento
- Emissão de laudo técnico`,
    organization: {
      name: 'Secretaria Municipal de Administração',
    },
    location: {
      name: 'Sede Administrativa',
      address: 'Rua Afonso Cavalcanti, 455 - Cidade Nova',
    },
    payment: {
      method: 'Empenho',
      deadline: '30 dias após emissão de nota fiscal',
    },
    executionDeadline: '20/05/2026',
    attachments: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop&q=60',
        name: 'Planta Elétrica',
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90',
        thumbnail:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=60',
        name: 'Orçamento Base',
      },
    ],
  },
}

async function getMeiOpportunityBySlug(
  slug: string
): Promise<MeiOpportunityDetailData | null> {
  return MOCK_OPPORTUNITIES[slug] || null
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
    <MeiOpportunityDetailClient opportunity={opportunity} isLoggedIn={isLoggedIn} />
  )
}
