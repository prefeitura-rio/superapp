'use client'

import { VagaDetailContent } from '@/app/components/empregos/vaga-detail-content'
import type { VagaDetail } from '@/lib/emprego-utils'
import { useQuery } from '@tanstack/react-query'

async function fetchHeaderData() {
  const res = await fetch('/api/user/header', {
    cache: 'no-store',
    credentials: 'include',
  })
  if (!res.ok) return { isLoggedIn: false }
  return res.json()
}

async function fetchCandidaturaVaga(vagaId: string) {
  const res = await fetch(`/api/user/empregos/candidaturas?vagaId=${vagaId}`, {
    cache: 'no-store',
  })
  if (!res.ok) return { hasCandidatura: false }
  return res.json()
}

interface VagaDetailClientProps {
  vaga: VagaDetail
  vagaAtiva: boolean
}

export function VagaDetailClient({ vaga, vagaAtiva }: VagaDetailClientProps) {
  const { data: headerData } = useQuery({
    queryKey: ['header'],
    queryFn: fetchHeaderData,
    staleTime: 5 * 60 * 1000,
  })

  const isLoggedIn = headerData?.isLoggedIn ?? false

  const { data: candidaturaData } = useQuery({
    queryKey: ['candidatura', vaga.id],
    queryFn: () => fetchCandidaturaVaga(vaga.id),
    staleTime: 5 * 60 * 1000,
    enabled: isLoggedIn,
  })

  const hasCandidatura = candidaturaData?.hasCandidatura ?? false

  const vagaComCandidatura: VagaDetail = hasCandidatura
    ? {
        ...vaga,
        etapaAtualCandidatura: candidaturaData?.etapaAtualCandidatura,
        statusCandidatura: candidaturaData?.statusCandidatura,
      }
    : vaga

  return (
    <VagaDetailContent
      vaga={vagaComCandidatura}
      isLoggedIn={isLoggedIn}
      hasCandidatura={hasCandidatura}
      vagaAtiva={vagaAtiva}
    />
  )
}
