import { VagaDetailClient } from '@/app/components/empregos/vaga-detail-client'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { mapEmpregabilidadeVagaToDetail } from '@/lib/emprego-utils'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id } = await params

  try {
    const response = await getApiPublicEmpregabilidadeVagasId(id)

    if (response.status !== 200 || !response.data) {
      notFound()
    }

    const vagaAtiva = response.data.status === 'publicado_ativo'
    const vaga = mapEmpregabilidadeVagaToDetail(response.data)

    // Fallback: se o backend não retornou orgao_parceiro mas temos o ID,
    // busca o nome do órgão diretamente na API de departamentos (RMI)
    if (!vaga.orgaoParceiro && response.data.id_orgao_parceiro) {
      try {
        const departmentResponse = await getDepartmentsCdUa(
          response.data.id_orgao_parceiro
        )
        if (departmentResponse.status === 200 && departmentResponse.data) {
          vaga.orgaoParceiro = departmentResponse.data.nome_ua
        }
      } catch (error) {
        console.error('[Emprego] Erro ao buscar órgão parceiro.', error)
      }
    }

    return (
      <div className="min-h-lvh pb-36">
        <VagaDetailClient vaga={vaga} vagaAtiva={vagaAtiva} />
      </div>
    )
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    notFound()
  }
}
