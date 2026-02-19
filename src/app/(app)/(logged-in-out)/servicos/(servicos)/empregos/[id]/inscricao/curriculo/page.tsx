import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound } from 'next/navigation'
import { CurriculoContent } from '../../../curriculo/curriculo-content'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InscricaoCurriculoPage({ params }: PageProps) {
  const { id: vagaId } = await params

  const [vagaResponse, userAuthInfo] = await Promise.all([
    getApiPublicEmpregabilidadeVagasId(vagaId),
    getUserInfoFromToken(),
  ])

  if (vagaResponse.status !== 200 || !vagaResponse.data) {
    notFound()
  }

  const hasPerguntasAdicionais =
    (vagaResponse.data.informacoes_complementares?.length ?? 0) > 0

  let initialEscolaridade: string | undefined
  if (userAuthInfo.cpf) {
    try {
      const citizenResponse = await getDalCitizenCpf(userAuthInfo.cpf)
      if (citizenResponse.status === 200 && citizenResponse.data) {
        const userInfo = citizenResponse.data as ModelsCitizen
        initialEscolaridade = userInfo.escolaridade?.trim() || undefined
      }
    } catch {
      // mantém undefined em caso de erro
    }
  }

  return (
    <CurriculoContent
      inscricaoVagaId={vagaId}
      backRoute={`/servicos/empregos/${vagaId}`}
      hasPerguntasAdicionais={hasPerguntasAdicionais}
      initialEscolaridade={initialEscolaridade}
    />
  )
}
