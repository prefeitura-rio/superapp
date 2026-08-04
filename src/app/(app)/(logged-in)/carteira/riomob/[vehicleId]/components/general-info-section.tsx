import type { VehicleDetail } from '../../mocks/vehicles'

interface GeneralInfoSectionProps {
  vehicle: VehicleDetail
}

export function GeneralInfoSection({ vehicle }: GeneralInfoSectionProps) {
  const fields = [
    { label: 'Proprietário', value: vehicle.owner.name },
    { label: 'CPF', value: vehicle.owner.cpf },
    { label: 'Telefone', value: vehicle.owner.phone },
    { label: 'Email', value: vehicle.owner.email },
    { label: 'Marca / Modelo', value: vehicle.brandModel },
    { label: 'Número de Série', value: vehicle.serialNumber },
  ]

  return (
    <div className="flex flex-col gap-1 text-sm leading-5">
      {fields.map(field => (
        <div key={field.label} className="flex flex-wrap gap-2">
          <span className="shrink-0 text-foreground-light">{field.label}</span>
          <span className="text-foreground">{field.value}</span>
        </div>
      ))}
    </div>
  )
}
