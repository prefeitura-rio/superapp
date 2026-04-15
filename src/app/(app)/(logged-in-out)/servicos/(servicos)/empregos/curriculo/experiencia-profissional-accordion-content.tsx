'use client'

import { ActionDiv } from '@/app/components/action-div'
import { Checkbox } from '@/components/ui/checkbox'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, Trash2 } from 'lucide-react'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'
import { curriculoExperienciaSchema } from './curriculo-experiencia-schema'
import type { CurriculoExperienciaFormValues } from './curriculo-experiencia-schema'
import { useExperienciaApi } from './experiencia-api-context'
import { ExperienciaComprovadaDrawerContent } from './experiencia-comprovada-drawer-content'
import { useFormDirtyState } from './hooks/use-form-dirty-state'
import { saveExperienciaAction } from './save-experiencia-action'
import { TipoConquistaDrawerContent } from './tipo-conquista-drawer-content'
import {
  isConquistaComplete,
  isConquistaEmpty,
  isEmpregoComplete,
  isEmpregoEmpty,
} from './utils/item-validators'

const HINT_CLASS = 'text-muted-foreground text-sm leading-5 font-normal mt-1'

const EXPERIENCIA_ERROR_PATHS = ['empregos', 'conquistas'] as const
const EXPERIENCIA_FIELD_NAMES = ['empregos', 'conquistas'] as const

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

function hasExperienciaValidationErrors(
  errors: Record<string, unknown>
): boolean {
  return EXPERIENCIA_ERROR_PATHS.some(path => hasNestedErrors(errors[path]))
}

