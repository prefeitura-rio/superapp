'use client'

import type { UseFormReturn } from 'react-hook-form'
import { VehicleInfoFields } from '../components/vehicle-info-fields'
import type { VehicleFormData } from '../schema'

const RETURN_URL = '/carteira/riomob/adicionar-veiculo'

interface VehicleInfoSlideProps {
  form: UseFormReturn<VehicleFormData>
  ownerName: string
  ownerCpf: string
  phoneDisplay: string
  emailDisplay: string
  phoneNeedsUpdate?: boolean
  emailNeedsUpdate?: boolean
}

export function VehicleInfoSlide({
  form,
  ownerName,
  ownerCpf,
  phoneDisplay,
  emailDisplay,
  phoneNeedsUpdate = false,
  emailNeedsUpdate = false,
}: VehicleInfoSlideProps) {
  return (
    <VehicleInfoFields
      form={form}
      ownerName={ownerName}
      ownerCpf={ownerCpf}
      phoneDisplay={phoneDisplay}
      emailDisplay={emailDisplay}
      returnUrl={RETURN_URL}
      phoneNeedsUpdate={phoneNeedsUpdate}
      emailNeedsUpdate={emailNeedsUpdate}
    />
  )
}
