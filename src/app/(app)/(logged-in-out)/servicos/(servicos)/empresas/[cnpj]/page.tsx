import { EmpresaDetailContent } from '@/app/components/empresas/empresa-detail-content'
import {
  getMockEmpresaByCnpj,
  getMockVagasByEmpresaCnpj,
} from '@/mocks/mock-empresas'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ cnpj: string }>
}

export default async function EmpresaDetailPage({ params }: PageProps) {
  const { cnpj } = await params
  const decodedCnpj = decodeURIComponent(cnpj)
  const empresa = getMockEmpresaByCnpj(decodedCnpj)
  if (!empresa) notFound()

  const vagas = getMockVagasByEmpresaCnpj(decodedCnpj)

  return <EmpresaDetailContent empresa={empresa} vagas={vagas} />
}
