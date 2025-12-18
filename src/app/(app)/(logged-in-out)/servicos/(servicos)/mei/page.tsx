import { MeiPageClient } from '@/app/components/mei'
import { FloatNavigation } from '@/app/components/float-navigation'
import { getUserInfoFromToken } from '@/lib/user-info'
import type { MeiOpportunity } from '@/app/components/mei'

// Mock data - será substituído por dados reais do servidor
async function getMeiOpportunities(): Promise<MeiOpportunity[]> {
  // Simula delay de servidor
  // await new Promise((resolve) => setTimeout(resolve, 500))

  const now = new Date()

  return [
    {
      id: 1,
      title: 'Reparador de máquinas e aparelhos de refrigeração e ventilação',
      expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=200&fit=crop',
    },
    {
      id: 2,
      title: 'Reparador de extintor de incêndio',
      expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias
      coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      title: 'Reparador(a) de equipamentos médico-hospitalares não eletrônicos',
      expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas
      coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
    },
    {
      id: 4,
      title: 'Técnico em manutenção de equipamentos industriais',
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      coverImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop',
    },
  ]
}

export default async function MeiPage() {
  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  // Busca dados do servidor (mock por enquanto)
  const opportunities = await getMeiOpportunities()

  return (
    <>
      <MeiPageClient opportunities={opportunities} isLoggedIn={isLoggedIn} />
      <FloatNavigation />
    </>
  )
}
