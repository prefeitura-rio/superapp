'use client'

import { cadmicroInvitationsQueryOptions } from '@/hooks/cadmicro/cadmicro-fetch'
import type { PendingConductorInvite } from '@/lib/cadmicro/types'
import { useQuery } from '@tanstack/react-query'

export function useCadmicroInvitations(options?: {
  initialData?: PendingConductorInvite[]
  enabled?: boolean
}) {
  return useQuery({
    ...cadmicroInvitationsQueryOptions(),
    initialData: options?.initialData,
    enabled: options?.enabled ?? true,
  })
}
