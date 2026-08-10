'use client'

import { PendingInviteAccordion } from '@/app/components/riomob/pending-invite-accordion'
import { useRiomobInvitations } from '@/hooks/riomob/use-riomob-invitations'
import { useRiomobQueryErrorToast } from '@/hooks/riomob/use-riomob-query-error-toast'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { useAuthStatus } from '@/providers/auth-status-provider'

export function PendingInviteSection() {
  const riomobEnabled = isFeatureEnabled('riomob')
  const { isLoggedIn, isLoading } = useAuthStatus()
  const { data: invitations = [], isError } = useRiomobInvitations({
    enabled: riomobEnabled && Boolean(isLoggedIn && !isLoading),
  })

  useRiomobQueryErrorToast(
    isError,
    'Não foi possível carregar os convites',
    'riomob-invitations-error'
  )

  if (!riomobEnabled || isLoading || !isLoggedIn) return null

  return (
    <div className="w-full px-4 pt-2">
      <PendingInviteAccordion maxVisible={1} invitations={invitations} />
    </div>
  )
}
