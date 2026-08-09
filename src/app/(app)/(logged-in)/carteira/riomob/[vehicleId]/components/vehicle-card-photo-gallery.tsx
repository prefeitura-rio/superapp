'use client'

import { VehicleCard } from '@/app/components/wallet-cards/vehicle-card'
import { useRiomobSignedUrl } from '@/hooks/riomob/use-riomob-signed-url'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import type { VehicleDetail } from '../../mocks/vehicles'

interface VehicleCardPhotoGalleryProps {
  vehicle: VehicleDetail
}

function isPdfName(name?: string | null) {
  return !!name && /\.pdf$/i.test(name)
}

function isImageAsset(fileName: string, url: string) {
  return !isPdfName(fileName) && !isPdfName(url)
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

  const signedUrls = [vehiclePhotoUrl, serialPhotoUrl, invoicePhotoUrl].filter(
    (url): url is string => !!url
  )

  if (signedUrls.length === 0) {
    return <VehicleCard vehicle={vehicle} />
  }

  return (
    <PhotoProvider>
      {signedUrls.map((src, index) => (
        <PhotoView key={src} src={src}>
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
