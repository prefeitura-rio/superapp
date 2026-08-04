'use client'

import type { UseFormReturn } from 'react-hook-form'
import { SerialPhotosFields } from '../components/serial-photos-fields'
import type { VehicleFormData } from '../schema'

interface SerialPhotosSlideProps {
  form: UseFormReturn<VehicleFormData>
}

export function SerialPhotosSlide({ form }: SerialPhotosSlideProps) {
  return <SerialPhotosFields form={form} />
}
