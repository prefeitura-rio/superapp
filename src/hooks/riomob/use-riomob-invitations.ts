'use client'

import {
  RIOMOB_INVITATIONS_STALE_MS,
  fetchRiomobInvitations,
  riomobInvitationsQueryKey,
} from '@/hooks/riomob/riomob-fetch'
import { RIOMOB_QUERY_RETRY } from '@/lib/riomob/query-keys'
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
    retry: RIOMOB_QUERY_RETRY,
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