function getFirstErrorField(errors: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue

    // Se é um erro direto (tem message)
    if (typeof value === 'object' && 'message' in value) {
      return key
    }

    // Se é um array (como empregos ou conquistas)
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

/** True if at least one complete emprego OR one complete conquista exists. */
function hasExperienciaRequiredFieldsFilled(
  values: CurriculoExperienciaFormValues
): boolean {
  const hasValidEmprego = values.empregos.some(
    e =>
      (e.cargo?.trim()?.length ?? 0) > 0 &&
      (e.empresa?.trim()?.length ?? 0) > 0 &&
      (e.descricaoAtividades?.trim()?.length ?? 0) > 0 &&
      (e.tempoExperienciaAnos ?? 0) * 12 + (e.tempoExperienciaMeses ?? 0) >=
        1 &&
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

interface ExperienciaProfissionalAccordionContentProps {
  cpf: string
  onCancel: () => void
  onSaveSuccess: (data: CurriculoExperienciaFormValues) => void
  snapshot: CurriculoExperienciaFormValues | null
}

function ExperienciaProfissionalAccordionContentInner({
  cpf,
  onCancel,
  onSaveSuccess,
  snapshot,
}: ExperienciaProfissionalAccordionContentProps) {
  const { watch, register, control, formState, trigger, getValues, setFocus } =
    useFormContext<CurriculoExperienciaFormValues>()
  const { errors } = formState
  const formValues = watch()

  const { canSave } = useFormDirtyState({
    currentValues: formValues,
    snapshot,
    getSnapshot: getExperienciaSnapshot,
    hasRequiredFields: hasExperienciaRequiredFieldsFilled,
    arrayFields: [
      {
        fieldPath: 'empregos',
        isItemComplete: isEmpregoComplete,
        isItemEmpty: isEmpregoEmpty,
      },
      {
        fieldPath: 'conquistas',
        isItemComplete: isConquistaComplete,
        isItemEmpty: isConquistaEmpty,
      },
    ],
  })
  const {
    fields: empregosFields,
    append: appendEmprego,
    remove: removeEmprego,
  } = useFieldArray({
    control,
    name: 'empregos',
  })
  const {
    fields: conquistasFields,
    append: appendConquista,
    remove: removeConquista,
  } = useFieldArray({
    control,
    name: 'conquistas',
  })

  const handleExperienciaSave = async () => {
    // Always trigger validation to show errors
    const isValid = await trigger([...EXPERIENCIA_FIELD_NAMES])

    // If canSave is false, just show validation errors but don't proceed
    if (!canSave) {
      if (!isValid) {
        toast.error('Por favor, revise todos os campos.')
        const firstErrorField = getFirstErrorField(errors)
        if (firstErrorField) {
          setFocus(firstErrorField as Parameters<typeof setFocus>[0])
        }
      }
      return
    }

    if (!isValid) {
      toast.error('Por favor, revise todos os campos.')
      const firstErrorField = getFirstErrorField(errors)
      if (firstErrorField) {
        setFocus(firstErrorField as Parameters<typeof setFocus>[0])
      }
      return
    }
    const data = getExperienciaSnapshot(getValues())
    const result = await saveExperienciaAction(cpf, data)
    if (result.success) {
      toast.success('Experiência profissional salva com sucesso')
      onSaveSuccess(data)
    } else {
      toast.error(result.error ?? 'Erro ao salvar. Tente novamente.')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-normal text-primary">Empregos</p>
      <div className="space-y-4">
        {empregosFields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl bg-card p-4 space-y-4 shadow-none"
          >
            <div className="space-y-2">
              <CustomInput
                {...register(`empregos.${index}.cargo`)}
                id={`emprego-${index}-cargo`}
                label="Cargo"
                placeholder="Nome do cargo"
                maxLength={50}
                error={errors.empregos?.[index]?.cargo?.message}
                className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background"
              />
              {!errors.empregos?.[index]?.cargo && (
                <p className={HINT_CLASS}>Favor não abreviar o nome do cargo</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Controller
                  control={control}
                  name={`empregos.${index}.meuEmpregoAtual`}
                  render={({ field: checkboxField }) => (
                    <Checkbox
                      id={`emprego-${index}-meu-emprego-atual`}
                      checked={checkboxField.value ?? false}
                      onCheckedChange={checkboxField.onChange}
                    />
                  )}
                />
                <label
                  htmlFor={`emprego-${index}-meu-emprego-atual`}
                  className="text-sm font-normal text-primary cursor-pointer"
                >
                  Meu emprego atual
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <CustomInput
                {...register(`empregos.${index}.empresa`)}
                id={`emprego-${index}-empresa`}
                label="Empresa"
                placeholder="Nome da empresa"
                maxLength={50}
                error={errors.empregos?.[index]?.empresa?.message}
                className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background"
              />
              {!errors.empregos?.[index]?.empresa && (
                <p className={HINT_CLASS}>
                  Caso tenha trabalhado por conta própria, escreva
                  &quot;Autônomo&quot; ou &quot;Trabalho informal&quot;
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`emprego-${index}-descricao`}
                className={cn(
                  'text-sm font-normal block',
                  errors.empregos?.[index]?.descricaoAtividades
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Descrição das atividades
              </label>
              <Textarea
                {...register(`empregos.${index}.descricaoAtividades`)}
                id={`emprego-${index}-descricao`}
                placeholder="Atividades realizadas"
                maxLength={300}
                error={errors.empregos?.[index]?.descricaoAtividades?.message}
                className="rounded-xl border-2 border-border min-h-24 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! resize-none"
              />
              {errors.empregos?.[index]?.descricaoAtividades?.message && (
                <p className="text-sm text-destructive mt-1">
                  {errors.empregos?.[index]?.descricaoAtividades?.message}
                </p>
              )}
              {!errors.empregos?.[index]?.descricaoAtividades && (
                <p className={HINT_CLASS}>
                  Exemplo: atendimento ao público, organização de estoque,
                  preparo de alimentos, limpeza de ambientes, emissão de notas
                  fiscais, entre outros
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.empregos?.[index]?.tempoExperienciaAnos ||
                    errors.empregos?.[index]?.tempoExperienciaMeses
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Tempo de experiência
              </span>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <CustomInput
                      {...register(`empregos.${index}.tempoExperienciaAnos`, {
                        setValueAs: (v: string | number) => {
                          if (v === '' || v === undefined) return undefined
                          const n = Number(v)
                          return Number.isNaN(n) ? undefined : n
                        },
                      })}
                      id={`emprego-${index}-tempo-anos`}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={50}
                      className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background pr-16"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      ano(s)
                    </span>
                  </div>
                </div>

                <span className="text-sm text-foreground font-medium">e</span>

                <div className="flex-1">
                  <div className="relative">
                    <CustomInput
                      {...register(`empregos.${index}.tempoExperienciaMeses`, {
                        setValueAs: (v: string | number) => {
                          if (v === '' || v === undefined) return undefined
                          const n = Number(v)
                          return Number.isNaN(n) ? undefined : n
                        },
                      })}
                      id={`emprego-${index}-tempo-meses`}
                      placeholder="0"
                      type="number"
                      min={0}
                      max={11}
                      className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background pr-16"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      mês(es)
                    </span>
                  </div>
                </div>
              </div>

              {(errors.empregos?.[index]?.tempoExperienciaAnos?.message ||
                errors.empregos?.[index]?.tempoExperienciaMeses?.message) && (
                <p className="text-sm text-destructive">
                  {errors.empregos?.[index]?.tempoExperienciaAnos?.message ||
                    errors.empregos?.[index]?.tempoExperienciaMeses?.message}
                </p>
              )}

              {!errors.empregos?.[index]?.tempoExperienciaAnos &&
                !errors.empregos?.[index]?.tempoExperienciaMeses && (
                  <p className={HINT_CLASS}>
                    Informe pelo menos 1 mês de experiência no total
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.empregos?.[index]?.experienciaComprovadaCarteira
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Experiência comprovada em carteira de trabalho?
              </span>
              <ExperienciaComprovadaField
                index={index}
                error={
                  errors.empregos?.[index]?.experienciaComprovadaCarteira
                    ?.message
                }
              />
            </div>

            {empregosFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmprego(index)}
                className="flex hover:cursor-pointer items-center gap-2 text-primary text-sm mt-2"
              >
                <Trash2 className="size-4" />
                Remover experiência
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
            appendEmprego({
              cargo: '',
              meuEmpregoAtual: false,
              empresa: '',
              descricaoAtividades: '',
              tempoExperienciaAnos: undefined,
              tempoExperienciaMeses: undefined,
              experienciaComprovadaCarteira: '',
            })
          }
        >
          Adicionar outro emprego
        </CustomButton>
      </div>

      <div className="py-1 pt-3">
        <Separator className="h-0.5 bg-border" />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-normal text-primary">
          Conquistas ou certificados
        </p>
        {conquistasFields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl bg-card p-4 space-y-4 shadow-none"
          >
            <div className="space-y-2">
              <span
                className={cn(
                  'text-sm font-normal block',
                  errors.conquistas?.[index]?.idTipoConquista
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Conquistas ou certificados
              </span>
              <TipoConquistaField
                index={index}
                error={errors.conquistas?.[index]?.idTipoConquista?.message}
              />
              {!errors.conquistas?.[index]?.idTipoConquista && (
                <p className={HINT_CLASS}>
                  Você pode informar sobre cursos, trabalho voluntários e outros
                  reconhecimentos
                </p>
              )}
            </div>

            <div className="space-y-2">
              <CustomInput
                {...register(`conquistas.${index}.titulo`)}
                id={`conquista-${index}-titulo`}
                label="Título"
                placeholder="Escreva o título da conquista ou certificado"
                maxLength={50}
                error={errors.conquistas?.[index]?.titulo?.message}
                className="rounded-xl border-2 border-border h-16 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! focus:bg-background"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`conquista-${index}-descricao`}
                className={cn(
                  'text-sm font-normal block',
                  errors.conquistas?.[index]?.descricao
                    ? 'text-destructive'
                    : 'text-primary'
                )}
              >
                Descrição
              </label>
              <Textarea
                {...register(`conquistas.${index}.descricao`)}
                id={`conquista-${index}-descricao`}
                placeholder="Escreva a descrição"
                maxLength={300}
                error={errors.conquistas?.[index]?.descricao?.message}
                className="rounded-xl border-2 border-border min-h-24 bg-background text-sm! shadow-none placeholder:text-sm! placeholder:text-foreground-light! dark:placeholder:text-muted-foreground! resize-none"
              />
              {errors.conquistas?.[index]?.descricao?.message && (
                <p className="text-sm text-destructive mt-1">
                  {errors.conquistas?.[index]?.descricao?.message}
                </p>
              )}
            </div>

            {conquistasFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeConquista(index)}
                className="flex hover:cursor-pointer items-center gap-2 text-primary text-sm mt-2"
              >
                <Trash2 className="size-4" />
                Remover conquista ou certificado
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
            appendConquista({
              idTipoConquista: '',
              titulo: '',
              descricao: '',
            })
          }
        >
          Adicionar outra conquista ou certificado
        </CustomButton>
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
          className={cn('flex-1 rounded-full', !canSave && 'opacity-50')}
          onClick={() => handleExperienciaSave()}
        >
          Salvar
        </CustomButton>
      </div>
    </div>
  )
}

function ExperienciaComprovadaField({
  index,
  error,
}: {
  index: number
  error?: string
}) {
  const { watch, control } = useFormContext<CurriculoExperienciaFormValues>()
  const value = watch(`empregos.${index}.experienciaComprovadaCarteira`) ?? ''
  const hasSelection = Boolean(value)

  return (
    <Controller
      control={control}
      name={`empregos.${index}.experienciaComprovadaCarteira`}
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
                Selecionar
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
          drawerContent={
            <ExperienciaComprovadaDrawerContent fieldIndex={index} />
          }
          drawerTitle="Experiência comprovada em carteira de trabalho?"
        />
      )}
    />
  )
}

function TipoConquistaField({
  index,
  error,
}: {
  index: number
  error?: string
}) {
  const { watch, control } = useFormContext<CurriculoExperienciaFormValues>()
  const { tiposConquista } = useExperienciaApi()
  const value = watch(`conquistas.${index}.idTipoConquista`) ?? ''
  const label = tiposConquista.find(t => t.id === value)?.descricao ?? ''
  const hasSelection = Boolean(value)

  return (
    <Controller
      control={control}
      name={`conquistas.${index}.idTipoConquista`}
      render={({ field }) => (
        <ActionDiv
          ref={field.ref}
          className="bg-background shadow-none"
          error={error}
          content={
            hasSelection ? (
              label
            ) : (
              <span className="text-foreground-light dark:text-muted-foreground">
                Selecione uma opção
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
          drawerContent={<TipoConquistaDrawerContent fieldIndex={index} />}
          drawerTitle="Conquistas ou certificados"
        />
      )}
    />
  )
}

export function ExperienciaProfissionalAccordionContent({
  cpf,
  onCancel,
  onSaveSuccess,
  snapshot,
}: ExperienciaProfissionalAccordionContentProps) {
  return (
    <ExperienciaProfissionalAccordionContentInner
      cpf={cpf}
      onCancel={onCancel}
      onSaveSuccess={onSaveSuccess}
      snapshot={snapshot}
    />
  )
}

export function getExperienciaSnapshot(
  values: CurriculoExperienciaFormValues
): CurriculoExperienciaFormValues {
  return structuredClone({
    empregos: values.empregos,
    conquistas: values.conquistas,
  })
}

export { hasExperienciaValidationErrors }
