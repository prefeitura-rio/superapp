'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import type { ConhecimentosDaAreaData } from './types'

interface ConhecimentosProps {
  areaId: number | null
  selecionados: number[]
  onToggle: (id: number) => void
}

export const conhecimentosDaAreaQueryKey = (areaId: number | null) =>
  ['habilidades-competencias-area', areaId] as const

async function fetchConhecimentosDaArea(
  areaId: number
): Promise<ConhecimentosDaAreaData> {
  const response = await fetch(
    `/api/user/empregos/curriculo/habilidades-competencias/areas/${areaId}/habilidades`
  )
  if (!response.ok) throw new Error('Falha ao carregar conhecimentos da área')
  return response.json()
}

const obterClassName = (checked: boolean) => {
  if (checked) {
    return 'size- px-4 py-1.5 bg-[#E4E4E7] rounded-[999px] outline outline-1 outline-offset-[-1px] outline-black inline-flex justify-center items-center gap-1.5'
  }

  return 'size- px-4 py-1.5 bg-theme-color-card rounded-[999px] inline-flex justify-center items-center gap-1.5'
}

export function Conhecimentos({
  areaId,
  selecionados,
  onToggle,
}: ConhecimentosProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: conhecimentosDaAreaQueryKey(areaId),
    queryFn: () => fetchConhecimentosDaArea(areaId as number),
    enabled: areaId !== null,
    staleTime: 5 * 60 * 1000,
  })

  if (areaId === null) return null

  if (isLoading) {
    return (
      <div className="mt-4 flex w-full flex-wrap gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="mt-4 text-sm text-destructive">
        Não foi possível carregar os conhecimentos desta área.
      </p>
    )
  }

  if (data.conhecimentos.length === 0) return null

  const idsSelecionados = new Set(selecionados)

  return (
    <div className="mt-4 w-full space-y-2">
      <span className="text-primary text-sm font-normal">
        Selecione conhecimentos
      </span>
      <div className="flex w-full flex-wrap gap-2 mt-3">
        {data.conhecimentos.map(conhecimento => {
          const checked = idsSelecionados.has(conhecimento.id)
          return (
            <button
              key={conhecimento.id}
              type="button"
              aria-pressed={checked}
              onClick={() => onToggle(conhecimento.id)}
              className={obterClassName(checked)}
            >
              <div className="justify-start text-theme-color-foreground text-sm font-normal font-['DM_Sans'] leading-5">
                {conhecimento.nome}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
