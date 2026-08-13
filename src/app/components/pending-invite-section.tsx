'use client'

import { PendingInviteAccordion } from '@/app/components/cadmicro/pending-invite-accordion'
import { useCadmicroInvitations } from '@/hooks/cadmicro/use-cadmicro-invitations'
import { useCadmicroQueryErrorToast } from '@/hooks/cadmicro/use-cadmicro-query-error-toast'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { useAuthStatus } from '@/providers/auth-status-provider'

export function PendingInviteSection() {
  const cadmicroEnabled = isFeatureEnabled('cadmicro')
  const { isLoggedIn, isLoading } = useAuthStatus()
  const { data: invitations = [], isError } = useCadmicroInvitations({
    enabled: cadmicroEnabled && Boolean(isLoggedIn && !isLoading),
  })

  useCadmicroQueryErrorToast(
    isError,
    'Não foi possível carregar os convites',
    'cadmicro-invitations-error'
  )

  if (!cadmicroEnabled || isLoading || !isLoggedIn) return null

  return (
    <div className="w-full px-4 pt-2">
      <PendingInviteAccordion maxVisible={1} invitations={invitations} />
    </div>
  )
}
