'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { VehicleDetail } from '../../mocks/vehicles'
import { LeaveVehicleDrawer } from './leave-vehicle-drawer'
import { VehicleActionTiles } from './vehicle-action-tiles'
import { VehicleCardPhotoGallery } from './vehicle-card-photo-gallery'
import { VehicleDetailAccordion } from './vehicle-detail-accordion'

interface VehicleDetailPageProps {
  vehicle: VehicleDetail
}

async function mockDeleteVehicle() {
  await new Promise(resolve => setTimeout(resolve, 800))
}

export function VehicleDetailPage({ vehicle }: VehicleDetailPageProps) {
  const router = useRouter()
  const isConductor = vehicle.category === 'condutor'
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteDrawer = () => setIsDeleteDrawerOpen(true)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await mockDeleteVehicle()
      setIsDeleteDrawerOpen(false)
      toast.success('Veículo removido')
      router.push('/carteira?riomob=true')
    } catch {
      toast.error('Não foi possível remover')
    } finally {
      setIsDeleting(false)
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
              onClick={openDeleteDrawer}
            />
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6 px-4 pt-2">
        <VehicleCardPhotoGallery vehicle={vehicle} />
        {!isConductor && (
          <VehicleActionTiles
            vehicleId={vehicle.id}
            onDeleteClick={openDeleteDrawer}
          />
        )}
        <VehicleDetailAccordion
          vehicle={vehicle}
          showAuthorizedConductors={!isConductor}
        />
      </div>

      <LeaveVehicleDrawer
        displayName={vehicle.displayName}
        open={isDeleteDrawerOpen}
        onOpenChange={open => {
          if (!isDeleting) setIsDeleteDrawerOpen(open)
        }}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
      />
    </div>
  )
}
