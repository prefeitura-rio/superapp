export interface PendingConductorInvite {
  id: string
  inviterDisplayName: string
  vehicleDisplayName: string
  vehicleId: string
}

/** Mock temporário — substituir por GET de convites pendentes do cidadão. */
export const MOCK_PENDING_INVITES: PendingConductorInvite[] = [
  {
    id: 'invite-1',
    inviterDisplayName: 'Jéssica A.',
    vehicleDisplayName: 'Bike da Jéssica',
    vehicleId: 'vehicle-autopropelido-1',
  },
]
