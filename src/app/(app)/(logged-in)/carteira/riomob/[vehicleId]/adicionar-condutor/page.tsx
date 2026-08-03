interface AdicionarCondutorPageProps {
  params: Promise<{ vehicleId: string }>
}

export default async function AdicionarCondutorPage({
  params,
}: AdicionarCondutorPageProps) {
  const { vehicleId } = await params

  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium">Adicionar condutor</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Página placeholder — convite de condutor para o veículo {vehicleId}.
      </p>
    </div>
  )
}
