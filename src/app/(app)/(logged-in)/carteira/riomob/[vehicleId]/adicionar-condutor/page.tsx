import { buildAuthUrl } from '@/constants/url'
import { getUserInfoFromToken } from '@/lib/user-info'
import { redirect } from 'next/navigation'
import { ConductorInviteFlow } from './conductor-invite-flow'

export const dynamic = 'force-dynamic'

interface AdicionarCondutorPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function AdicionarCondutorPage({
  params,
}: AdicionarCondutorPageProps) {
  const { vehicleId } = await params
  const userAuthInfo = await getUserInfoFromToken()

  if (!userAuthInfo.cpf) {
    redirect(buildAuthUrl(`/carteira/riomob/${vehicleId}/adicionar-condutor`))
  }

  return <ConductorInviteFlow vehicleId={vehicleId} />
}
