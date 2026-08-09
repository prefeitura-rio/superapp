import {
  MOCK_PENDING_INVITES,
  sortPendingInvitesByMostRecent,
} from '@/app/(app)/(logged-in)/carteira/riomob/mocks/pending-invites'
import { getCitizenCpfVehicleInvitations } from '@/http/mobilidade/mobilidade'
import { mapInvitationItemToPending } from '@/lib/riomob/mappers'
import { isRiomobMocksEnabled } from '@/lib/riomob/mocks-gate'
import type { PendingConductorInvite } from '@/lib/riomob/types'

export async function listRiomobInvitations(
  cpf: string
): Promise<PendingConductorInvite[]> {
  if (isRiomobMocksEnabled()) {
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
