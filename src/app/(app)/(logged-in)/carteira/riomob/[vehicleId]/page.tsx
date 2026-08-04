import { notFound } from 'next/navigation'
import { getMockVehicleDetail } from '../mocks/vehicles'
import { VehicleDetailPage } from './components/vehicle-detail-page'

interface VehicleDetailRouteProps {
  params: Promise<{ vehicleId: string }>
}

export default async function VehicleDetailRoute({
  params,
}: VehicleDetailRouteProps) {
  const { vehicleId } = await params
  const vehicle = getMockVehicleDetail(vehicleId)

  if (!vehicle) notFound()

  return <VehicleDetailPage vehicle={vehicle} />
}
