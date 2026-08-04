import {
  VEHICLE_TYPE_LABELS,
  type VehicleType,
} from '@/app/(app)/(logged-in)/carteira/riomob/adicionar-veiculo/mocks/vehicle-catalog'
import {
  VEHICLE_CATEGORY_LABELS,
  type WalletVehicle,
} from '@/app/(app)/(logged-in)/carteira/riomob/mocks/vehicles'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export function VehicleCard({ vehicle, href, className }: VehicleCardProps) {
  const card = (
    <article
      className={cn(
        'relative flex h-45 w-full flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-[0px_2px_10px_0px_rgba(0,0,0,0.15)]',
        VEHICLE_CARD_GRADIENTS[vehicle.vehicleType],
        className
      )}
    >
      <VehicleCardDecoration />
      <VehicleCardHeader />
      <div className="relative z-10 flex w-full items-start gap-4">
        <VehicleCardThumbnail
          photoUrl={vehicle.photoUrl}
          displayName={vehicle.displayName}
        />
        <VehicleCardFields vehicle={vehicle} />
      </div>
    </article>
  )

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {card}
      </Link>
    )
  }

  return card
}

function VehicleCardDecoration() {
  return (
    <Image
      src="/square-shadow.svg"
      alt=""
      width={268}
      height={180}
      className="pointer-events-none absolute top-0 -right-26 h-full w-auto select-none sm:right-0"
      aria-hidden
    />
  )
}

function VehicleCardHeader() {
  return (
    <div className="relative z-10 flex w-full items-start justify-between gap-2">
      <p className="min-w-0 text-xs font-normal leading-4 text-white uppercase">
        Registro de veículos
        <br />
        de micromobilidade
      </p>
      <span className="shrink-0 font-montserrat text-base font-extrabold leading-5 text-white">
        RioMob
      </span>
    </div>
  )
}

function VehicleCardThumbnail({
  photoUrl,
  displayName,
}: VehicleCardThumbnailProps) {
  return (
    <div className="flex h-17.5 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/15">
      <Image
        src={photoUrl}
        alt={`Foto de ${displayName}`}
        width={60}
        height={70}
        className="size-full object-cover"
      />
    </div>
  )
}

function VehicleCardFields({ vehicle }: VehicleCardFieldsProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      {VEHICLE_CARD_FIELDS.map(field => (
        <VehicleCardField
          key={field.label}
          label={field.label}
          value={field.getValue(vehicle)}
        />
      ))}
    </div>
  )
}

function VehicleCardField({ label, value }: VehicleCardFieldProps) {
  return (
    <div className="flex w-full min-w-0 items-start gap-1">
      <span className="shrink-0 text-xs font-normal leading-4 text-white/70">
        {label}
      </span>
      <span className="min-w-0 truncate text-xs font-normal leading-4 text-white">
        {value}
      </span>
    </div>
  )
}

const VEHICLE_CARD_GRADIENTS: Record<VehicleType, string> = {
  autopropelido: 'bg-[image:var(--riomob-gradient-autopropelido)]',
  bicicleta_eletrica: 'bg-[image:var(--riomob-gradient-bike)]',
  ciclomotor: 'bg-[image:var(--riomob-gradient-ciclomotor)]',
}

const VEHICLE_CARD_FIELDS: VehicleCardFieldDef[] = [
  {
    label: 'Nome',
    getValue: vehicle => vehicle.displayName,
  },
  {
    label: 'Tipo',
    getValue: vehicle => VEHICLE_TYPE_LABELS[vehicle.vehicleType],
  },
  {
    label: 'Nº de Registro',
    getValue: vehicle => vehicle.registrationNumber,
  },
  {
    label: 'Categoria',
    getValue: vehicle => VEHICLE_CATEGORY_LABELS[vehicle.category],
  },
]

interface VehicleCardProps {
  vehicle: WalletVehicle
  href?: string
  className?: string
}

interface VehicleCardThumbnailProps {
  photoUrl: string
  displayName: string
}

interface VehicleCardFieldsProps {
  vehicle: WalletVehicle
}

interface VehicleCardFieldProps {
  label: string
  value: string
}

interface VehicleCardFieldDef {
  label: string
  getValue: (vehicle: WalletVehicle) => string
}
