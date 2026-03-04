'use client'

import { ActionDiv } from '@/app/components/action-div'
import { CandidaturaEnviadaDrawer } from '@/app/components/empregos/candidatura-enviada-drawer'
import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { Separator } from '@/components/ui/separator'
import type { EmpregabilidadeFormacaoAccordionRequest } from '@/http-courses/models'
import { formatEducation } from '@/lib/format-education'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import confetti from 'canvas-confetti'
import { Check, ChevronDownIcon, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form'
import toast from 'react-hot-toast'
import { AnoConclusaoDrawerContent } from './ano-conclusao-drawer-content'
import { TEMPO_PROCURANDO_EMPREGO_CODE_TO_LABEL } from './constants'
import type { CurriculoExperienciaFormValues } from './curriculo-experiencia-schema'
import type { CurriculoFormacaoFormValues } from './curriculo-formacao-schema'
import { curriculoSchema } from './curriculo-schema'
import type { CurriculoFormValues } from './curriculo-schema'
import type { CurriculoSituacaoFormValues } from './curriculo-situacao-schema'
import { DisponibilidadeDrawerContent } from './disponibilidade-drawer-content'
import { EscolaridadeDrawerContent } from './escolaridade-drawer-content'
import { ExperienciaApiProvider } from './experiencia-api-context'
import type { ExperienciaOptions } from './experiencia-options-types'
import {
  ExperienciaProfissionalAccordionContent,
  getExperienciaSnapshot,
  hasExperienciaValidationErrors,
} from './experiencia-profissional-accordion-content'
import { FormacaoApiProvider, useFormacaoApi } from './formacao-api-context'
import type { FormacaoOptions } from './formacao-options-types'
import type {
  InitialFormacaoItem,
  InitialIdiomaItem,
} from './get-curriculo-formacao-data'
import type { InitialSituacaoData } from './get-curriculo-situacao-data'
import { IdiomaDrawerContent } from './idioma-drawer-content'
import { NivelIdiomaDrawerContent } from './nivel-idioma-drawer-content'
import { saveFormacaoAccordion } from './save-formacao-action'
import { saveSituacaoAction } from './save-situacao-action'
import { SituacaoApiProvider, useSituacaoApi } from './situacao-api-context'
import { SituacaoAtualDrawerContent } from './situacao-atual-drawer-content'
import type { SituacaoOptions } from './situacao-options-types'
import { shouldShowJobSearchDuration } from './situation-utils'
import { StatusFormacaoDrawerContent } from './status-formacao-drawer-content'
import { TempoProcurandoEmpregoDrawerContent } from './tempo-procurando-emprego-drawer-content'
import { TermosUsoAccordionContent } from './termos-uso-accordion-content'
import { TipoFormacaoDrawerContent } from './tipo-formacao-drawer-content'
import { TipoVinculoDrawerContent } from './tipo-vinculo-drawer-content'

const ACCORDION_ITEMS = [
  { value: 'formacao', title: 'Formação' },
  { value: 'experiencia', title: 'Experiência Profissional' },
  { value: 'situacao', title: 'Situação atual' },
  { value: 'termos', title: 'Termos de Uso' },
] as const

const HINT_CLASS = 'text-muted-foreground text-sm leading-5 font-normal mt-1'

const FORMACAO_ERROR_PATHS = [
  'escolaridade',
  'formacaoAcademica',
  'idiomas',
] as const

const SITUACAO_ERROR_PATHS = [
  'idSituacao',
  'tempoProcurandoEmprego',
  'idDisponibilidade',
  'idsTiposVinculo',
] as const

const TERMOS_ERROR_PATHS = ['termosAceitos'] as const

function hasNestedErrors(obj: unknown): boolean {
  if (!obj) return false
  if (
    typeof obj === 'object' &&
    'message' in obj &&
    typeof (obj as { message?: unknown }).message === 'string'
  )
    return true
  if (Array.isArray(obj)) return obj.some(item => hasNestedErrors(item))
  if (typeof obj === 'object')
    return Object.values(obj).some(val => hasNestedErrors(val))
  return false
}

function hasFormacaoValidationErrors(errors: Record<string, unknown>): boolean {
  return FORMACAO_ERROR_PATHS.some(path => hasNestedErrors(errors[path]))
}

function hasSituacaoValidationErrors(errors: Record<string, unknown>): boolean {
  return SITUACAO_ERROR_PATHS.some(path => hasNestedErrors(errors[path]))
}

function hasTermosValidationErrors(errors: Record<string, unknown>): boolean {
  return TERMOS_ERROR_PATHS.some(path => hasNestedErrors(errors[path]))
}

function getFirstErrorField(errors: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue

    // Se é um erro direto (tem message)
    if (typeof value === 'object' && 'message' in value) {
      return key
    }

    // Se é um array (como formacaoAcademica, idiomas, empregos, conquistas)
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i]
        if (item && typeof item === 'object') {
          for (const [fieldKey, fieldValue] of Object.entries(item)) {
            if (
              fieldValue &&
              typeof fieldValue === 'object' &&
              'message' in fieldValue
            ) {
              return `${key}.${i}.${fieldKey}`
            }
          }
        }
      }
    }
  }
  return null
}

function hasFormacaoRequiredFields(
  values: CurriculoFormacaoFormValues
): boolean {
  const hasEscolaridade = (values.escolaridade?.trim()?.length ?? 0) > 0
  const hasIdiomas = (values.idiomas ?? []).some(
    item =>
      (item.idIdioma?.trim()?.length ?? 0) > 0 &&
      (item.idNivel?.trim()?.length ?? 0) > 0
  )
  return hasEscolaridade && hasIdiomas
}

