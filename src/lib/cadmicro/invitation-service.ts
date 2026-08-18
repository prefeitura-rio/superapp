import { getCitizenCpfVehicleInvitations } from '@/http/mobilidade/mobilidade'
import { mapInvitationItemToPending } from '@/lib/cadmicro/mappers'
import type { PendingConductorInvite } from '@/lib/cadmicro/types'

/** Newest first. */
function sortPendingInvitesByMostRecent(
  invites: PendingConductorInvite[]
): PendingConductorInvite[] {
  return [...invites].sort(
    (a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
  )
}

export async function listCadmicroInvitations(
  cpf: string
): Promise<PendingConductorInvite[]> {
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
