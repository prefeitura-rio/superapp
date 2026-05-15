import { MinhasCandidaturasPageClient } from '@/app/components/empregos/minhas-candidaturas-page-client'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function MinhasCandidaturasPage() {
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/empregos/minhas-candidaturas'))
  }

  return <MinhasCandidaturasPageClient />
}