function hasSituacaoRequiredFields(
  values: CurriculoSituacaoFormValues,
  situacaoDescricao: string | undefined
): boolean {
  const hasSituacaoAtual = (values.idSituacao?.trim()?.length ?? 0) > 0
  if (!hasSituacaoAtual) return false

  const requiresJobSearchDuration = shouldShowJobSearchDuration(
    values.idSituacao,
    situacaoDescricao
      ? [{ id: values.idSituacao ?? '', descricao: situacaoDescricao }]
      : []
  )

  if (requiresJobSearchDuration) {
    return (values.tempoProcurandoEmprego?.trim()?.length ?? 0) > 0
  }

  return true
}

/** True se existe pelo menos um emprego completo ou uma conquista completa. */
function hasExperienciaRequiredFieldsFilled(
  values: CurriculoExperienciaFormValues
): boolean {
  const hasValidEmprego = values.empregos.some(
    e =>
      (e.cargo?.trim()?.length ?? 0) > 0 &&
      (e.empresa?.trim()?.length ?? 0) > 0 &&
      (e.descricaoAtividades?.trim()?.length ?? 0) > 0 &&
      e.tempoExperienciaMeses != null &&
      e.tempoExperienciaMeses >= 1 &&
      (e.experienciaComprovadaCarteira === 'Sim' ||
        e.experienciaComprovadaCarteira === 'Não')
  )
  const hasValidConquista = values.conquistas.some(
    c =>
      (c.idTipoConquista?.trim()?.length ?? 0) > 0 &&
      (c.titulo?.trim()?.length ?? 0) > 0 &&
      (c.descricao?.trim()?.length ?? 0) > 0
  )
  return hasValidEmprego || hasValidConquista
}

interface FormacaoAccordionContentProps {
  cpf?: string
  onCancel: () => void
  onSaveSuccess: (data: CurriculoFormacaoFormValues) => void
}

const defaultExperienciaValues: CurriculoExperienciaFormValues = {
  empregos: [
    {
      cargo: '',
      meuEmpregoAtual: false,
      empresa: '',
      descricaoAtividades: '',
      tempoExperienciaMeses: undefined,
      experienciaComprovadaCarteira: '',
    },
  ],
  conquistas: [{ idTipoConquista: '', titulo: '', descricao: '' }],
}

const FORMACAO_FIELD_NAMES = [
  'escolaridade',
  'formacaoAcademica',
  'idiomas',
] as const

function FormacaoAccordionContent({
  cpf,
  onCancel,
  onSaveSuccess,
}: FormacaoAccordionContentProps) {
  const { watch, register, control, formState, trigger, getValues, setFocus } =
    useFormContext<CurriculoFormacaoFormValues>()
  const { errors } = formState
  const escolaridade = watch('escolaridade')
  const hasSelection = Boolean(escolaridade)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'formacaoAcademica',
  })

  const handleFormacaoSave = async () => {
    const isValid = await trigger([...FORMACAO_FIELD_NAMES])
    if (!isValid) {
      toast.error('Por favor, revise todos os campos.')
      const firstErrorField = getFirstErrorField(errors)
      if (firstErrorField) {
        setFocus(firstErrorField as any)
      }
      return
    }

    if (!cpf?.trim()) {
      toast.error('CPF não disponível. Faça login novamente.')
      return
    }

    const values = getValues()
    const snapshot = getFormacaoSnapshot(values)
    const apiPayload = getFormacaoApiPayload(values)

    try {
      const result = await saveFormacaoAccordion(cpf, apiPayload)
      if (result.success) {
        toast.success('Formação salva com sucesso')
        onSaveSuccess(snapshot)
      } else {
        toast.error('Não foi possível salvar. Tente novamente.')
      }
    } catch {
      toast.error('Erro ao salvar formação. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      <Controller
        control={control}
        name="escolaridade"
        render={({ field }) => (
          <ActionDiv
            ref={field.ref}
            label="Escolaridade"
            isRequired
            content={
              hasSelection ? (
                formatEducation(escolaridade)
              ) : (
                <span className="text-foreground-light">
                  Selecione sua escolaridade
                </span>
              )
            }
            disabled
            variant="default"
            error={errors.escolaridade?.message}
            rightIcon={
              <ChevronDownIcon
                className={
                  hasSelection
                    ? 'text-primary stroke-[1.5] size-5'
                    : 'text-foreground-light stroke-[1.5] size-5'
                }
              />
            }
            drawerContent={<EscolaridadeDrawerContent />}
            drawerTitle="Escolaridade"
          />
        )}
      />

      <div className="space-y-4">
        <p className="text-sm font-normal text-primary">Formação</p>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl bg-card p-4 space-y-4 shadow-none"
          >
            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.formacaoAcademica?.[index]?.tipoFormacaoId
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Tipo de formação
              </span>
              <TipoFormacaoField
                index={index}
                error={
                  errors.formacaoAcademica?.[index]?.tipoFormacaoId?.message
                }
              />
              {!errors.formacaoAcademica?.[index]?.tipoFormacaoId && (
                <p className={HINT_CLASS}>
                  Escolha a opção que melhor descreve o tipo dessa formação
                </p>
              )}
            </div>
            <div className="space-y-2">
              <CustomInput
                {...register(`formacaoAcademica.${index}.nomeCurso`)}
                id={`formacao-academica-${index}-nome-curso`}
                label="Nome do Curso"
                placeholder="Preencha com o nome do curso"
                maxLength={50}
                error={errors.formacaoAcademica?.[index]?.nomeCurso?.message}
                className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background"
              />
              {!errors.formacaoAcademica?.[index]?.nomeCurso && (
                <p className={HINT_CLASS}>
                  Informe o nome do curso principal que você está cursando ou
                  concluiu
                </p>
              )}
            </div>
            <div className="space-y-2">
              <CustomInput
                {...register(`formacaoAcademica.${index}.nomeInstituicao`)}
                id={`formacao-academica-${index}-nome-instituicao`}
                label="Nome da Instituição"
                placeholder="Preencha com o nome da instituição"
                maxLength={50}
                error={
                  errors.formacaoAcademica?.[index]?.nomeInstituicao?.message
                }
                className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background"
              />
              {!errors.formacaoAcademica?.[index]?.nomeInstituicao && (
                <p className={HINT_CLASS}>
                  Escreva o nome da escola, faculdade ou curso onde você estudou
                  ou está estudando
                </p>
              )}
            </div>
            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.formacaoAcademica?.[index]?.status
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Status
              </span>
              <StatusFormacaoField
                index={index}
                error={errors.formacaoAcademica?.[index]?.status?.message}
              />
              {!errors.formacaoAcademica?.[index]?.status && (
                <p className={HINT_CLASS}>
                  Escolha a opção que melhor descreve sua situação nesse curso
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.formacaoAcademica?.[index]?.anoConclusao
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Ano de conclusão
              </span>
              <AnoConclusaoFormacaoField
                index={index}
                error={errors.formacaoAcademica?.[index]?.anoConclusao?.message}
              />
              {!errors.formacaoAcademica?.[index]?.anoConclusao && (
                <p className={HINT_CLASS}>
                  Informe qual o ano de conclusão do curso principal que você
                  concluiu, caso já tenha finalizado
                </p>
              )}
            </div>

            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex hover:cursor-pointer items-center gap-2 text-primary text-sm mt-2"
              >
                <Trash2 className="size-4" />
                Remover formação
              </button>
            )}
          </div>
        ))}

        <CustomButton
          type="button"
          variant="secondary"
          size="lg"
          className="w-full rounded-full bg-card text-primary"
          onClick={() =>
            append({
              tipoFormacaoId: '',
              nomeInstituicao: '',
              nomeCurso: '',
              status: '',
              anoConclusao: '',
            })
          }
        >
          Adicionar outra formação
        </CustomButton>
      </div>

      <div className="py-1">
        <Separator className="h-0.5 bg-border" />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-normal text-primary">
          Idiomas <span className="text-destructive">*</span>
        </p>
        <IdiomasFields />
      </div>

      <div className="py-1">
        <Separator className="h-0.5 bg-border" />
      </div>

      <div className="flex gap-3">
        <CustomButton
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1 rounded-full bg-card text-primary"
          onClick={onCancel}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className="flex-1 rounded-full"
          onClick={() => handleFormacaoSave()}
        >
          Salvar
        </CustomButton>
      </div>
    </div>
  )
}

