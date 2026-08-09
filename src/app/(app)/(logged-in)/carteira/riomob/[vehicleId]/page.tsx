import { buildAuthUrl } from '@/constants/url'
import { getRiomobVehicle } from '@/lib/riomob/vehicle-service'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { VehicleDetailPage } from './components/vehicle-detail-page'

interface VehicleDetailRouteProps {
  params: Promise<{ vehicleId: string }>
}

export default async function VehicleDetailRoute({
  params,
}: VehicleDetailRouteProps) {
  const { vehicleId } = await params
  const user = await getUserInfoFromToken()

  if (!user.cpf) {
    redirect(buildAuthUrl(`/carteira/riomob/${vehicleId}`))
  }

  const vehicle = await getRiomobVehicle(user.cpf, vehicleId)
  if (!vehicle) notFound()

  return <VehicleDetailPage vehicle={vehicle} />
}
