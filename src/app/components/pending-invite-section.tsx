'use client'

import { PendingInviteAccordion } from '@/app/(app)/(logged-in)/carteira/riomob/components/pending-invite-accordion'
import { useRiomobInvitations } from '@/hooks/riomob/use-riomob-invitations'
import { useRiomobQueryErrorToast } from '@/hooks/riomob/use-riomob-query-error-toast'
import { useAuthStatus } from '@/providers/auth-status-provider'

export function PendingInviteSection() {
  const { isLoggedIn, isLoading } = useAuthStatus()
  const { data: invitations = [], isError } = useRiomobInvitations({
    enabled: Boolean(isLoggedIn && !isLoading),
  })

  useRiomobQueryErrorToast(
    isError,
    'Não foi possível carregar os convites',
    'riomob-invitations-error'
  )

  if (isLoading || !isLoggedIn) return null

  return (
    <div className="w-full px-4 pt-2">
      <PendingInviteAccordion maxVisible={1} invitations={invitations} />
    </div>
  )
}
