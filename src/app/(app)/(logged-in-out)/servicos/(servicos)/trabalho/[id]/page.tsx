import { VagaDetailClient } from '@/app/components/empregos/vaga-detail-client'
import { getDepartmentsCdUa } from '@/http/departments/departments'
import { mapEmpregabilidadeVagaToDetail } from '@/lib/emprego-utils'
import {
  type VagaParamResolution,
  resolveVagaParam,
} from '@/lib/resolve-vaga-param'
import { notFound, permanentRedirect } from 'next/navigation'

interface PageProps {
  // Segmento da URL: slug da vaga (`<titulo>-<hex>`) ou, em links antigos, o UUID
  params: Promise<{ id: string }>
}

export default async function VagaDetailPage({ params }: PageProps) {
  const { id: vagaParam } = await params

  let resolution: VagaParamResolution
  try {
    resolution = await resolveVagaParam(vagaParam)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    notFound()
  }

  if (resolution.kind === 'redirect') {
    permanentRedirect(resolution.path)
  }

  if (resolution.kind === 'not_found') {
    notFound()
  }

  const vagaData = resolution.vaga
  const vagaAtiva = vagaData.status === 'publicado_ativo'
  const vaga = mapEmpregabilidadeVagaToDetail(vagaData)

  // Fallback: se o backend não retornou orgao_parceiro mas temos o ID,
  // busca o nome do órgão diretamente na API de departamentos (RMI)
  if (!vaga.orgaoParceiro && vagaData.id_orgao_parceiro) {
    try {
      const departmentResponse = await getDepartmentsCdUa(
        vagaData.id_orgao_parceiro
      )
      if (departmentResponse.status === 200 && departmentResponse.data) {
        vaga.orgaoParceiro = departmentResponse.data.nome_ua
      }
    } catch (error) {
      console.error('[Trabalho] Erro ao buscar órgão parceiro.', error)
    }
  }

  return (
    <div className="pb-36">
      <VagaDetailClient vaga={vaga} vagaAtiva={vagaAtiva} />
    </div>
  )
}
