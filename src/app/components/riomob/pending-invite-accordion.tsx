'use client'

import { AcceptInviteDrawer } from '@/app/components/riomob/accept-invite-drawer'
import { DeclineInviteDrawer } from '@/app/components/riomob/decline-invite-drawer'
import { VehicleInviteAcceptedDrawer } from '@/app/components/riomob/vehicle-invite-accepted-drawer'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useRespondInvitationMutation } from '@/hooks/riomob/use-riomob-mutations'
import type { PendingConductorInvite } from '@/lib/riomob/types'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface PendingInviteAccordionProps {
  className?: string
  /** When set, only the N most recent invites are shown (e.g. 1 on home). */
  maxVisible?: number
  invitations?: PendingConductorInvite[]
  onInvitesChange?: (count: number) => void
}

export function PendingInviteAccordion({
  className,
  maxVisible,
  invitations = [],
  onInvitesChange,
}: PendingInviteAccordionProps) {
  const respondMutation = useRespondInvitationMutation()
  const [openItem, setOpenItem] = useState<string>('')
  const [selectedInvite, setSelectedInvite] =
    useState<PendingConductorInvite | null>(null)
  const [isAcceptOpen, setIsAcceptOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const isAccepting =
    respondMutation.isPending &&
    respondMutation.variables?.status === 'accepted'
  const isDeclining =
    respondMutation.isPending &&
    respondMutation.variables?.status === 'rejected'

  const visibleInvites = useMemo(() => {
    if (maxVisible == null) return invitations
    return invitations.slice(0, maxVisible)
  }, [invitations, maxVisible])

  useEffect(() => {
    onInvitesChange?.(invitations.length)
  }, [invitations.length, onInvitesChange])

  function handleAcceptClick(invite: PendingConductorInvite) {
    setSelectedInvite(invite)
    setIsAcceptOpen(true)
  }

  async function handleAcceptConfirm() {
    if (!selectedInvite) return

    try {
      const result = await respondMutation.mutateAsync({
        conductorId: selectedInvite.id,
        status: 'accepted',
        vehicleId: selectedInvite.vehicleId,
      })
      if (!result.success) {
        toast.error(result.error || 'Não foi possível aceitar o convite.')
        return
      }
      setIsAcceptOpen(false)
      setSelectedInvite(null)
      setIsSuccessOpen(true)
    } catch {
      toast.error('Não foi possível aceitar o convite. Tente novamente.')
    }
  }

  function handleDeclineClick(invite: PendingConductorInvite) {
    setSelectedInvite(invite)
    setIsDeclineOpen(true)
  }

  async function handleDeclineConfirm() {
    if (!selectedInvite) return

    try {
      const result = await respondMutation.mutateAsync({
        conductorId: selectedInvite.id,
        status: 'rejected',
        vehicleId: selectedInvite.vehicleId,
      })
      if (!result.success) {
        toast.error(result.error || 'Não foi possível recusar o convite.')
        return
      }
      setIsDeclineOpen(false)
      setSelectedInvite(null)
      toast.success('Convite recusado')
    } catch {
      toast.error('Não foi possível recusar o convite. Tente novamente.')
    }
  }

  if (
    invitations.length === 0 &&
    !isSuccessOpen &&
    !isDeclineOpen &&
    !isAcceptOpen
  ) {
    return null
  }

  return (
    <>
      {visibleInvites.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className={cn('flex w-full flex-col gap-2', className)}
        >
          {visibleInvites.map(invite => (
            <AccordionItem
              key={invite.id}
              value={invite.id}
              className="rounded-xl border-0 bg-card"
            >
              <AccordionTrigger
                className="items-center gap-4 p-4 text-sm font-normal leading-5 hover:no-underline"
                chevronClassName="text-foreground stroke-[1.5]"
              >
                <p className="flex-1 text-left text-sm font-normal leading-5 text-foreground">
                  Você foi adicionado por{' '}
                  <span className="text-card-2">
                    {invite.inviterDisplayName}
                  </span>{' '}
                  como condutor de um veículo. Confirme aqui para visualizá-lo
                  entre os seus veículos.
                </p>
              </AccordionTrigger>

              <AccordionContent className="px-4 pt-0 pb-4">
                <div className="flex flex-col gap-2">
                  <CustomButton
                    size="xl"
                    fullWidth
                    variant="primary"
                    onClick={() => handleAcceptClick(invite)}
                    disabled={respondMutation.isPending}
                  >
                    Aceitar
                  </CustomButton>
                  <CustomButton
                    size="xl"
                    fullWidth
                    variant="secondary"
                    onClick={() => handleDeclineClick(invite)}
                    disabled={respondMutation.isPending}
                  >
                    Recusar
                  </CustomButton>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <AcceptInviteDrawer
        vehicleDisplayName={selectedInvite?.vehicleDisplayName ?? ''}
        open={isAcceptOpen}
        onOpenChange={open => {
          if (!isAccepting) {
            setIsAcceptOpen(open)
            if (!open) setSelectedInvite(null)
          }
        }}
        onConfirm={handleAcceptConfirm}
        isPending={isAccepting}
      />

      <DeclineInviteDrawer
        vehicleDisplayName={selectedInvite?.vehicleDisplayName ?? ''}
        open={isDeclineOpen}
        onOpenChange={open => {
          if (!isDeclining) {
            setIsDeclineOpen(open)
            if (!open) setSelectedInvite(null)
          }
        }}
        onConfirm={handleDeclineConfirm}
        isPending={isDeclining}
      />

      <VehicleInviteAcceptedDrawer
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
      />
    </>
  )
}
