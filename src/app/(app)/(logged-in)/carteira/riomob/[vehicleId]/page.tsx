import Link from 'next/link'

interface VehicleDetailPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { vehicleId } = await params

  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium">Detalhe do veículo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Página placeholder — veículo {vehicleId}.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={`/carteira/riomob/${vehicleId}/editar`}
          className="flex items-center justify-center w-full py-4 px-6 rounded-full bg-primary text-white text-sm"
        >
          Editar veículo
        </Link>
        <Link
          href={`/carteira/riomob/${vehicleId}/adicionar-condutor`}
          className="flex items-center justify-center w-full py-4 px-6 rounded-full border border-primary text-primary text-sm"
        >
          Adicionar condutor
        </Link>
      </div>
    </div>
  )
}
