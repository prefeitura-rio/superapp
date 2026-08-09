'use client'

import { VehicleCard } from '@/app/components/wallet-cards/vehicle-card'
import { useRiomobSignedUrl } from '@/hooks/riomob/use-riomob-signed-url'
import { isImageAsset } from '@/lib/riomob/file-utils'
import type { VehicleDetail } from '@/lib/riomob/types'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

interface VehicleCardPhotoGalleryProps {
  vehicle: VehicleDetail
}

export function VehicleCardPhotoGallery({
  vehicle,
}: VehicleCardPhotoGalleryProps) {
  const vehicleId = vehicle.id
  const { vehiclePhoto, serialNumberDocument, invoiceDocument } = vehicle

  const includeVehiclePhoto = isImageAsset(
    vehiclePhoto.fileName,
    vehiclePhoto.url
  )
  const includeSerial = isImageAsset(
    serialNumberDocument.fileName,
    serialNumberDocument.url
  )
  const includeInvoice = isImageAsset(
    invoiceDocument.fileName,
    invoiceDocument.url
  )

  const { url: vehiclePhotoUrl } = useRiomobSignedUrl(
    includeVehiclePhoto ? vehiclePhoto.url : null,
    { vehicleId, enabled: includeVehiclePhoto }
  )
  const { url: serialPhotoUrl } = useRiomobSignedUrl(
    includeSerial ? serialNumberDocument.url : null,
    { vehicleId, enabled: includeSerial }
  )
  const { url: invoicePhotoUrl } = useRiomobSignedUrl(
    includeInvoice ? invoiceDocument.url : null,
    { vehicleId, enabled: includeInvoice }
  )

  // Stable keys by document role — signed URLs are not unique when two
  // documents share the same GCS object (or resolve to the same signed URL).
  const galleryItems = [
    vehiclePhotoUrl
      ? { id: 'vehicle-photo' as const, src: vehiclePhotoUrl }
      : null,
    serialPhotoUrl
      ? { id: 'serial-number' as const, src: serialPhotoUrl }
      : null,
    invoicePhotoUrl ? { id: 'invoice' as const, src: invoicePhotoUrl } : null,
  ].filter(
    (
      item
    ): item is {
      id: 'vehicle-photo' | 'serial-number' | 'invoice'
      src: string
    } => !!item
  )

  const uniqueGalleryItems = galleryItems.filter(
    (item, index, items) =>
      items.findIndex(candidate => candidate.src === item.src) === index
  )

  if (uniqueGalleryItems.length === 0) {
    return <VehicleCard vehicle={vehicle} />
  }

  return (
    <PhotoProvider>
      {uniqueGalleryItems.map((item, index) => (
        <PhotoView key={item.id} src={item.src}>
          {index === 0 ? (
            <button
              type="button"
              className="w-full cursor-pointer text-left"
              aria-label="Ver fotos do veículo"
            >
              <VehicleCard vehicle={vehicle} />
            </button>
          ) : (
            <span className="hidden" />
          )}
        </PhotoView>
      ))}
    </PhotoProvider>
  )
}
