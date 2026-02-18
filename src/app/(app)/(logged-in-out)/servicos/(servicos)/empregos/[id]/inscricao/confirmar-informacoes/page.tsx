import { buildAuthUrl } from '@/constants/url'
import { normalizeEmailData } from '@/helpers/email-data-helpers'
import { normalizePhoneData } from '@/helpers/phone-data-helpers'
import type {
  ModelsEmailPrincipal,
  ModelsTelefonePrincipal,
} from '@/http/models'
import { getDalCitizenCpf } from '@/lib/dal'
import { isUpdatedWithin } from '@/lib/date'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { ConfirmarInformacoesContent } from './confirmar-informacoes-content'
import type { EmpregosUserInfo } from './types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConfirmarInformacoesPage({ params }: PageProps) {
  const { id: vagaId } = await params

  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    const returnUrl = `/servicos/empregos/${vagaId}/inscricao/confirmar-informacoes`
    redirect(buildAuthUrl(returnUrl))
  }

  const userInfoResponse = await getDalCitizenCpf(userAuthInfo.cpf)

  if (userInfoResponse.status !== 200) {
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

  return (
    <ConfirmarInformacoesContent
      vagaId={vagaId}
      userInfo={transformedUserInfo}
      userAuthInfo={userAuthInfo}
      contactUpdateStatus={contactUpdateStatus}
    />
  )
}
