'use client'

import { EditIcon } from '@/assets/icons/edit-icon'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { UsersIcon } from '@/assets/icons/users-icon'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface VehicleActionTilesProps {
  vehicleId: string
}

export function VehicleActionTiles({ vehicleId }: VehicleActionTilesProps) {
  const actionTiles = [
    {
      id: 'edit',
      primaryLabel: 'Editar',
      secondaryLabel: 'veículo',
      icon: <EditIcon className="size-5 text-foreground" />,
      href: `/carteira/riomob/${vehicleId}/editar`,
    },
    {
      id: 'add-conductor',
      primaryLabel: 'Adicionar',
      secondaryLabel: 'Condutor',
      icon: <UsersIcon className="size-5 text-foreground" />,
      href: `/carteira/riomob/${vehicleId}/adicionar-condutor`,
    },
    {
      id: 'delete',
      primaryLabel: 'Excluir',
      secondaryLabel: 'veículo',
      icon: <TrashIcon className="size-5 text-foreground" />,
    },
  ] as const

  return (
    <div className="flex w-full gap-1">
      {actionTiles.map(tile => (
        <ActionTile
          key={tile.id}
          primaryLabel={tile.primaryLabel}
          secondaryLabel={tile.secondaryLabel}
          icon={tile.icon}
          href={'href' in tile ? tile.href : undefined}
        />
      ))}
    </div>
  )
}

function ActionTile({
  primaryLabel,
  secondaryLabel,
  icon,
  href,
}: ActionTileProps) {
  const content = (
    <>
      <div className="flex h-16 w-full items-center justify-center rounded-2xl bg-card transition-colors group-hover:bg-secondary">
        {icon}
      </div>
      <div className="flex w-full flex-col items-center">
        <span className="text-center text-sm leading-5 text-card-foreground">
          {primaryLabel}
        </span>
        <span className="text-center text-sm leading-5 text-foreground-light">
          {secondaryLabel}
        </span>
      </div>
    </>
  )

  const className =
    'group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1'

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  )
}

interface ActionTileProps {
  primaryLabel: string
  secondaryLabel: string
  icon: ReactNode
  href?: string
}
