import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import { notFound } from 'next/navigation'
import { CurriculoContent } from '../../../curriculo/curriculo-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InscricaoCurriculoPage({ params }: PageProps) {
  const { id: vagaId } = await params

  const response = await getApiPublicEmpregabilidadeVagasId(vagaId)
  if (response.status !== 200 || !response.data) {
    notFound()
  }

  const hasPerguntasAdicionais =
    (response.data.informacoes_complementares?.length ?? 0) > 0

  return (
    <CurriculoContent
      inscricaoVagaId={vagaId}
      backRoute={`/servicos/empregos/${vagaId}`}
      hasPerguntasAdicionais={hasPerguntasAdicionais}
    />
  )
}
