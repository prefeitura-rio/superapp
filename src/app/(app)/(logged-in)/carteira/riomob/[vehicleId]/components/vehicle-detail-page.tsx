'use client'

import { deleteVehicle, leaveVehicle } from '@/actions/riomob'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useInvalidateRiomobQueries } from '@/hooks/riomob/use-invalidate-riomob-queries'
import { useRiomobVehicle } from '@/hooks/riomob/use-riomob-vehicle'
import type { VehicleDetail } from '@/lib/riomob/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { LeaveVehicleDrawer } from './leave-vehicle-drawer'
import { VehicleActionTiles } from './vehicle-action-tiles'
import { VehicleCardPhotoGallery } from './vehicle-card-photo-gallery'
import { VehicleDetailAccordion } from './vehicle-detail-accordion'

interface VehicleDetailPageProps {
  vehicle: VehicleDetail
}

export function VehicleDetailPage({
  vehicle: initialVehicle,
}: VehicleDetailPageProps) {
  const router = useRouter()
  const invalidate = useInvalidateRiomobQueries()
  const { data: vehicle = initialVehicle } = useRiomobVehicle(
    initialVehicle.id,
    { initialData: initialVehicle }
  )
  const isConductor = vehicle.category === 'condutor'
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const openDeleteDrawer = () => setIsDeleteDrawerOpen(true)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      const result = isConductor
        ? await leaveVehicle(vehicle.id)
        : await deleteVehicle(vehicle.id)

      if (!result.success) {
        toast.error(result.error || 'Não foi possível remover')
        return
      }

      await invalidate.afterDelete(vehicle.id)
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
