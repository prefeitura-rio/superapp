'use client'

import { ActionDiv } from '@/app/components/action-div'
import {
  CustomButton,
  accordionCancelButtonClassName,
  accordionSaveButtonClassName,
} from '@/components/ui/custom/custom-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AreaAtuacaoSheet } from './area-atuacao-sheet'
import {
  type CatalogoItem,
  HABILIDADES_VAZIO,
  type HabilidadesCompetenciasForm,
  alternarItem,
  mesmosIds,
  unirSelecionados,
} from './catalogo'
import { CatalogoTag } from './catalogo-tag'
import { saveHabilidadesCompetenciasAction } from './habilidades-competencias-actions'
import {
  comportamentosQueryOptions,
  conhecimentosDaAreaQueryOptions,
  habilidadesCompetenciasQueryOptions,
} from './habilidades-competencias-queries'

interface HabilidadesCompetenciasProps {
  onCancel: () => void
  onFilledChange?: (preenchida: boolean) => void
  onAreaErrorChange?: (erro: boolean) => void
  onDirtyChange?: (alterado: boolean) => void
}

const LARGURAS_TAG = [
  'w-64',
  'w-56',
  'w-48',
  'w-44',
  'w-40',
  'w-36',
  'w-32',
  'w-28',
  'w-24',
  'w-24',
]