function IdiomasFields() {
  const { control, formState } = useFormContext<CurriculoFormacaoFormValues>()
  const { errors } = formState
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'idiomas',
  })

  return (
    <>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-xl bg-card p-4 space-y-4 shadow-none"
        >
          <div className="space-y-2">
            <span
              className={cn(
                'text-sm font-normal block',
                errors.idiomas?.[index]?.idIdioma
                  ? 'text-destructive'
                  : 'text-primary'
              )}
            >
              Idioma
            </span>
            <IdiomaField
              index={index}
              error={errors.idiomas?.[index]?.idIdioma?.message}
            />
          </div>
          <div className="space-y-2">
            <span
              className={cn(
                'text-sm font-normal block',
                errors.idiomas?.[index]?.idNivel
                  ? 'text-destructive'
                  : 'text-primary'
              )}
            >
              Nível
            </span>
            <NivelIdiomaField
              index={index}
              error={errors.idiomas?.[index]?.idNivel?.message}
            />
          </div>

          {fields.length > 1 && (
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex hover:cursor-pointer items-center gap-2 text-primary text-sm mt-2"
            >
              <Trash2 className="size-4" />
              Remover idioma
            </button>
          )}
        </div>
      ))}

      <CustomButton
        type="button"
        variant="secondary"
        size="lg"
        className="w-full rounded-full bg-card text-primary"
        onClick={() => append({ idIdioma: '', idNivel: '' })}
      >
        Adicionar outro idioma
      </CustomButton>
    </>
  )
}

function IdiomaField({ index, error }: { index: number; error?: string }) {
  const { watch, control } = useFormContext<CurriculoFormacaoFormValues>()
  const { idiomas: idiomasList } = useFormacaoApi()
  const idIdioma = watch(`idiomas.${index}.idIdioma`) ?? ''
  const displayLabel = idiomasList.find(i => i.id === idIdioma)?.descricao ?? ''
  const hasSelection = Boolean(idIdioma)

  return (
    <Controller
      control={control}
      name={`idiomas.${index}.idIdioma`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              displayLabel
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Selecione o idioma
              </span>
            )
          }
          variant="default"
          disabled
          rightIcon={
            <ChevronDownIcon
              className={
                hasSelection
                  ? 'text-primary stroke-[1.5] size-5'
                  : 'text-foreground-light stroke-[1.5] size-5'
              }
            />
          }
          drawerContent={<IdiomaDrawerContent fieldIndex={index} />}
          drawerTitle="Idioma"
        />
      )}
    />
  )
}

function NivelIdiomaField({ index, error }: { index: number; error?: string }) {
  const { watch, control } = useFormContext<CurriculoFormacaoFormValues>()
  const { niveisIdioma } = useFormacaoApi()
  const idNivel = watch(`idiomas.${index}.idNivel`) ?? ''
  const displayLabel = niveisIdioma.find(n => n.id === idNivel)?.descricao ?? ''
  const hasSelection = Boolean(idNivel)

  return (
    <Controller
      control={control}
      name={`idiomas.${index}.idNivel`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              displayLabel
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Selecione o nível
              </span>
            )
          }
          variant="default"
          disabled
          rightIcon={
            <ChevronDownIcon
              className={
                hasSelection
                  ? 'text-primary stroke-[1.5] size-5'
                  : 'text-foreground-light stroke-[1.5] size-5'
              }
            />
          }
          drawerContent={<NivelIdiomaDrawerContent fieldIndex={index} />}
          drawerTitle="Nível"
        />
      )}
    />
  )
}

