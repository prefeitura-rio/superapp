import { VagaDetailContent } from '@/app/components/empregos/vaga-detail-content'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getMockVagaDetailById } from '@/mocks/mock-vagas'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id } = await params
  const idNum = Number(id)
  if (Number.isNaN(idNum) || idNum < 1) notFound()

  const vaga = getMockVagaDetailById(idNum)
  if (!vaga) notFound()

  const userInfo = await getUserInfoFromToken()
  const isLoggedIn = !!(userInfo.cpf && userInfo.name)

  return (
    <div className="min-h-lvh pb-36">
      <VagaDetailContent vaga={vaga} isLoggedIn={isLoggedIn} />
    </div>
  )
}
