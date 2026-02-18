import { EmpresaDetailContent } from '@/app/components/empresas/empresa-detail-content'
import { processVagas } from '@/app/components/empregos/vagas-utils'
import { getApiV1EmpregabilidadeEmpresasCnpj } from '@/http-courses/empregabilidade-empresas/empregabilidade-empresas'
import { getApiV1EmpregabilidadeVagas } from '@/http-courses/empregabilidade-vagas/empregabilidade-vagas'
import type { EmpregabilidadeVaga } from '@/http-courses/models'
import { mapEmpregabilidadeEmpresaToDetail } from '@/lib/empresa-utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ cnpj: string }>
}

export default async function EmpresaDetailPage({ params }: PageProps) {
  const { cnpj } = await params
  const decodedCnpj = decodeURIComponent(cnpj)

  try {
    // Busca empresa da API
    const empresaResponse = await getApiV1EmpregabilidadeEmpresasCnpj(
      decodedCnpj
    )

    if (empresaResponse.status !== 200 || !empresaResponse.data) {
      notFound()
    }

    const empresa = mapEmpregabilidadeEmpresaToDetail(empresaResponse.data)

    // Busca vagas da empresa usando o filtro contratante
    let vagasEmpresa: EmpregabilidadeVaga[] = []

    try {
      const vagasResponse = await getApiV1EmpregabilidadeVagas({
        contratante: decodedCnpj,
        status: 'publicado_ativo',
      })

      if (vagasResponse.status === 200 && vagasResponse.data) {
        const apiData = vagasResponse.data as { data?: EmpregabilidadeVaga[] }
        vagasEmpresa = apiData.data || []
      }
    } catch (error) {
      console.error('Erro ao buscar vagas da empresa:', error)
    }

    // Processa e filtra vagas
    const vagas = processVagas(vagasEmpresa)

    return <EmpresaDetailContent empresa={empresa} vagas={vagas} />
  } catch (error) {
    console.error('Erro ao buscar empresa:', error)
    notFound()
  }
}
