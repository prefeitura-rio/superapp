import { CurriculoPageClient } from '@/app/components/empregos/curriculo-page-client'
import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'

export default async function CurriculoPage() {
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/empregos/curriculo'))
  }

  return <CurriculoPageClient cpf={userAuthInfo.cpf} />
}
