'use client'

import { riomobInvitationsQueryOptions } from '@/hooks/riomob/riomob-fetch'
import type { PendingConductorInvite } from '@/lib/riomob/types'
import { useQuery } from '@tanstack/react-query'

export function useRiomobInvitations(options?: {
  initialData?: PendingConductorInvite[]
  enabled?: boolean
}) {
  return useQuery({
    ...riomobInvitationsQueryOptions(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
