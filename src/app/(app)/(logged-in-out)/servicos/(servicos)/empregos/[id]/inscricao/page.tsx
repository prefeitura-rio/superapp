import { buildAuthUrl } from '@/constants/url'
import { normalizeEmailData } from '@/helpers/email-data-helpers'
import { normalizePhoneData } from '@/helpers/phone-data-helpers'
import { getApiV1EmpregabilidadeOnboardingCpf } from '@/http-courses/empregabilidade-onboarding/empregabilidade-onboarding'
import { getApiPublicEmpregabilidadeVagasId } from '@/http-courses/empregabilidade-vagas-public/empregabilidade-vagas-public'
import type { EmpregabilidadeInformacaoComplementar } from '@/http-courses/models/empregabilidadeInformacaoComplementar'
import type {
  ModelsEmailPrincipal,
  ModelsTelefonePrincipal,
} from '@/http/models'
import type { ModelsCitizen } from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { getCurriculoFormacaoData } from '../../curriculo/get-curriculo-formacao-data'
import { getFormacaoOptions } from '../../curriculo/get-formacao-options'
import type { EmpregosUserInfo } from './confirmar-informacoes/types'
import { InscricaoFlowCarousel } from './inscricao-flow-carousel'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}

interface InformacaoComplementarForPerguntas {
  id: string
  id_vaga: string
  titulo: string
  obrigatorio: boolean
  tipo_campo:
    | 'resposta_curta'
    | 'resposta_numerica'
    | 'selecao_unica'
    | 'selecao_multipla'
  valor_minimo: number | null
  valor_maximo: number | null
  opcoes: string[] | null
  created_at: string
  updated_at: string
}

function mapInformacaoComplementar(
  info: EmpregabilidadeInformacaoComplementar
): InformacaoComplementarForPerguntas {
  return {
    id: info.id ?? '',
    id_vaga: info.id_vaga ?? '',
    titulo: info.titulo ?? '',
    obrigatorio: info.obrigatorio ?? false,
    tipo_campo: (info.tipo_campo ??
      'resposta_curta') as InformacaoComplementarForPerguntas['tipo_campo'],
    valor_minimo: info.valor_minimo ?? null,
    valor_maximo: info.valor_maximo ?? null,
    opcoes: info.opcoes ?? null,
    created_at: info.created_at ?? '',
    updated_at: info.updated_at ?? '',
  }
}

export default async function InscricaoPage({
  params,
  searchParams,
}: PageProps) {
  const { id: vagaId } = await params
  const { step: stepParam } = await searchParams
  const initialStep = Math.max(0, Number.parseInt(stepParam ?? '0', 10) || 0)

  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl(`/servicos/empregos/${vagaId}/inscricao`))
  }

  const [
    vagaResponse,
    onboardingResponse,
    userInfoResponse,
    formacaoOptions,
    curriculoFormacaoData,
  ] = await Promise.all([
    getApiPublicEmpregabilidadeVagasId(vagaId),
    getApiV1EmpregabilidadeOnboardingCpf(userAuthInfo.cpf),
    getDalCitizenCpf(userAuthInfo.cpf),
    getFormacaoOptions(),
    getCurriculoFormacaoData(userAuthInfo.cpf),
  ])

  if (vagaResponse.status !== 200 || !vagaResponse.data) {
    notFound()
  }

  if (userInfoResponse.status !== 200 || !userInfoResponse.data) {
    notFound()
  }

  const userInfo = userInfoResponse.data
  const userInfoExtended = userInfo as typeof userInfo & {
    genero?: string
    renda_familiar?: string
    escolaridade?: string
    deficiencia?: string
  }

  const transformedUserInfo: EmpregosUserInfo = {
    cpf: userInfo.cpf || userAuthInfo.cpf,
    name: userInfo.nome || userAuthInfo.name,
    email: normalizeEmailData(userInfo.email),
    phone: normalizePhoneData(userInfo.telefone),
    genero: userInfoExtended.genero,
    escolaridade: userInfoExtended.escolaridade,
    renda_familiar: userInfoExtended.renda_familiar,
    deficiencia: userInfoExtended.deficiencia,
  }

  const phoneNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.phone.principal as ModelsTelefonePrincipal)
        ?.updated_at || null,
    months: 6,
  })

  const emailNeedsUpdate = !isUpdatedWithin({
    updatedAt:
      (transformedUserInfo.email.principal as ModelsEmailPrincipal)
        ?.updated_at || null,
    months: 6,
  })

  const contactUpdateStatus = {
    phoneNeedsUpdate,
    emailNeedsUpdate,
  }

  const onboardingData =
    onboardingResponse.status === 200 && onboardingResponse.data
      ? (onboardingResponse.data as { is_first_login?: boolean })
      : null
  const showBemVindo = onboardingData?.is_first_login === true

  const needsConfirmar =
    contactUpdateStatus.phoneNeedsUpdate ||
    contactUpdateStatus.emailNeedsUpdate ||
    !transformedUserInfo.genero ||
    !transformedUserInfo.escolaridade ||
    !transformedUserInfo.renda_familiar ||
    !transformedUserInfo.deficiencia

  const hasPerguntasAdicionais =
    (vagaResponse.data.informacoes_complementares?.length ?? 0) > 0

  const informacoesComplementares =
    vagaResponse.data.informacoes_complementares?.map(
      mapInformacaoComplementar
    ) ?? []

  const citizen = userInfo as ModelsCitizen
  const initialEscolaridade = citizen.escolaridade?.trim() || undefined

  return (
    <div className="min-h-lvh pb-10">
      <InscricaoFlowCarousel
        vagaId={vagaId}
        initialStep={initialStep}
        showBemVindo={showBemVindo}
        showConfirmarInformacoes={needsConfirmar}
        hasPerguntasAdicionais={hasPerguntasAdicionais}
        userInfo={transformedUserInfo}
        userAuthInfo={userAuthInfo}
        contactUpdateStatus={contactUpdateStatus}
        formacaoOptions={formacaoOptions}
        initialFormacoes={curriculoFormacaoData.formacoes}
        initialIdiomas={curriculoFormacaoData.idiomas}
        initialEscolaridade={initialEscolaridade}
        informacoesComplementares={informacoesComplementares}
      />
    </div>
  )
}
