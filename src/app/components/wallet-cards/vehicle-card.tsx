'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  useInvalidateRiomobSignedUrl,
  useRiomobSignedUrl,
} from '@/hooks/riomob/use-riomob-signed-url'
import {
  VEHICLE_TYPE_LABELS,
  type VehicleType,
} from '@/lib/riomob/catalog-constants'
import { isGcsObjectUrl } from '@/lib/riomob/file-types'
import { VEHICLE_CATEGORY_LABELS, type WalletVehicle } from '@/lib/riomob/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

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
          vehicleId={vehicle.id}
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

/** Mimics [`VehicleCard`] layout for the RioMob wallet loading state. */
export function VehicleCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        'relative flex h-45 w-full flex-col justify-between overflow-hidden rounded-2xl bg-muted p-6',
        className
      )}
      aria-hidden
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-28 bg-background/70" />
          <Skeleton className="h-3 w-24 bg-background/70" />
        </div>
        <Skeleton className="h-4 w-14 bg-background/70" />
      </div>
      <div className="flex w-full items-start gap-4">
        <Skeleton className="h-17.5 w-15 shrink-0 rounded-lg bg-background/70" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <Skeleton className="h-3 w-3/4 bg-background/70" />
          <Skeleton className="h-3 w-1/2 bg-background/70" />
          <Skeleton className="h-3 w-2/3 bg-background/70" />
          <Skeleton className="h-3 w-1/2 bg-background/70" />
        </div>
      </div>
    </article>
  )
}

export function VehicleCardsLoadingSkeleton() {
  return (
    <div
      className="grid w-full grid-cols-1 gap-2 min-[896px]:grid-cols-2"
      aria-busy="true"
      aria-label="Carregando veículos"
    >
      {Array.from({ length: 3 }, (_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  )
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
  vehicleId,
}: VehicleCardThumbnailProps) {
  const { url: resolvedUrl } = useRiomobSignedUrl(photoUrl, { vehicleId })
  const invalidate = useInvalidateRiomobSignedUrl()
  const invalidatedForKeyRef = useRef<string | null>(null)
  const invalidateKey = `${photoUrl ?? ''}|${vehicleId}`

  return (
    <div className="flex h-17.5 w-15 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-white/15">
      {resolvedUrl ? (
        <Image
          src={resolvedUrl}
          alt={`Foto de ${displayName}`}
          width={60}
          height={70}
          unoptimized
          className="size-full object-cover"
          onError={() => {
            if (
              !isGcsObjectUrl(photoUrl) ||
              invalidatedForKeyRef.current === invalidateKey
            ) {
              return
            }
            invalidatedForKeyRef.current = invalidateKey
            void invalidate(photoUrl, vehicleId)
          }}
        />
      ) : null}
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

/** Solid fallback + theme gradient (`--background-image-riomob-*` in globals.css). */
const VEHICLE_CARD_GRADIENTS: Record<VehicleType, string> = {
  autopropelido: 'bg-[#193cb8] bg-riomob-autopropelido',
  bicicleta_eletrica: 'bg-[#007a55] bg-riomob-bike',
  ciclomotor: 'bg-[#e17100] bg-riomob-ciclomotor',
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
  vehicleId: string
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
