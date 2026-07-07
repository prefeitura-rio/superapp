import { VagaDetailClient } from '@/app/components/empregos/vaga-detail-client'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { mapEmpregabilidadeVagaToDetail } from '@/lib/emprego-utils'
import { notFound, redirect } from 'next/navigation'
import { type PublicVagaResult, getPublicVaga } from './vaga-lookup'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id } = await params
  let result: PublicVagaResult

  try {
    result = await getPublicVaga(id)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    notFound()
  }

  if (!result) {
    notFound()
  }

  if ('redirectSlug' in result) {
    redirect(`/servicos/trabalho/${encodeURIComponent(result.redirectSlug)}`)
  }

  const vagaAtiva = result.vaga.status === 'publicado_ativo'
  const vaga = mapEmpregabilidadeVagaToDetail(result.vaga)

  // Fallback: se o backend não retornou orgao_parceiro mas temos o ID,
  // busca o nome do órgão diretamente na API de departamentos (RMI)
  if (!vaga.orgaoParceiro && result.vaga.id_orgao_parceiro) {
    try {
      const departmentResponse = await getDepartmentsCdUa(
        result.vaga.id_orgao_parceiro
      )
      if (departmentResponse.status === 200 && departmentResponse.data) {
        vaga.orgaoParceiro = departmentResponse.data.nome_ua
      }
    } catch (error) {
      console.error('[Trabalho] Erro ao buscar órgão parceiro.', error)
    }
  }

  return (
    <div className="min-h-lvh pb-36">
      <VagaDetailClient vaga={vaga} vagaAtiva={vagaAtiva} />
    </div>
  )
}
