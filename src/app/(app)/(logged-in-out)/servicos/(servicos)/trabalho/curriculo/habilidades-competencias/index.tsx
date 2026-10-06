'use client'

import { CustomButton } from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AreaAtuacao } from './area-atuacao'
import { ComportamentosAtitudes } from './comportamentos-atitudes'
import { Conhecimentos } from './conhecimentos'
import type {
  AreaAtuacaoViewModel,
  HabilidadesCompetenciasData,
  HabilidadesCompetenciasPayload,
} from './types'
import {
  arraysDeIdsIguais,
  extrairIdsComportamentosUnicos,
  extrairIdsHabilidadesUnicos,
} from './utils'

interface HabilidadesCompetenciasAccordionContentProps {
  onCancel: () => void
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
  const [areasAtuacao, setAreasAtuacao] = useState(() =>
    structuredClone(initialData.areasAtuacao)
  )
  const [comportamentos, setComportamentos] = useState(() =>
    structuredClone(initialData.comportamentoAtitudes)
  )
  const [areaSelecionadaNome, setAreaSelecionadaNome] = useState('')
  const [salvando, setSalvando] = useState(false)

  const [snapshotHabilidades, setSnapshotHabilidades] = useState(() =>
    extrairIdsHabilidadesUnicos(initialData.areasAtuacao)
  )
  const [snapshotComportamentos, setSnapshotComportamentos] = useState(() =>
    extrairIdsComportamentosUnicos(initialData.comportamentoAtitudes)
  )

  const areaSelecionada =
    areasAtuacao.find(area => area.nome === areaSelecionadaNome) ?? null

  const idsHabilidadesAtuais = useMemo(
    () => extrairIdsHabilidadesUnicos(areasAtuacao),
    [areasAtuacao]
  )
  const idsComportamentosAtuais = useMemo(
    () => extrairIdsComportamentosUnicos(comportamentos),
    [comportamentos]
  )

  const houveAlteracao =
    !arraysDeIdsIguais(snapshotHabilidades, idsHabilidadesAtuais) ||
    !arraysDeIdsIguais(snapshotComportamentos, idsComportamentosAtuais)

  const toggleHabilidade = (idTupla: number) => {
    setAreasAtuacao(atuais =>
      atuais.map(area => {
        const vinculos = area.vinculos.map(vinculo =>
          vinculo.idTupla === idTupla
            ? { ...vinculo, checked: !vinculo.checked }
            : vinculo
        )
        return {
          ...area,
          vinculos,
          checked: vinculos.some(vinculo => vinculo.checked),
        }
      })
    )
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
      area_atuacao_habilidade_ids: idsHabilidadesAtuais,
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
      setSnapshotHabilidades([...idsHabilidadesAtuais])
      setSnapshotComportamentos([...idsComportamentosAtuais])
      queryClient.setQueryData<HabilidadesCompetenciasData>(
        ['habilidades-competencias'],
        {
          areasAtuacao: structuredClone(areasAtuacao),
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
      {
        areasAtuacao: structuredClone(initialData.areasAtuacao),
        comportamentoAtitudes: structuredClone(
          initialData.comportamentoAtitudes
        ),
      }
    )

    setSnapshotHabilidades([...idsHabilidadesAtuais])
    setSnapshotComportamentos([...idsComportamentosAtuais])

    onCancel()
  }

  return (
    <div className="space-y-6">
      <AreaAtuacao
        value={areaSelecionada?.nome}
        areasAtuacao={areasAtuacao}
        onSelect={(area: AreaAtuacaoViewModel) =>
          setAreaSelecionadaNome(area.nome)
        }
      />

      <Conhecimentos area={areaSelecionada} onToggle={toggleHabilidade} />

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
