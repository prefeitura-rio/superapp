import type { MeiProposal } from './types'

// TODO: Replace with actual API call
export async function getMyProposals(): Promise<MeiProposal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Mock data - return empty array to test empty state
  return [
    {
      id: 1,
      opportunityId: 1,
      opportunitySlug: '1',
      title: 'Reparador(a) de equipamentos médico-hospitalares não eletrônicos',
      coverImage:
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
      status: 'aprovada',
    },
    {
      id: 2,
      opportunityId: 2,
      opportunitySlug: '2',
      title: 'Manutenção de ar-condicionado em prédios públicos',
      coverImage:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      status: 'em_analise',
    },
    {
      id: 3,
      opportunityId: 3,
      opportunitySlug: '3',
      title: 'Serviços de limpeza e conservação predial',
      coverImage:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      status: 'recusada',
    },
    {
      id: 4,
      opportunityId: 4,
      opportunitySlug: '4',
      title: 'Instalação de sistemas elétricos',
      coverImage:
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      status: 'concluida',
    },
  ]
}
