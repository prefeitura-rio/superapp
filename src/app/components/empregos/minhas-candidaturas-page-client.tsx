'use client'

import { MinhasCandidaturasContent } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/minhas-candidaturas/minhas-candidaturas-content'
import type { CandidaturaCardData } from '@/app/(app)/(logged-in-out)/servicos/(servicos)/trabalho/minhas-candidaturas/minhas-candidaturas-utils'
import { OportunidadesSubHeader } from '@/app/components/oportunidades/oportunidades-sub-header'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

interface CandidaturasResponse {
  candidaturas: CandidaturaCardData[]
  hasCandidaturas: boolean
  /** Candidaturas com mudança de status ou de etapa ainda não vista. */
  atualizacoes?: number
}

async function fetchCandidaturas(): Promise<CandidaturasResponse> {
  const res = await fetch('/api/user/empregos/candidaturas', {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch candidaturas')
  return res.json()
}

async function marcarAtualizacoesVistas(): Promise<void> {
  const res = await fetch('/api/user/empregos/candidaturas/visualizar', {
    method: 'PUT',
  })
  if (!res.ok) throw new Error('Failed to mark candidaturas as seen')
}

function MinhasCandidaturasSkeleton() {
  return (
    <div>
      <OportunidadesSubHeader
        logoHref="/servicos/trabalho"
        showSearchIcon
        searchUrl="/busca?tipo=empregos"
      />
      <div>
        <div className="max-w-4xl mx-auto text-foreground pb-10">
          <div className="px-4 pt-2 md:pt-0">
            <Skeleton className="h-9 w-52 mb-2" />
            <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MinhasCandidaturasPageClient() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidaturas'],
    queryFn: fetchCandidaturas,
    staleTime: 5 * 60 * 1000,
  })

  // Abrir a lista é ver as atualizações: zera a contagem do card "Minhas
  // candidaturas". Se falhar, a contagem só continua lá até a próxima visita.
  const { mutate: marcarVistas } = useMutation({
    mutationFn: marcarAtualizacoesVistas,
    onSuccess: () => {
      queryClient.setQueryData<CandidaturasResponse>(['candidaturas'], atual =>
        atual ? { ...atual, atualizacoes: 0 } : atual
      )
    },
  })
  const atualizacoes = data?.atualizacoes ?? 0
  useEffect(() => {
    if (atualizacoes > 0) marcarVistas()
  }, [atualizacoes, marcarVistas])

  if (isLoading) return <MinhasCandidaturasSkeleton />

  return (
    <MinhasCandidaturasContent
      candidaturas={data?.candidaturas ?? []}
      hasError={isError}
    />
  )
}
