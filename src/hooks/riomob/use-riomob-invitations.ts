'use client'

import {
  RIOMOB_INVITATIONS_STALE_MS,
  fetchRiomobInvitations,
  riomobInvitationsQueryKey,
} from '@/hooks/riomob/riomob-fetch'
import type { PendingConductorInvite } from '@/lib/riomob/types'
import { useQuery } from '@tanstack/react-query'

export function useRiomobInvitations(options?: {
  initialData?: PendingConductorInvite[]
  enabled?: boolean
}) {
  return useQuery({
    queryKey: riomobInvitationsQueryKey(),
    queryFn: fetchRiomobInvitations,
    staleTime: RIOMOB_INVITATIONS_STALE_MS,
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
