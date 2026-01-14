'use client'

import { CheckIcon } from '@/assets/icons'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { normalizeCnaeForComparison } from '@/lib/mei-utils'
import { useCallback, useEffect, useState } from 'react'
import { fetchCnaesByIds } from '../actions/fetch-cnaes'
import type { CnaeDisplay } from './types'

interface CnaeInfoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cnaeIds?: string[]
  userCnaes?: string[]
}

export function CnaeInfoSheet({
  open,
  onOpenChange,
  cnaeIds,
  userCnaes,
}: CnaeInfoSheetProps) {
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
      title="Tipo de Serviço"
      className="overflow-visible"
    >
      <div className="text-foreground">
        <h2 className="text-xl font-medium mb-3">O que é isso?</h2>
        <p className="text-foreground-light text-sm leading-relaxed mb-6">
          Este tipo de serviço segue as atividades permitidas para MEI, conforme
          o CNAE.
        </p>

        {cnaeIds?.length ? (
          <>
            <h3 className="text-lg font-medium mb-4">
              CNAEs compatíveis com esta oportunidade
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {cnaeIds.map(id => (
                  <div key={id} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {cnaes.map(cnae => {
                  const isCompatible = userCnaes?.some(
                    userCnae =>
                      normalizeCnaeForComparison(userCnae) ===
                      normalizeCnaeForComparison(cnae.codigo)
                  )

                  return (
                    <p
                      key={cnae.codigo}
                      className="text-sm text-foreground flex items-start"
                    >
                      {isCompatible && (
                        <CheckIcon className="w-4 h-4 text-success shrink-0 mr-2 -ml-6 mt-0.5" />
                      )}
                      <span>
                        <span className="font-medium">{cnae.codigo}</span>
                        {cnae.descricao && ` – ${cnae.descricao}`}
                      </span>
                    </p>
                  )
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </BottomSheet>
  )
}
