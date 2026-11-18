import { buildAuthUrl } from '@/constants/url'
import { getCadmicroVehicle } from '@/lib/cadmicro/vehicle-service'
import { getUserInfoFromToken } from '@/lib/user-info'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { VehicleDetailLoading } from './components/vehicle-detail-loading'
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
    redirect(buildAuthUrl(`/carteira/cadmicro/${vehicleId}`))
  }

  return (
    <Suspense fallback={<VehicleDetailLoading />}>
      <VehicleDetailFetcher vehicleId={vehicleId} cpf={user.cpf} />
    </Suspense>
  )
}

async function VehicleDetailFetcher({
  vehicleId,
  cpf,
}: {
  vehicleId: string
  cpf: string
}) {
  const vehicle = await getCadmicroVehicle(cpf, vehicleId)
  if (!vehicle) notFound()

  return <VehicleDetailPage vehicle={vehicle} />
}