function TipoFormacaoField({
  index,
  error,
}: {
  index: number
  error?: string
}) {
  const { watch, control } = useFormContext<CurriculoFormacaoFormValues>()
  const { escolaridades } = useFormacaoApi()
  const tipoFormacaoId =
    watch(`formacaoAcademica.${index}.tipoFormacaoId`) ?? ''
  const displayLabel =
    escolaridades.find(e => e.id === tipoFormacaoId)?.descricao ?? ''
  const hasSelection = Boolean(tipoFormacaoId)

  return (
    <Controller
      control={control}
      name={`formacaoAcademica.${index}.tipoFormacaoId`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              displayLabel
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Selecione o tipo da formação
              </span>
            )
          }
          variant="default"
          disabled
          rightIcon={
            <ChevronDownIcon
              className={
                hasSelection
                  ? 'text-primary stroke-[1.5] size-5'
                  : 'text-foreground-light stroke-[1.5] size-5'
              }
            />
          }
          drawerContent={<TipoFormacaoDrawerContent fieldIndex={index} />}
          drawerTitle="Tipo de formação"
        />
      )}
    />
  )
}

function StatusFormacaoField({
  index,
  error,
}: {
  index: number
  error?: string
}) {
  const { watch, control } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`formacaoAcademica.${index}.status`) ?? ''
  const hasSelection = Boolean(value)

  return (
    <Controller
      control={control}
      name={`formacaoAcademica.${index}.status`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              value
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Selecione o status da formação
              </span>
            )
          }
          variant="default"
          disabled
          rightIcon={
            <ChevronDownIcon
              className={
                hasSelection
                  ? 'text-primary stroke-[1.5] size-5'
                  : 'text-foreground-light stroke-[1.5] size-5'
              }
            />
          }
          drawerContent={<StatusFormacaoDrawerContent fieldIndex={index} />}
          drawerTitle="Status"
        />
      )}
    />
  )
}

function AnoConclusaoFormacaoField({
  index,
  error,
}: {
  index: number
  error?: string
}) {
  const { watch, control } = useFormContext<CurriculoFormacaoFormValues>()
  const value = watch(`formacaoAcademica.${index}.anoConclusao`) ?? ''
  const hasSelection = Boolean(value)

  return (
    <Controller
      control={control}
      name={`formacaoAcademica.${index}.anoConclusao`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              value
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Informe o ano de conclusão
              </span>
            )
          }
          variant="default"
          disabled
          rightIcon={
            <ChevronDownIcon
              className={
                hasSelection
                  ? 'text-primary stroke-[1.5] size-5'
                  : 'text-foreground-light stroke-[1.5] size-5'
              }
            />
          }
          drawerContent={<AnoConclusaoDrawerContent fieldIndex={index} />}
          drawerTitle="Ano de conclusão"
        />
      )}
    />
  )
}

function getFormacaoSnapshot(
  values: CurriculoFormacaoFormValues
): Pick<
  CurriculoFormacaoFormValues,
  'escolaridade' | 'formacaoAcademica' | 'idiomas'
> {
  return structuredClone({
    escolaridade: values.escolaridade,
    formacaoAcademica: values.formacaoAcademica,
    idiomas: values.idiomas,
  })
}

/** Payload do accordion Formação (sem escolaridade — vem de Informações Pessoais). */
function getFormacaoPayload(
  values: CurriculoFormacaoFormValues
): Omit<CurriculoFormacaoFormValues, 'escolaridade'> {
  return structuredClone({
    formacaoAcademica: values.formacaoAcademica,
    idiomas: values.idiomas,
  })
}

/** Payload para a API PUT formacoes/idiomas (id_escolaridade, id_idioma, id_nivel). */
function getFormacaoApiPayload(
  values: CurriculoFormacaoFormValues
): EmpregabilidadeFormacaoAccordionRequest {
  const formacoes = (values.formacaoAcademica ?? [])
    .filter(
      f =>
        (f.tipoFormacaoId?.trim()?.length ?? 0) > 0 &&
        (f.nomeCurso?.trim()?.length ?? 0) > 0 &&
        (f.status?.trim()?.length ?? 0) > 0 &&
        (f.anoConclusao?.trim()?.length ?? 0) > 0
    )
    .map(f => ({
      id_escolaridade: f.tipoFormacaoId!.trim(),
      nome_curso: f.nomeCurso!.trim(),
      nome_instituicao: f.nomeInstituicao?.trim() || undefined,
      status: f.status!.trim() as 'Completo' | 'Em andamento' | 'Incompleto',
      ano_conclusao: f.anoConclusao!.trim(),
    }))

  const idiomas = (values.idiomas ?? [])
    .filter(
      i =>
        (i.idIdioma?.trim()?.length ?? 0) > 0 &&
        (i.idNivel?.trim()?.length ?? 0) > 0
    )
    .map(i => ({
      id_idioma: i.idIdioma!.trim(),
      id_nivel: i.idNivel!.trim(),
    }))

  return { formacoes, idiomas }
}

function getSituacaoSnapshot(
  values: CurriculoSituacaoFormValues
): CurriculoSituacaoFormValues {
  return structuredClone({
    idSituacao: values.idSituacao,
    tempoProcurandoEmprego: values.tempoProcurandoEmprego,
    idDisponibilidade: values.idDisponibilidade,
    idsTiposVinculo: values.idsTiposVinculo,
    situacaoDescricao: values.situacaoDescricao,
  })
}

const SITUACAO_FIELD_NAMES = [
  'idSituacao',
  'tempoProcurandoEmprego',
  'idDisponibilidade',
  'idsTiposVinculo',
  'situacaoDescricao',
] as const

const DEFAULT_SITUACAO_OPTIONS: SituacaoOptions = {
  situacoesAtual: [],
  disponibilidades: [],
  regimesContratacao: [],
}

interface SituacaoAtualAccordionContentProps {
  cpf?: string
  onCancel: () => void
  onSaveSuccess: (data: CurriculoSituacaoFormValues) => void
}

