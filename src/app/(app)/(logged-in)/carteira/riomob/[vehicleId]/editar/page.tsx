interface EditarVeiculoPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function EditarVeiculoPage({
  params,
}: EditarVeiculoPageProps) {
  const { vehicleId } = await params

  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium">Editar veículo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Página placeholder — edição do veículo {vehicleId}.
      </p>
    </div>
  )
}
