'use client'

import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { useCallback, useEffect, useState } from 'react'
import { fetchCnaesByIds } from '../actions/fetch-cnaes'
import type { CnaeDisplay } from './types'

interface CnaeIncompatibleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cnaeIds?: string[]
}

export function CnaeIncompatibleSheet({
  open,
  onOpenChange,
  cnaeIds,
}: CnaeIncompatibleSheetProps) {
  const [cnaes, setCnaes] = useState<CnaeDisplay[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const loadCnaes = useCallback(async () => {
    if (!cnaeIds?.length || hasFetched) return

    setIsLoading(true)
    try {
      const results = await fetchCnaesByIds(cnaeIds)
      setCnaes(results)
      setHasFetched(true)
    } catch (error) {
      console.error('[MEI] Error fetching CNAEs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [cnaeIds, hasFetched])

  useEffect(() => {
    if (open && !hasFetched) {
      loadCnaes()
    }
  }, [open, hasFetched, loadCnaes])

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Empresa Incompatível"
    >
      <div className="text-foreground">
        <h2 className="text-xl font-medium mb-3">
          Você não possui uma empresa compatível com esse serviço
        </h2>
        <p className="text-foreground-light text-sm leading-relaxed mb-6">
          Essa oportunidade é oferecida exclusivamente para os seguintes CNAEs:
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {(cnaeIds || []).map((id) => (
              <div key={id} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-1" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {cnaes.map((cnae) => (
              <div key={cnae.codigo}>
                <p className="text-sm text-foreground">
                  <span className="font-medium">{cnae.codigo}</span>
                  {cnae.descricao && ` – ${cnae.descricao}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