function SituacaoAtualAccordionContent({
  cpf,
  onCancel,
  onSaveSuccess,
}: SituacaoAtualAccordionContentProps) {
  const { watch, control, formState, trigger, getValues, setFocus, setValue } =
    useFormContext<CurriculoSituacaoFormValues>()
  const { errors } = formState
  const { situacoesAtual, disponibilidades, regimesContratacao } =
    useSituacaoApi()

  const idSituacao = watch('idSituacao')
  const tempoProcurandoEmprego = watch('tempoProcurandoEmprego')
  const idDisponibilidade = watch('idDisponibilidade')
  const idsTiposVinculo = watch('idsTiposVinculo')

  const situacaoLabel =
    situacoesAtual.find(s => s.id === idSituacao)?.descricao ?? ''

  // Determine if job search duration field should be shown
  const showJobSearchDuration = shouldShowJobSearchDuration(
    idSituacao,
    situacoesAtual
  )

  // Sync situacaoDescricao for conditional validation in schema
  useEffect(() => {
    setValue('situacaoDescricao', situacaoLabel, { shouldValidate: false })
  }, [situacaoLabel, setValue])

  // Reset job search duration when switching to a non-unemployed status
  useEffect(() => {
    if (!showJobSearchDuration && tempoProcurandoEmprego) {
      setValue('tempoProcurandoEmprego', '', { shouldValidate: false })
    }
  }, [showJobSearchDuration, tempoProcurandoEmprego, setValue])

  const tempoLabel =
    (tempoProcurandoEmprego &&
      TEMPO_PROCURANDO_EMPREGO_CODE_TO_LABEL[
        tempoProcurandoEmprego as keyof typeof TEMPO_PROCURANDO_EMPREGO_CODE_TO_LABEL
      ]) ??
    ''
  const disponibilidadeLabel =
    disponibilidades.find(d => d.id === idDisponibilidade)?.descricao ?? ''
  const tiposVinculoLabels = (idsTiposVinculo ?? [])
    .map(id => regimesContratacao.find(r => r.id === id)?.descricao)
    .filter(Boolean) as string[]

  const hasSituacaoAtualSelection = Boolean(idSituacao)
  const hasTempoSelection = Boolean(tempoProcurandoEmprego)
  const hasDisponibilidadeSelection = Boolean(idDisponibilidade)
  const hasTipoVinculoSelection = Boolean(
    idsTiposVinculo && idsTiposVinculo.length > 0
  )

  const handleSituacaoSave = async () => {
    const isValid = await trigger([...SITUACAO_FIELD_NAMES])
    if (!isValid) {
      toast.error('Por favor, revise todos os campos.')
      const firstErrorField = getFirstErrorField(errors)
      if (firstErrorField) setFocus(firstErrorField as any)
      return
    }
    if (!cpf?.trim()) {
      toast.error('CPF não disponível. Faça login novamente.')
      return
    }
    const data = getSituacaoSnapshot(getValues())
    try {
      const result = await saveSituacaoAction(cpf, data)
      if (result.success) {
        toast.success('Situação atual salva com sucesso')
        onSaveSuccess(data)
      } else {
        toast.error('Não foi possível salvar. Tente novamente.')
      }
    } catch {
      toast.error('Erro ao salvar situação. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Controller
          control={control}
          name="idSituacao"
          render={({ field }) => (
            <ActionDiv
              ref={field.ref}
              label="Encontra-se"
              isRequired
              content={
                hasSituacaoAtualSelection ? (
                  situacaoLabel
                ) : (
                  <span className="text-foreground-light">Selecionar</span>
                )
              }
              disabled
              variant="default"
              error={errors.idSituacao?.message}
              rightIcon={
                <ChevronDownIcon
                  className={
                    hasSituacaoAtualSelection
                      ? 'text-primary stroke-[1.5] size-5'
                      : 'text-foreground-light stroke-[1.5] size-5'
                  }
                />
              }
              drawerContent={<SituacaoAtualDrawerContent />}
              drawerTitle="Encontra-se"
            />
          )}
        />
        {!errors.idSituacao && (
          <p className={HINT_CLASS}>
            Informe sua situação atual no mercado de trabalho
          </p>
        )}
      </div>

      {showJobSearchDuration && (
        <div className="space-y-2">
          <Controller
            control={control}
            name="tempoProcurandoEmprego"
            render={({ field }) => (
              <ActionDiv
                ref={field.ref}
                label="Há quanto tempo procurando emprego?"
                isRequired
                content={
                  hasTempoSelection ? (
                    tempoLabel
                  ) : (
                    <span className="text-foreground-light">Selecionar</span>
                  )
                }
                disabled
                variant="default"
                error={errors.tempoProcurandoEmprego?.message}
                rightIcon={
                  <ChevronDownIcon
                    className={
                      hasTempoSelection
                        ? 'text-primary stroke-[1.5] size-5'
                        : 'text-foreground-light stroke-[1.5] size-5'
                    }
                  />
                }
                drawerContent={<TempoProcurandoEmpregoDrawerContent />}
                drawerTitle="Há quanto tempo procurando emprego?"
              />
            )}
          />
        </div>
      )}

      <div className="space-y-2">
        <Controller
          control={control}
          name="idDisponibilidade"
          render={({ field }) => (
            <ActionDiv
              ref={field.ref}
              label="Disponibilidade"
              content={
                hasDisponibilidadeSelection ? (
                  disponibilidadeLabel
                ) : (
                  <span className="text-foreground-light">Selecionar</span>
                )
              }
              disabled
              variant="default"
              error={errors.idDisponibilidade?.message}
              rightIcon={
                <ChevronDownIcon
                  className={
                    hasDisponibilidadeSelection
                      ? 'text-primary stroke-[1.5] size-5'
                      : 'text-foreground-light stroke-[1.5] size-5'
                  }
                />
              }
              drawerContent={<DisponibilidadeDrawerContent />}
              drawerTitle="Disponibilidade"
            />
          )}
        />
        {!errors.idDisponibilidade && (
          <p className={HINT_CLASS}>
            Selecione a partir de quando você pode começar a trabalhar
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Controller
          control={control}
          name="idsTiposVinculo"
          render={({ field }) => (
            <ActionDiv
              ref={field.ref}
              label="Tipo de vínculo desejado"
              content={
                hasTipoVinculoSelection ? (
                  <span className="line-clamp-2">
                    {tiposVinculoLabels.join(', ')}
                  </span>
                ) : (
                  <span className="text-foreground-light">Selecionar</span>
                )
              }
              disabled
              variant="default"
              error={errors.idsTiposVinculo?.message}
              rightIcon={
                <ChevronDownIcon
                  className={
                    hasTipoVinculoSelection
                      ? 'text-primary stroke-[1.5] size-5'
                      : 'text-foreground-light stroke-[1.5] size-5'
                  }
                />
              }
              drawerContent={<TipoVinculoDrawerContent />}
              drawerTitle="Tipo de vínculo desejado"
            />
          )}
        />
      </div>

      <div className="flex gap-3">
        <CustomButton
          type="button"
          variant="secondary"
          size="lg"
          className="flex-1 rounded-full bg-card text-primary"
          onClick={onCancel}
        >
          Cancelar
        </CustomButton>
        <CustomButton
          type="button"
          variant="primary"
          size="lg"
          className="flex-1 rounded-full"
          onClick={handleSituacaoSave}
        >
          Salvar
        </CustomButton>
      </div>
    </div>
  )
}

const defaultSituacaoValues: CurriculoSituacaoFormValues = {
  idSituacao: '',
  tempoProcurandoEmprego: '',
  idDisponibilidade: '',
  idsTiposVinculo: [],
  situacaoDescricao: '',
}

const DEFAULT_FORMACAO_OPTIONS: FormacaoOptions = {
  escolaridades: [],
  idiomas: [],
  niveisIdioma: [],
}

export interface CurriculoContentProps {
  /** Quando definido, exibe o botão Continuar e redireciona para o fluxo de inscrição. */
  inscricaoVagaId?: string
  /** Rota do header "voltar". Usado no fluxo de inscrição (ex: página da vaga). */
  backRoute?: string
  /** Se a vaga tem perguntas adicionais; quando true, Continuar leva para perguntas-adicionais, senão abre bottom sheet com confetti. */
  hasPerguntasAdicionais?: boolean
  /** Escolaridade vinda de Informações Pessoais (fonte única de verdade). */
  initialEscolaridade?: string
  /** CPF do usuário logado; necessário para salvar formação/idiomas na API. */
  cpf?: string
  /** Opções de formação/idiomas/níveis carregadas no server (evita usar next/headers no client). */
  formacaoOptions?: FormacaoOptions
  /** Formações já salvas do currículo (preenche o formulário). */
  initialFormacoes?: InitialFormacaoItem[]
  /** Idiomas já salvos do currículo (preenche o formulário). */
  initialIdiomas?: InitialIdiomaItem[]
  /** Opções de situação atual (Encontra-se, Disponibilidade, Tipo vínculo) carregadas no server. */
  situacaoOptions?: SituacaoOptions
  /** Situação e interesses já salvos (preenche o accordion Situação atual). */
  initialSituacao?: InitialSituacaoData
  /** Opções de tipos de conquista carregadas no server (Conquistas ou certificados). */
  experienciaOptions?: ExperienciaOptions
  /** Experiências e conquistas já salvos (preenche o accordion Experiência Profissional). */
  initialExperiencia?: CurriculoExperienciaFormValues
  /** Se o usuário já aceitou os termos de uso (preenche o checkbox). */
  initialTermosAceitos?: boolean
  /** Quando em fluxo único (carousel), chamado ao clicar Continuar em vez de router.push para perguntas. */
  onContinuarToNext?: () => void
  /** Quando em fluxo único (carousel), chamado ao fechar o drawer de sucesso em vez de router.push. */
  onSuccessClose?: () => void
  /** Server action para enviar candidatura (cenário sem perguntas adicionais). */
  onEnviarCandidatura?: (
    vagaId: string
  ) => Promise<{ success: boolean; error?: string }>
}

export function CurriculoContent({
  inscricaoVagaId,
  backRoute = '/servicos/empregos',
  hasPerguntasAdicionais = false,
  initialEscolaridade = '',
  cpf,
  formacaoOptions = DEFAULT_FORMACAO_OPTIONS,
  initialFormacoes,
  initialIdiomas,
  situacaoOptions = DEFAULT_SITUACAO_OPTIONS,
  initialSituacao,
  experienciaOptions = { tiposConquista: [] },
  initialExperiencia,
  initialTermosAceitos,
  onContinuarToNext,
  onSuccessClose,
  onEnviarCandidatura,
}: CurriculoContentProps = {}) {
  const [accordionValue, setAccordionValue] = useState<string>('')
  const [successSheetOpen, setSuccessSheetOpen] = useState(false)
  const [isEnviandoCandidatura, setIsEnviandoCandidatura] = useState(false)
  const router = useRouter()
  const formacaoSnapshotRef = useRef<Pick<
    CurriculoFormacaoFormValues,
    'escolaridade' | 'formacaoAcademica' | 'idiomas'
  > | null>(null)
  const experienciaSnapshotRef = useRef<CurriculoExperienciaFormValues | null>(
    null
  )
  const situacaoSnapshotRef = useRef<CurriculoSituacaoFormValues | null>(null)

  const defaultFormacaoAcademica =
    (initialFormacoes?.length ?? 0) > 0
      ? (initialFormacoes ?? []).map(f => ({
          tipoFormacaoId: f.tipoFormacaoId ?? '',
          nomeInstituicao: f.nomeInstituicao ?? '',
          nomeCurso: f.nomeCurso ?? '',
          status: f.status ?? '',
          anoConclusao: f.anoConclusao ?? '',
        }))
      : [
          {
            tipoFormacaoId: '',
            nomeInstituicao: '',
            nomeCurso: '',
            status: '',
            anoConclusao: '',
          },
        ]

  const defaultIdiomas =
    (initialIdiomas?.length ?? 0) > 0
      ? (initialIdiomas ?? []).map(i => ({
          idIdioma: i.idIdioma ?? '',
          idNivel: i.idNivel ?? '',
        }))
      : [{ idIdioma: '', idNivel: '' }]

  const defaultSituacaoFormValues: CurriculoSituacaoFormValues =
    initialSituacao &&
    (initialSituacao.idSituacao?.trim() ||
      initialSituacao.tempoProcurandoEmprego?.trim())
      ? {
          idSituacao: initialSituacao.idSituacao ?? '',
          tempoProcurandoEmprego: initialSituacao.tempoProcurandoEmprego ?? '',
          idDisponibilidade: initialSituacao.idDisponibilidade ?? '',
          idsTiposVinculo: initialSituacao.idsTiposVinculo ?? [],
          situacaoDescricao: initialSituacao.situacaoDescricao ?? '',
        }
      : defaultSituacaoValues

  const form = useForm<CurriculoFormValues>({
    resolver: zodResolver(curriculoSchema),
    mode: 'all',
    defaultValues: {
      escolaridade: initialEscolaridade ?? '',
      formacaoAcademica: defaultFormacaoAcademica,
      idiomas: defaultIdiomas,
      empregos:
        (initialExperiencia?.empregos?.length ?? 0) > 0
          ? initialExperiencia!.empregos
          : defaultExperienciaValues.empregos,
      conquistas:
        (initialExperiencia?.conquistas?.length ?? 0) > 0
          ? initialExperiencia!.conquistas
          : defaultExperienciaValues.conquistas,
      ...defaultSituacaoFormValues,
      termosAceitos: initialTermosAceitos ?? false,
    },
  })

  const { errors } = form.formState
  const formValues = form.watch()
  const hasFormacaoErrors = hasFormacaoValidationErrors(
    errors as Record<string, unknown>
  )
  const hasExperienciaErrors = hasExperienciaValidationErrors(
    errors as Record<string, unknown>
  )
  const hasSituacaoErrors = hasSituacaoValidationErrors(
    errors as Record<string, unknown>
  )
  const hasTermosErrors = hasTermosValidationErrors(
    errors as Record<string, unknown>
  )
  const requiredFieldsFilled = hasFormacaoRequiredFields(formValues)
  const situacaoRequiredFieldsFilled = hasSituacaoRequiredFields(
    formValues as CurriculoSituacaoFormValues,
    (formValues as CurriculoSituacaoFormValues).situacaoDescricao
  )
  const experienciaRequiredFieldsFilled =
    hasExperienciaRequiredFieldsFilled(formValues)
  const termosAceitos = form.watch('termosAceitos')

  const handleAccordionValueChange = (value: string) => {
    if (value === 'formacao') {
      formacaoSnapshotRef.current = getFormacaoSnapshot(form.getValues())
    }
    if (value === 'experiencia') {
      experienciaSnapshotRef.current = getExperienciaSnapshot(form.getValues())
    }
    if (value === 'situacao') {
      situacaoSnapshotRef.current = getSituacaoSnapshot(form.getValues())
    }
    setAccordionValue(value)
  }

  const handleFormacaoCancel = () => {
    const snapshot = formacaoSnapshotRef.current
    const valuesToRestore: CurriculoFormacaoFormValues = snapshot ?? {
      escolaridade: initialEscolaridade ?? '',
      formacaoAcademica: defaultFormacaoAcademica,
      idiomas: defaultIdiomas,
    }
    const currentFormValues = form.getValues()
    form.reset(
      {
        ...currentFormValues,
        escolaridade: valuesToRestore.escolaridade,
        formacaoAcademica: valuesToRestore.formacaoAcademica,
        idiomas: valuesToRestore.idiomas,
      },
      { keepDefaultValues: false }
    )
    form.clearErrors()
    setAccordionValue('')
  }

  const handleFormacaoSaveSuccess = (data: CurriculoFormacaoFormValues) => {
    formacaoSnapshotRef.current = getFormacaoSnapshot(data)
    setAccordionValue('')
  }

  const handleExperienciaCancel = () => {
    const snapshot = experienciaSnapshotRef.current
    const valuesToRestore: CurriculoExperienciaFormValues =
      snapshot ?? defaultExperienciaValues
    const currentFormValues = form.getValues()
    form.reset(
      {
        ...currentFormValues,
        empregos: valuesToRestore.empregos,
        conquistas: valuesToRestore.conquistas,
      },
      { keepDefaultValues: false }
    )
    form.clearErrors()
    setAccordionValue('')
  }

  const handleExperienciaSaveSuccess = (
    data: CurriculoExperienciaFormValues
  ) => {
    experienciaSnapshotRef.current = getExperienciaSnapshot(data)
    setAccordionValue('')
  }

  const handleSituacaoCancel = () => {
    const snapshot = situacaoSnapshotRef.current
    const valuesToRestore: CurriculoSituacaoFormValues =
      snapshot ?? defaultSituacaoFormValues
    const currentFormValues = form.getValues()
    form.reset(
      {
        ...currentFormValues,
        idSituacao: valuesToRestore.idSituacao,
        tempoProcurandoEmprego: valuesToRestore.tempoProcurandoEmprego,
        idDisponibilidade: valuesToRestore.idDisponibilidade,
        idsTiposVinculo: valuesToRestore.idsTiposVinculo,
        situacaoDescricao: valuesToRestore.situacaoDescricao,
      },
      { keepDefaultValues: false }
    )
    form.clearErrors()
    setAccordionValue('')
  }

  const handleSituacaoSaveSuccess = (data: CurriculoSituacaoFormValues) => {
    situacaoSnapshotRef.current = getSituacaoSnapshot(data)
    setAccordionValue('')
  }

  const handleContinuar = () => {
    form.handleSubmit(
      async () => {
        if (!inscricaoVagaId) return
        if (hasPerguntasAdicionais) {
          if (onContinuarToNext) {
            onContinuarToNext()
          } else {
            router.push(
              `/servicos/empregos/${inscricaoVagaId}/inscricao/confirmar-informacoes/perguntas-adicionais`
            )
          }
          return
        }
        if (!onEnviarCandidatura) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.7 },
          })
          setSuccessSheetOpen(true)
          return
        }
        setIsEnviandoCandidatura(true)
        try {
          const result = await onEnviarCandidatura(inscricaoVagaId)
          if (result.success) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.7 },
            })
            setSuccessSheetOpen(true)
          } else {
            toast.error(
              result.error ?? 'Não foi possível enviar a candidatura.'
            )
          }
        } catch {
          toast.error('Erro ao enviar candidatura. Tente novamente.')
        } finally {
          setIsEnviandoCandidatura(false)
        }
      },
      errors => {
        console.log('Erros:', errors)
        toast.error('Por favor, revise todos os campos.')
      }
    )()
  }

  const handleSuccessSheetOpenChange = (open: boolean) => {
    setSuccessSheetOpen(open)
    if (!open) {
      if (onSuccessClose) {
        onSuccessClose()
      } else {
        router.push('/servicos/empregos')
      }
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route={backRoute}
        />
      </div>

      <FormacaoApiProvider initialData={formacaoOptions}>
        <SituacaoApiProvider initialData={situacaoOptions}>
          <ExperienciaApiProvider initialData={experienciaOptions}>
            <FormProvider {...form}>
              <div className="px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-120px)] overflow-x-hidden">
                <h1 className="text-3xl font-medium text-foreground leading-9 tracking-tight pt-2 pb-6">
                  Meu Currículo
                </h1>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={accordionValue}
                  onValueChange={handleAccordionValueChange}
                >
                  <AccordionItem
                    value="formacao"
                    className="border-b border-border py-5 last:border-b-0"
                  >
                    <AccordionTrigger
                      chevronClassName="text-primary stroke-[1.5]"
                      className="py-0 text-left text-base font-medium leading-5 text-foreground hover:no-underline data-[state=open]:border-b-0"
                    >
                      <span className="flex items-center gap-2.5">
                        Formação
                        {hasFormacaoErrors ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
                            <X className="size-3.5 text-white stroke-3" />
                          </span>
                        ) : (
                          requiredFieldsFilled && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wallet-2b">
                              <Check className="size-3.5 text-white stroke-3" />
                            </span>
                          )
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-5 pb-4">
                      <FormacaoAccordionContent
                        cpf={cpf}
                        onCancel={handleFormacaoCancel}
                        onSaveSuccess={handleFormacaoSaveSuccess}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="experiencia"
                    className="border-b border-border py-5 last:border-b-0"
                  >
                    <AccordionTrigger
                      chevronClassName="text-primary stroke-[1.5]"
                      className="py-0 text-left text-base font-medium leading-5 text-foreground hover:no-underline data-[state=open]:border-b-0"
                    >
                      <span className="flex items-center gap-2.5">
                        Experiência Profissional
                        {hasExperienciaErrors ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
                            <X className="size-3.5 text-white stroke-3" />
                          </span>
                        ) : (
                          experienciaRequiredFieldsFilled && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wallet-2b">
                              <Check className="size-3.5 text-white stroke-3" />
                            </span>
                          )
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-5 pb-4">
                      <ExperienciaProfissionalAccordionContent
                        cpf={cpf ?? ''}
                        onCancel={handleExperienciaCancel}
                        onSaveSuccess={handleExperienciaSaveSuccess}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="situacao"
                    className="border-b border-border py-5 last:border-b-0"
                  >
                    <AccordionTrigger
                      chevronClassName="text-primary stroke-[1.5]"
                      className="py-0 text-left text-base font-medium leading-5 text-foreground hover:no-underline data-[state=open]:border-b-0"
                    >
                      <span className="flex items-center gap-2.5">
                        Situação atual
                        {hasSituacaoErrors ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
                            <X className="size-3.5 text-white stroke-3" />
                          </span>
                        ) : (
                          situacaoRequiredFieldsFilled && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wallet-2b">
                              <Check className="size-3.5 text-white stroke-3" />
                            </span>
                          )
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-5 pb-4">
                      <SituacaoAtualAccordionContent
                        cpf={cpf}
                        onCancel={handleSituacaoCancel}
                        onSaveSuccess={handleSituacaoSaveSuccess}
                      />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem
                    value="termos"
                    className="border-b border-border py-5 last:border-b-0"
                  >
                    <AccordionTrigger
                      chevronClassName="text-primary stroke-[1.5]"
                      className="py-0 text-left text-base font-medium leading-5 text-foreground hover:no-underline data-[state=open]:border-b-0"
                    >
                      <span className="flex items-center gap-2.5">
                        Termos de Uso
                        {hasTermosErrors ? (
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive">
                            <X className="size-3.5 text-white stroke-3" />
                          </span>
                        ) : (
                          termosAceitos && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-wallet-2b">
                              <Check className="size-3.5 text-white stroke-3" />
                            </span>
                          )
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-5 pb-4">
                      <TermosUsoAccordionContent cpf={cpf} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {inscricaoVagaId ? (
                  <div className="mt-auto pt-8 pb-8 shrink-0">
                    <CustomButton
                      size="lg"
                      fullWidth
                      variant="primary"
                      onClick={handleContinuar}
                      className="rounded-full"
                      disabled={isEnviandoCandidatura}
                    >
                      {isEnviandoCandidatura ? 'Enviando...' : 'Continuar'}
                    </CustomButton>
                  </div>
                ) : null}
              </div>
            </FormProvider>
          </ExperienciaApiProvider>
        </SituacaoApiProvider>
      </FormacaoApiProvider>

      <CandidaturaEnviadaDrawer
        open={successSheetOpen}
        onOpenChange={handleSuccessSheetOpenChange}
        dismissible
      />
    </>
  )
}
