import { VagaDetailContent } from '@/app/components/empregos/vaga-detail-content'
import { isVagaValida } from '@/app/components/empregos/vagas-utils'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { mapEmpregabilidadeVagaToDetail } from '@/lib/emprego-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id } = await params

  // Busca vaga da API
  try {
    const response = await getApiPublicEmpregabilidadeVagasId(id)

    if (response.status !== 200 || !response.data) {
      notFound()
    }

    // Valida se a vaga está ativa
    if (!isVagaValida(response.data)) {
      notFound()
    }

    // Transforma para o formato VagaDetail
    const vaga = mapEmpregabilidadeVagaToDetail(response.data)

    const userInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userInfo.cpf && userInfo.name)

    return (
      <div className="min-h-lvh pb-36">
        <VagaDetailContent vaga={vaga} isLoggedIn={isLoggedIn} />
      </div>
    )
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    notFound()
  }
}
