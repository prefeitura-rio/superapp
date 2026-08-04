'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  MOCK_PENDING_INVITES,
  type PendingConductorInvite,
} from '../mocks/pending-invites'
import { DeclineInviteDrawer } from './decline-invite-drawer'
import { VehicleInviteAcceptedDrawer } from './vehicle-invite-accepted-drawer'

interface PendingInviteAccordionProps {
  className?: string
}

export function PendingInviteAccordion({
  className,
}: PendingInviteAccordionProps) {
  const [invites, setInvites] = useState(MOCK_PENDING_INVITES)
  const [openItem, setOpenItem] = useState<string>('')
  const [selectedInvite, setSelectedInvite] =
    useState<PendingConductorInvite | null>(null)
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  function removeInvite(inviteId: string) {
    setInvites(current => current.filter(invite => invite.id !== inviteId))
    setOpenItem('')
  }

  async function handleAccept(invite: PendingConductorInvite) {
    setIsAccepting(true)
    try {
      // Mock accept — trocar por action/Orval
      await new Promise(resolve => setTimeout(resolve, 600))
      removeInvite(invite.id)
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
      // Mock decline — trocar por action/Orval
      await new Promise(resolve => setTimeout(resolve, 600))
      removeInvite(selectedInvite.id)
      setIsDeclineOpen(false)
      setSelectedInvite(null)
      toast.success('Convite recusado')
    } catch {
      toast.error('Não foi possível recusar o convite. Tente novamente.')
    } finally {
      setIsDeclining(false)
    }
  }

  if (invites.length === 0 && !isSuccessOpen && !isDeclineOpen) return null

  return (
    <>
      {invites.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
          className={cn('flex w-full flex-col gap-2', className)}
        >
          {invites.map(invite => (
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
                    onClick={() => handleAccept(invite)}
                    loading={isAccepting}
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
