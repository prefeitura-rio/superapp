import type { PendingConductorInvite } from '@/lib/riomob/types'

export type { PendingConductorInvite }

/** Mock temporário — substituir por GET de convites pendentes do cidadão. */
export const MOCK_PENDING_INVITES: PendingConductorInvite[] = [
  {
    id: 'invite-1',
    inviterDisplayName: 'Jéssica',
    vehicleDisplayName: 'Bike da Jessy',
    vehicleId: 'vehicle-autopropelido-1',
    invitedAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'invite-2',
    inviterDisplayName: 'Lucas',
    vehicleDisplayName: 'Possante',
    vehicleId: 'vehicle-bike-1',
    invitedAt: '2026-03-10T15:30:00.000Z',
  },
]

/** Newest first. */
export function sortPendingInvitesByMostRecent(
  invites: PendingConductorInvite[]
): PendingConductorInvite[] {
  return [...invites].sort(
    (a, b) => new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime()
  )
}
