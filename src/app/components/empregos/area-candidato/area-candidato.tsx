'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuthHeader } from '@/providers/auth-header-provider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  type BancoCurriculosStatus,
  subtituloMeuCurriculo,
} from './area-candidato-utils'
import { BancoCurriculosCard } from './banco-curriculos-card'
import { CriarCurriculoBanner } from './criar-curriculo-banner'
import { MeuCurriculoCard } from './meu-curriculo-card'
import { MinhasCandidaturasCard } from './minhas-candidaturas-card'

const BANCO_CURRICULOS_KEY = ['banco-curriculos'] as const

async function fetchBancoCurriculos(): Promise<BancoCurriculosStatus> {
  const res = await fetch('/api/user/empregos/banco-curriculos', {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Falha ao consultar o banco de currículos')
  return res.json()
}

async function fetchCandidaturas(): Promise<{
  hasCandidaturas: boolean
  total?: number
}> {
  const res = await fetch('/api/user/empregos/candidaturas', {
    cache: 'no-store',
  })
  if (!res.ok) return { hasCandidaturas: false }
  return res.json()
}

async function alterarBancoCurriculos(
  disponivel: boolean
): Promise<BancoCurriculosStatus> {
  const res = await fetch('/api/user/empregos/banco-curriculos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disponivel }),
  })
  if (!res.ok) throw new Error('Falha ao atualizar o banco de currículos')
  return res.json()
}

function AreaCandidatoSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  )
}

/**
 * Topo da página de Trabalho: banner de criação de currículo para quem está
 * deslogado; para quem está logado, os cards "Meu Currículo" e "Minhas
 * candidaturas" e o controle do banco de currículos.
 */
export function AreaCandidato() {
  const { data: auth, isLoading: carregandoAuth } = useAuthHeader()
  const logado = auth.isLoggedIn
  const queryClient = useQueryClient()

  const banco = useQuery({
    queryKey: BANCO_CURRICULOS_KEY,
    queryFn: fetchBancoCurriculos,
    enabled: logado,
  })
  const candidaturas = useQuery({
    queryKey: ['candidaturas'],
    queryFn: fetchCandidaturas,
    staleTime: 5 * 60 * 1000,
    enabled: logado,
  })

  const alterar = useMutation({
    mutationFn: alterarBancoCurriculos,
    onSuccess: status => {
      queryClient.setQueryData(BANCO_CURRICULOS_KEY, status)
    },
    onError: () => {
      toast.error('Não foi possível atualizar o Banco de Currículos.')
      queryClient.invalidateQueries({ queryKey: BANCO_CURRICULOS_KEY })
    },
  })

  if (carregandoAuth) return <AreaCandidatoSkeleton />
  if (!logado) return <CriarCurriculoBanner />
  if (banco.isPending) return <AreaCandidatoSkeleton />

  // Se a consulta falhar, os cards seguem funcionando como atalhos e o
  // controle fica indisponível.
  const status = banco.data

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <MeuCurriculoCard
          subtitulo={
            status ? subtituloMeuCurriculo(status) : 'Termine de preencher'
          }
        />
        <MinhasCandidaturasCard total={candidaturas.data?.total ?? 0} />
      </div>
      <BancoCurriculosCard
        temCurriculo={status?.temCurriculo ?? false}
        disponivel={status?.disponivel ?? false}
        salvando={alterar.isPending}
        onAlterar={disponivel => alterar.mutate(disponivel)}
      />
    </div>
  )
}