function TagSkeletons() {
  return (
    <div
      className="flex flex-wrap gap-2"
      aria-busy="true"
      aria-label="Carregando conhecimentos"
    >
      {Array.from({ length: 10 }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-8 rounded-full ${LARGURAS_TAG[index % LARGURAS_TAG.length]}`}
        />
      ))}
    </div>
  )
}

function TagGroup({
  itens,
  selecionados,
  onToggle,
}: {
  itens: CatalogoItem[]
  selecionados: CatalogoItem[]
  onToggle: (item: CatalogoItem) => void
}) {
  const visiveis = unirSelecionados(itens, selecionados)
  if (visiveis.length === 0) return null

  return (
    <div className="flex flex-wrap content-start items-start gap-2 self-stretch">
      {visiveis.map(item => (
        <CatalogoTag
          key={item.id}
          selected={selecionados.some(atual => atual.id === item.id)}
          onClick={() => onToggle(item)}
        >
          {item.nome}
        </CatalogoTag>
      ))}
    </div>
  )
}

function HabilidadesCompetenciasEditor({
  initialData,
  onCancel,
  onFilledChange,
  onAreaErrorChange,
  onDirtyChange,
}: {
  initialData: HabilidadesCompetenciasForm
  onCancel: () => void
  onFilledChange?: (preenchida: boolean) => void
  onAreaErrorChange?: (erro: boolean) => void
  onDirtyChange?: (alterado: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [area, setArea] = useState(initialData.area)
  const [conhecimentos, setConhecimentos] = useState(initialData.conhecimentos)
  const [comportamentos, setComportamentos] = useState(
    initialData.comportamentos
  )
  const [snapshot, setSnapshot] = useState(initialData)
  const [areaError, setAreaError] = useState<string>()
  const [salvando, setSalvando] = useState(false)

  const { data: paginaConhecimentos, isLoading: conhecimentosCarregando } =
    useQuery(conhecimentosDaAreaQueryOptions(area?.id))
  const { data: paginaComportamentos } = useQuery(comportamentosQueryOptions())

  const houveAlteracao =
    area?.id !== snapshot.area?.id ||
    !mesmosIds(conhecimentos, snapshot.conhecimentos) ||
    !mesmosIds(comportamentos, snapshot.comportamentos)

  useEffect(() => {
    onFilledChange?.(area?.id != null)
  }, [area?.id, onFilledChange])

  useEffect(() => {
    onDirtyChange?.(houveAlteracao)
  }, [houveAlteracao, onDirtyChange])

  const definirErro = (mensagem?: string) => {
    setAreaError(mensagem)
    onAreaErrorChange?.(Boolean(mensagem))
  }

  const selecionarArea = (proxima: CatalogoItem) => {
    definirErro(undefined)
    if (area?.id !== proxima.id) setConhecimentos([])
    setArea(proxima)
  }

  const salvar = async () => {
    if (!houveAlteracao || salvando) return

    let salvou = false
    try {
      setSalvando(true)
      const result = await saveHabilidadesCompetenciasAction({
        id_area_atuacao: area?.id ?? null,
        habilidade_ids: conhecimentos.map(item => item.id),
        comportamento_atitudes_ids: comportamentos.map(item => item.id),
      })

      if (!result.ok) {
        if (result.status === 400) definirErro(result.error)
        toast.error('Não foi possível salvar. Tente novamente.')
        return
      }

      definirErro(undefined)
      setArea(result.data.area)
      setConhecimentos(result.data.conhecimentos)
      setComportamentos(result.data.comportamentos)
      setSnapshot(result.data)
      queryClient.setQueryData(['habilidades-competencias'], {
        ok: true,
        data: result.data,
      })
      toast.success('Habilidades salvas com sucesso')
      onDirtyChange?.(false)
      salvou = true
    } catch (error) {
      console.error('Erro ao atualizar habilidades e competências:', error)
      toast.error('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }

    if (salvou) onCancel()
  }

  const handleCancel = () => {
    setArea(snapshot.area)
    setConhecimentos(snapshot.conhecimentos)
    setComportamentos(snapshot.comportamentos)
    definirErro(undefined)
    onDirtyChange?.(false)
    onCancel()
  }

  return (
    <div className="space-y-6">
      <div data-testid="field-area-atuacao">
        <ActionDiv
          label="Área de atuação"
          content={
            area ? (
              area.nome
            ) : (
              <span className="text-foreground-light">
                Selecionar a área de atuação
              </span>
            )
          }
          disabled
          error={areaError}
          rightIcon={
            <ChevronDownIcon
              className={
                area
                  ? 'size-5 stroke-[1.5] text-primary'
                  : 'size-5 stroke-[1.5] text-primary'
              }
            />
          }
          drawerContent={
            <AreaAtuacaoSheet selectedId={area?.id} onSelect={selecionarArea} />
          }
          drawerTitle="Área de atuação"
        />
      </div>

      {area && (
        <div className="space-y-2">
          <span className="text-sm font-normal text-primary">
            Selecione conhecimentos
          </span>
          {conhecimentosCarregando ? (
            <TagSkeletons />
          ) : (
            <TagGroup
              itens={paginaConhecimentos?.data ?? []}
              selecionados={conhecimentos}
              onToggle={item =>
                setConhecimentos(atuais => alternarItem(atuais, item))
              }
            />
          )}
        </div>
      )}

      <div className="space-y-2">
        <span className="text-sm font-normal text-primary">
          Selecione comportamentos e atitudes
        </span>
        <TagGroup
          itens={paginaComportamentos?.data ?? []}
          selecionados={comportamentos}
          onToggle={item =>
            setComportamentos(atuais => alternarItem(atuais, item))
          }
        />
      </div>

      <div className="flex gap-3">
        <CustomButton
          type="button"
          variant="card"
          size="lg"
          className={accordionCancelButtonClassName}
          onClick={handleCancel}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className={accordionSaveButtonClassName}
          onClick={salvar}
          disabled={!houveAlteracao || salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </CustomButton>
      </div>
    </div>
  )
}

export function HabilidadesCompetencias({
  onCancel,
  onFilledChange,
  onAreaErrorChange,
  onDirtyChange,
}: HabilidadesCompetenciasProps) {
  const { data, isLoading, isError } = useQuery(
    habilidadesCompetenciasQueryOptions()
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  if (isError || !data?.ok) {
    return (
      <p className="text-sm text-destructive">
        Não foi possível carregar habilidades e competências.
      </p>
    )
  }

  return (
    <HabilidadesCompetenciasEditor
      initialData={data.data ?? HABILIDADES_VAZIO}
      onCancel={onCancel}
      onFilledChange={onFilledChange}
      onAreaErrorChange={onAreaErrorChange}
      onDirtyChange={onDirtyChange}
    />
  )
}
