'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { VehicleCard } from '@/app/components/wallet-cards/vehicle-card'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { VehicleDetail } from '../../mocks/vehicles'
import { LeaveVehicleDrawer } from './leave-vehicle-drawer'
import { VehicleActionTiles } from './vehicle-action-tiles'
import { VehicleDetailAccordion } from './vehicle-detail-accordion'

interface VehicleDetailPageProps {
  vehicle: VehicleDetail
}

async function mockLeaveVehicle() {
  await new Promise(resolve => setTimeout(resolve, 800))
}

export function VehicleDetailPage({ vehicle }: VehicleDetailPageProps) {
  const router = useRouter()
  const isConductor = vehicle.category === 'condutor'
  const [isLeaveDrawerOpen, setIsLeaveDrawerOpen] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleLeaveConfirm = async () => {
    setIsLeaving(true)
    try {
      await mockLeaveVehicle()
      setIsLeaveDrawerOpen(false)
      toast.success('Veículo removido')
      router.push('/carteira?riomob=true')
    } catch {
      toast.error('Não foi possível remover')
    } finally {
      setIsLeaving(false)
    }
  }

  return (
    <div className="mx-auto min-h-lvh w-full max-w-[896px] bg-background pb-10">
      <SecondaryHeader
        title={vehicle.displayName}
        route="/carteira?riomob=true"
        className="max-w-[896px]"
        fixed={false}
        rightSlot={
          isConductor ? (
            <IconButton
              icon={TrashIcon}
              aria-label="Excluir veículo"
              onClick={() => setIsLeaveDrawerOpen(true)}
            />
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6 px-4 pt-2">
        <VehicleCard vehicle={vehicle} />
        {!isConductor && <VehicleActionTiles vehicleId={vehicle.id} />}
        <VehicleDetailAccordion
          vehicle={vehicle}
          showAuthorizedConductors={!isConductor}
        />
      </div>

      {isConductor && (
        <LeaveVehicleDrawer
          displayName={vehicle.displayName}
          open={isLeaveDrawerOpen}
          onOpenChange={open => {
            if (!isLeaving) setIsLeaveDrawerOpen(open)
          }}
          onConfirm={handleLeaveConfirm}
          isPending={isLeaving}
        />
      )}
    </div>
  )
}
