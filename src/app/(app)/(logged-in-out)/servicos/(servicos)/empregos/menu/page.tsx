import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { EmpregosMenuContent } from './menu-content'

export default async function EmpregosMenuPage() {
  const userInfo = await getUserInfoFromToken()

  if (!userInfo.cpf) {
    return redirect(buildAuthUrl('/servicos/empregos/menu'))
  }

  return <EmpregosMenuContent />
}
