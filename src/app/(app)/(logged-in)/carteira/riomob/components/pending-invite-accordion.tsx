'use client'

import { respondInvitation } from '@/actions/riomob'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useInvalidateRiomobQueries } from '@/hooks/riomob/use-invalidate-riomob-queries'
import type { PendingConductorInvite } from '@/lib/riomob/types'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AcceptInviteDrawer } from './accept-invite-drawer'
import { DeclineInviteDrawer } from './decline-invite-drawer'
import { VehicleInviteAcceptedDrawer } from './vehicle-invite-accepted-drawer'

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
  const invalidate = useInvalidateRiomobQueries()
  const [openItem, setOpenItem] = useState<string>('')
  const [selectedInvite, setSelectedInvite] =
    useState<PendingConductorInvite | null>(null)
  const [isAcceptOpen, setIsAcceptOpen] = useState(false)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

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

    setIsAccepting(true)
    try {
      const result = await respondInvitation(
        selectedInvite.id,
        'accepted',
        selectedInvite.vehicleId
      )
      if (!result.success) {
        toast.error(result.error || 'Não foi possível aceitar o convite.')
        return
      }
      await invalidate.afterAcceptInvitation()
      setIsAcceptOpen(false)
      setSelectedInvite(null)
      setIsSuccessOpen(true)
    } catch {
      toast.error('Não foi possível aceitar o convite. Tente novamente.')
    } finally {
      setIsAccepting(false)
    }
  }

  function handleDeclineClick(invite: PendingConductorInvite) {
    setSelectedInvite(invite)
    setIsDeclineOpen(true)
  }

  async function handleDeclineConfirm() {
    if (!selectedInvite) return

    setIsDeclining(true)
    try {
      const result = await respondInvitation(
        selectedInvite.id,
        'rejected',
        selectedInvite.vehicleId
      )
      if (!result.success) {
        toast.error(result.error || 'Não foi possível recusar o convite.')
        return
      }
      await invalidate.afterRejectInvitation()
      setIsDeclineOpen(false)
      setSelectedInvite(null)
      toast.success('Convite recusado')
    } catch {
      toast.error('Não foi possível recusar o convite. Tente novamente.')
    } finally {
      setIsDeclining(false)
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
                    disabled={isAccepting || isDeclining}
                  >
                    Aceitar
                  </CustomButton>
                  <CustomButton
                    size="xl"
                    fullWidth
                    variant="secondary"
                    onClick={() => handleDeclineClick(invite)}
                    disabled={isAccepting || isDeclining}
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
