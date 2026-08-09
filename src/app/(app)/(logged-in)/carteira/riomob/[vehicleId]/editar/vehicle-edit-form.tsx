'use client'

import { updateVehicle } from '@/actions/riomob'
import { SerialPhotosFields } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/components/serial-photos-fields'
import { VehicleInfoFields } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/components/vehicle-info-fields'
import type { VehicleFormData } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/schema'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useInvalidateRiomobQueries } from '@/hooks/riomob/use-invalidate-riomob-queries'
import type { VehicleDetail } from '@/lib/riomob/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  toEditFormDefaults,
  toUpdateVehiclePayload,
  vehicleEditFormSchema,
} from './schema'

interface OwnerInfo {
  name: string
  cpf: string
  phoneDisplay: string
  emailDisplay: string
  phoneNeedsUpdate?: boolean
  emailNeedsUpdate?: boolean
}

interface VehicleEditFormProps {
  vehicle: VehicleDetail
  ownerInfo: OwnerInfo
}

export function VehicleEditForm({ vehicle, ownerInfo }: VehicleEditFormProps) {
  const router = useRouter()
  const invalidate = useInvalidateRiomobQueries()
  const [isPending, setIsPending] = useState(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const detailPath = `/carteira/riomob/${vehicle.id}`
  const returnUrl = `/carteira/riomob/${vehicle.id}/editar`
  const contactOk = !ownerInfo.phoneNeedsUpdate && !ownerInfo.emailNeedsUpdate

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleEditFormSchema),
    defaultValues: toEditFormDefaults(vehicle),
    mode: 'onChange',
  })

  const { handleSubmit } = form

  const onSubmit = handleSubmit(async data => {
    if (!contactOk) return

    setIsPending(true)
    try {
      const result = await updateVehicle(
        vehicle.id,
        toUpdateVehiclePayload(data)
      )
      if (!result.success) {
        toast.error(result.error || 'Não foi possível salvar')
        return
      }
      await invalidate.afterUpdate(vehicle.id)
      toast.success('Veículo atualizado')
      router.push(detailPath)
    } catch {
      toast.error('Não foi possível salvar')
    } finally {
      setIsPending(false)
    }
  })

  return (
    <div className="mx-auto min-h-lvh w-full max-w-[896px] bg-background pb-10">
      <SecondaryHeader
        route={detailPath}
        className="max-w-[896px]"
        fixed={false}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-2 pb-4">
        <VehicleInfoFields
          form={form}
          ownerName={ownerInfo.name}
          ownerCpf={ownerInfo.cpf}
          phoneDisplay={ownerInfo.phoneDisplay}
          emailDisplay={ownerInfo.emailDisplay}
          returnUrl={returnUrl}
          phoneNeedsUpdate={ownerInfo.phoneNeedsUpdate}
          emailNeedsUpdate={ownerInfo.emailNeedsUpdate}
        />

        <SerialPhotosFields
          form={form}
          showTitle={false}
          showSelfDeclaration={false}
          onUploadingChange={setIsUploadingFiles}
        />

        <div className="px-4 pt-4">
          <CustomButton
            type="submit"
            size="lg"
            fullWidth
            loading={isPending}
            disabled={isPending || isUploadingFiles || !contactOk}
          >
            Salvar
          </CustomButton>
        </div>
      </form>
    </div>
  )
}
