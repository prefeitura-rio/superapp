'use client'

import { removeConductor } from '@/actions/riomob'
import { TrashIcon } from '@/assets/icons/trash-icon'
import { useInvalidateRiomobQueries } from '@/hooks/riomob/use-invalidate-riomob-queries'
import type { AuthorizedConductor } from '@/lib/riomob/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RemoveConductorDrawer } from './remove-conductor-drawer'

interface AuthorizedConductorsSectionProps {
  vehicleId: string
  conductors: AuthorizedConductor[]
}

export function AuthorizedConductorsSection({
  vehicleId,
  conductors: initialConductors,
}: AuthorizedConductorsSectionProps) {
  const invalidate = useInvalidateRiomobQueries()
  const [conductors, setConductors] = useState(initialConductors)
  const [selected, setSelected] = useState<AuthorizedConductor | null>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setConductors(initialConductors)
  }, [initialConductors])

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) setSelected(null)
  }

  const handleConfirm = async () => {
    if (!selected) return

    setIsPending(true)
    try {
      const result = await removeConductor(vehicleId, selected.id)
      if (!result.success) {
        toast.error(result.error || 'Não foi possível remover o condutor')
        return
      }

      await invalidate.afterConductorChange(vehicleId)
      const removedId = selected.id
      setConductors(current => current.filter(c => c.id !== removedId))
      setSelected(null)
      toast.success('Condutor removido')
    } catch {
      toast.error('Não foi possível remover o condutor')
    } finally {
      setIsPending(false)
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
              <div className="flex gap-2">
                <span>Telefone</span>
                <span>{conductor.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RemoveConductorDrawer
        conductor={selected}
        open={selected !== null}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  )
}
