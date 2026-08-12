'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import { useDeleteOrLeaveVehicleMutation } from '@/hooks/cadmicro/use-cadmicro-mutations'
import { useCadmicroQueryErrorToast } from '@/hooks/cadmicro/use-cadmicro-query-error-toast'
import { useCadmicroVehicle } from '@/hooks/cadmicro/use-cadmicro-vehicle'
import type { VehicleDetail } from '@/lib/cadmicro/types'
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
  const deleteOrLeave = useDeleteOrLeaveVehicleMutation()
  const {
    data: vehicle = initialVehicle,
    isError,
    isFetchedAfterMount,
  } = useCadmicroVehicle(initialVehicle.id, { initialData: initialVehicle })

  useCadmicroQueryErrorToast(
    isError && isFetchedAfterMount,
    'Não foi possível atualizar os dados do veículo',
    `cadmicro-vehicle-error-${initialVehicle.id}`
  )
  const isConductor = vehicle.category === 'condutor'
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)

  const openDeleteDrawer = () => setIsDeleteDrawerOpen(true)

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteOrLeave.mutateAsync({
        vehicleId: vehicle.id,
        isConductor,
      })

      if (!result.success) {
        toast.error(result.error || 'Não foi possível remover')
        return
      }

      setIsDeleteDrawerOpen(false)
      toast.success('Veículo removido')
      router.push('/carteira?cadmicro=true')
    } catch {
      toast.error('Não foi possível remover')
    }
  }

  return (
    <div className="mx-auto min-h-lvh w-full max-w-[896px] bg-background pb-10">
      <SecondaryHeader
        title={vehicle.displayName}
        route="/carteira?cadmicro=true"
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
          if (!deleteOrLeave.isPending) setIsDeleteDrawerOpen(open)
        }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteOrLeave.isPending}
      />
    </div>
  )
}
