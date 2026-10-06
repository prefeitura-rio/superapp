'use client'

import { TrashIcon } from '@/assets/icons/trash-icon'
import { useRemoveConductorMutation } from '@/hooks/cadmicro/use-cadmicro-mutations'
import type { AuthorizedConductor } from '@/lib/cadmicro/types'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { RemoveConductorDrawer } from './remove-conductor-drawer'

interface AuthorizedConductorsSectionProps {
  vehicleId: string
  conductors: AuthorizedConductor[]
}

export function AuthorizedConductorsSection({
  vehicleId,
  conductors,
}: AuthorizedConductorsSectionProps) {
  const removeMutation = useRemoveConductorMutation(vehicleId)
  const [selected, setSelected] = useState<AuthorizedConductor | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open && !removeMutation.isPending) setSelected(null)
  }

  const handleConfirm = async () => {
    if (!selected) return

    try {
      const result = await removeMutation.mutateAsync(selected.id)
      if (!result.success) {
        toast.error(result.error || 'Não foi possível remover o condutor')
        return
      }

      setSelected(null)
      toast.success('Condutor removido')
    } catch {
      toast.error('Não foi possível remover o condutor')
    }
  }

  if (conductors.length === 0) {
    return (
      <p className="text-sm leading-5 text-foreground-light">
        Nenhum condutor autorizado.
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {conductors.map(conductor => (
          <div
            key={conductor.id}
            className="flex flex-col gap-1 rounded-2xl bg-background p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium leading-4 text-foreground">
                {conductor.name}
              </p>
              <button
                type="button"
                aria-label={`Remover ${conductor.name}`}
                className="cursor-pointer rounded-lg transition-colors"
                onClick={() => setSelected(conductor)}
              >
                <TrashIcon className="size-5 text-foreground hover:text-destructive transition-colors" />
              </button>
            </div>
            <div className="flex flex-col text-sm leading-5 text-foreground-light">
              <div className="flex gap-2">
                <span>CPF</span>
                <span>{conductor.cpf}</span>
              </div>
              {conductor.email && (
                <div className="flex gap-2">
                  <span>Email</span>
                  <span>{conductor.email}</span>
                </div>
              )}
              {conductor.phone && (
                <div className="flex gap-2">
                  <span>Telefone</span>
                  <span>{conductor.phone}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <RemoveConductorDrawer
        conductor={selected}
        open={selected !== null}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        isPending={removeMutation.isPending}
      />
    </>
  )
}
