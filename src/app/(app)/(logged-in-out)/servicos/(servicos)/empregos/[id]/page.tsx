import { VagaDetailContent } from '@/app/components/empregos/vaga-detail-content'
import { isVagaValida } from '@/app/components/empregos/vagas-utils'
import { getApiV1EmpregabilidadeCandidaturas } from '@/http-courses/empregabilidade-candidaturas/empregabilidade-candidaturas'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeCandidatura } from '@/http-courses/models'
import { mapEmpregabilidadeVagaToDetail } from '@/lib/emprego-utils'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

interface CandidaturasListResponse {
  data: EmpregabilidadeCandidatura[]
  meta: { page: number; page_size: number; total: number }
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id } = await params

  try {
    const response = await getApiPublicEmpregabilidadeVagasId(id)

    if (response.status !== 200 || !response.data) {
      notFound()
    }

    if (!isVagaValida(response.data)) {
      notFound()
    }

    const vaga = mapEmpregabilidadeVagaToDetail(response.data)

    const userInfo = await getUserInfoFromToken()
    const isLoggedIn = !!(userInfo.cpf && userInfo.name)

    let hasCandidatura = false
    if (userInfo.cpf?.trim()) {
      const cpf = userInfo.cpf.replace(/\D/g, '')
      try {
        const res = await getApiV1EmpregabilidadeCandidaturas({
          cpf,
          vagaId: id,
          page: 1,
          pageSize: 1,
        })
        if (res.status === 200) {
          const body = res.data as unknown as CandidaturasListResponse
          const list = Array.isArray(body.data) ? body.data : []
          if (list.length > 0) {
            hasCandidatura = true
            const candidatura = list[0]
            const ordem = candidatura.etapa_atual?.ordem
            if (typeof ordem === 'number' && ordem >= 1) {
              vaga.etapaAtualCandidatura = ordem - 1
            }
            if (candidatura.status) {
              vaga.statusCandidatura = candidatura.status
            }
          }
        }
      } catch {
        // ignore; usuário não candidato ou erro na API
      }
    }

    return (
      <div className="min-h-lvh pb-36">
        <VagaDetailContent
          vaga={vaga}
          isLoggedIn={isLoggedIn}
          hasCandidatura={hasCandidatura}
        />
      </div>
    )
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    notFound()
  }
}
