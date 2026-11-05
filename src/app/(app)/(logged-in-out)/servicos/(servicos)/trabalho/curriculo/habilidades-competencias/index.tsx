'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AreaAtuacao } from './area-atuacao'
import { ComportamentosAtitudes } from './comportamentos-atitudes'
import { Conhecimentos, conhecimentosDaAreaQueryKey } from './conhecimentos'
import type {
  AreaAtuacaoViewModel,
  ConhecimentosDaAreaData,
  HabilidadesCompetenciasData,
  HabilidadesCompetenciasPayload,
} from './types'
import {
  alternarId,
  arraysDeIdsIguais,
  extrairIdsComportamentosUnicos,
} from './utils'

interface HabilidadesCompetenciasAccordionContentProps {
  onCancel: () => void
}

interface Snapshot {
  areaId: number | null
  habilidadeIds: number[]
  comportamentoIds: number[]
}

async function fetchHabilidadesCompetencias(): Promise<HabilidadesCompetenciasData> {
  const response = await fetch(
    '/api/user/empregos/curriculo/habilidades-competencias'
  )
  if (!response.ok)
    throw new Error('Falha ao carregar habilidades e competências')
  return response.json()
}

function HabilidadesCompetenciasEditor({
  initialData,
  onCancel,
}: {
  initialData: HabilidadesCompetenciasData
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const [areaSelecionada, setAreaSelecionada] =
    useState<AreaAtuacaoViewModel | null>(initialData.areaAtuacaoSelecionada)
  const [habilidadeIds, setHabilidadeIds] = useState<number[]>(() =>
    initialData.conhecimentosSelecionados.map(item => item.id)
  )
  const [comportamentos, setComportamentos] = useState(() =>
    structuredClone(initialData.comportamentoAtitudes)
  )
  const [salvando, setSalvando] = useState(false)

  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({
    areaId: initialData.areaAtuacaoSelecionada?.id ?? null,
    habilidadeIds: initialData.conhecimentosSelecionados.map(item => item.id),
    comportamentoIds: extrairIdsComportamentosUnicos(
      initialData.comportamentoAtitudes
    ),
  }))

  const areaId = areaSelecionada?.id ?? null

  const idsComportamentosAtuais = useMemo(
    () => extrairIdsComportamentosUnicos(comportamentos),
    [comportamentos]
  )

  const houveAlteracao =
    snapshot.areaId !== areaId ||
    !arraysDeIdsIguais(snapshot.habilidadeIds, habilidadeIds) ||
    !arraysDeIdsIguais(snapshot.comportamentoIds, idsComportamentosAtuais)

  const selecionarArea = (area: AreaAtuacaoViewModel) => {
    if (area.id === areaId) return
    // O currículo guarda uma só área, e os conhecimentos precisam ser dela.
    setAreaSelecionada(area)
    setHabilidadeIds([])
  }

  const toggleHabilidade = (id: number) => {
    setHabilidadeIds(atuais => alternarId(atuais, id))
  }

  const toggleComportamento = (id: number) => {
    setComportamentos(atuais =>
      atuais.map(item =>
        item.id === id ? { ...item, clicked: !item.clicked } : item
      )
    )
  }

  const salvar = async () => {
    if (!houveAlteracao || salvando) return

    const payload: HabilidadesCompetenciasPayload = {
      id_area_atuacao: areaId,
      habilidade_ids: habilidadeIds,
      comportamento_atitudes_ids: idsComportamentosAtuais,
    }

    try {
      setSalvando(true)
      const response = await fetch(
        '/api/user/empregos/curriculo/habilidades-competencias',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) throw new Error('Falha ao atualizar currículo')

      // O estado atual passa a ser o novo snapshot persistido. Não refazemos
      // leitura dos catálogos: eles já estão em cache na tela e não mudaram.
      setSnapshot({
        areaId,
        habilidadeIds: [...habilidadeIds],
        comportamentoIds: [...idsComportamentosAtuais],
      })
      queryClient.setQueryData<HabilidadesCompetenciasData>(
        ['habilidades-competencias'],
        {
          areasAtuacao: initialData.areasAtuacao,
          areaAtuacaoSelecionada: areaSelecionada,
          conhecimentosSelecionados: (
            queryClient.getQueryData<ConhecimentosDaAreaData>(
              conhecimentosDaAreaQueryKey(areaId)
            )?.conhecimentos ?? []
          ).filter(item => habilidadeIds.includes(item.id)),
          comportamentoAtitudes: structuredClone(comportamentos),
        }
      )
      toast.success('Habilidades e competências salvas com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar habilidades e competências:', error)
      toast.error('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const handleCancel = () => {
    // Desfaz todas as possíveis alterações, retornando assim ao estado anterior.
    queryClient.setQueryData<HabilidadesCompetenciasData>(
      ['habilidades-competencias'],
      structuredClone(initialData)
    )

    onCancel()
  }

  return (
    <div className="space-y-6">
      <AreaAtuacao
        value={areaSelecionada?.nome}
        selecionadaId={areaSelecionada?.id}
        areasAtuacao={initialData.areasAtuacao}
        onSelect={selecionarArea}
      />

      <Conhecimentos
        areaId={areaId}
        selecionados={habilidadeIds}
        onToggle={toggleHabilidade}
      />

      <ComportamentosAtitudes
        itens={comportamentos}
        onToggle={toggleComportamento}
      />
      <div className="flex gap-3">
        <CustomButton
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={handleCancel}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={salvar}
          disabled={!houveAlteracao || salvando}
        >
          {salvando && <Loader2 className="size-4 animate-spin" />}
          {salvando ? 'Salvando...' : 'Salvar'}
        </CustomButton>
      </div>
    </div>
  )
}

export function HabilidadesCompetencias({
  onCancel,
}: HabilidadesCompetenciasAccordionContentProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['habilidades-competencias'],
    queryFn: fetchHabilidadesCompetencias,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 60 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar habilidades e competências.
      </p>
    )
  }

  return (
    <HabilidadesCompetenciasEditor initialData={data} onCancel={onCancel} />
  )
}
