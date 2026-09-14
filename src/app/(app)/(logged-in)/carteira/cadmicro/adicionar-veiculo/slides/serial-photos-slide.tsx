'use client'

import type { UseFormReturn } from 'react-hook-form'
import { SerialPhotosFields } from '../components/serial-photos-fields'
import type { VehicleFormData } from '../schema'

interface SerialPhotosSlideProps {
  form: UseFormReturn<VehicleFormData>
  onUploadingChange?: (isUploading: boolean) => void
}

export function SerialPhotosSlide({
  form,
  onUploadingChange,
}: SerialPhotosSlideProps) {
  return (
    <SerialPhotosFields form={form} onUploadingChange={onUploadingChange} />
  )
}
