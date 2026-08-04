'use client'

import { SerialPhotosFields } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/components/serial-photos-fields'
import { VehicleInfoFields } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/components/vehicle-info-fields'
import type { VehicleFormData } from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/schema'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { VehicleDetail } from '../../mocks/vehicles'
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
}

interface VehicleEditFormProps {
  vehicle: VehicleDetail
  ownerInfo: OwnerInfo
}

async function mockUpdateVehicle(payload: unknown) {
  await new Promise(resolve => setTimeout(resolve, 800))
  console.info('[riomob] mock PATCH vehicle', payload)
}

export function VehicleEditForm({ vehicle, ownerInfo }: VehicleEditFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const detailPath = `/carteira/riomob/${vehicle.id}`
  const returnUrl = `/carteira/riomob/${vehicle.id}/editar`

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleEditFormSchema),
    defaultValues: toEditFormDefaults(vehicle),
    mode: 'onChange',
  })

  const { handleSubmit } = form

  const onSubmit = handleSubmit(async data => {
    setIsPending(true)
    try {
      await mockUpdateVehicle(toUpdateVehiclePayload(data))
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
        />

        <SerialPhotosFields
          form={form}
          showTitle={false}
          showSelfDeclaration={false}
        />

        <div className="px-4 pt-4">
          <CustomButton
            type="submit"
            size="lg"
            fullWidth
            loading={isPending}
            disabled={isPending}
          >
            Salvar
          </CustomButton>
        </div>
      </form>
    </div>
  )
}
