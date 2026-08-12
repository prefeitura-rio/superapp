import {
  MOCK_PENDING_INVITES,
  sortPendingInvitesByMostRecent,
} from '@/app/(app)/(logged-in)/carteira/cadmicro/mocks/pending-invites'
import { getCitizenCpfVehicleInvitations } from '@/http/mobilidade/mobilidade'
import { mapInvitationItemToPending } from '@/lib/cadmicro/mappers'
import { isCadmicroMocksEnabled } from '@/lib/cadmicro/mocks-gate'
import type { PendingConductorInvite } from '@/lib/cadmicro/types'

export async function listCadmicroInvitations(
  cpf: string
): Promise<PendingConductorInvite[]> {
  if (isCadmicroMocksEnabled()) {
    return sortPendingInvitesByMostRecent(MOCK_PENDING_INVITES)
  }

  const response = await getCitizenCpfVehicleInvitations(cpf)
  if (response.status !== 200) {
    throw new Error('Falha ao listar convites')
  }

  const items = response.data.data ?? []
  const mapped = items
    .map(mapInvitationItemToPending)
    .filter((i): i is PendingConductorInvite => i !== null)

  return sortPendingInvitesByMostRecent(mapped)
}
