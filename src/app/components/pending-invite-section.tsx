'use client'

import { PendingInviteAccordion } from '@/app/(app)/(logged-in)/carteira/riomob/components/pending-invite-accordion'
import { useAuthStatus } from '@/providers/auth-status-provider'

export function PendingInviteSection() {
  const { isLoggedIn, isLoading } = useAuthStatus()

  if (isLoading || !isLoggedIn) return null

  return (
    <div className="w-full px-4 pt-2">
      <PendingInviteAccordion maxVisible={1} />
    </div>
  )
}
