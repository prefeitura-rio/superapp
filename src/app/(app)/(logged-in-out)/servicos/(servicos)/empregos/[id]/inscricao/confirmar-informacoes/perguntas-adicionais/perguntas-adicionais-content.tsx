'use client'

import { ActionDiv } from '@/app/components/action-div'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { BottomSheet } from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { ThemeAwareVideo } from '@/components/ui/custom/theme-aware-video'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { VIDEO_SOURCES } from '@/constants/videos-sources'
import { zodResolver } from '@hookform/resolvers/zod'
import confetti from 'canvas-confetti'
import { ChevronDownIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { MultiplaSelecaoDrawerContent } from './multipla-selecao-drawer-content'
import { UnicaSelecaoDrawerContent } from './unica-selecao-drawer-content'

interface InformacaoComplementar {
  id: string
  id_vaga: string
  titulo: string
  obrigatorio: boolean
  tipo_campo:
    | 'resposta_curta'
    | 'resposta_numerica'
    | 'selecao_unica'
    | 'selecao_multipla'
  valor_minimo: number | null
  valor_maximo: number | null
  opcoes: string[] | null
  created_at: string
  updated_at: string
}

interface PerguntasAdicionaisContentProps {
  vagaId: string
  informacoesComplementares: InformacaoComplementar[]
}

function createDynamicSchema(informacoes: InformacaoComplementar[]) {
  const schemaFields: Record<string, z.ZodTypeAny> = {}

  for (const info of informacoes) {
    const fieldName = `field_${info.id}`

    switch (info.tipo_campo) {
      case 'resposta_curta': {
        if (info.obrigatorio) {
          schemaFields[fieldName] = z
            .string()
            .min(1, 'Este campo é obrigatório')
        } else {
          schemaFields[fieldName] = z.string().optional()
        }
        break
      }

      case 'resposta_numerica': {
        let schema = z.number({
          required_error: 'Este campo é obrigatório',
          invalid_type_error: 'Digite um número válido',
        })

        if (info.valor_minimo !== null) {
          schema = schema.min(
            info.valor_minimo,
            `O valor mínimo é ${info.valor_minimo}`
          )
        }

        if (info.valor_maximo !== null) {
          schema = schema.max(
            info.valor_maximo,
            `O valor máximo é ${info.valor_maximo}`
          )
        }

        if (!info.obrigatorio) {
          schemaFields[fieldName] = z.union([schema, z.string().length(0)])
        } else {
          schemaFields[fieldName] = schema
        }
        break
      }

      case 'selecao_unica': {
        if (info.obrigatorio) {
          schemaFields[fieldName] = z.string().min(1, 'Selecione uma opção')
        } else {
          schemaFields[fieldName] = z.string().optional()
        }
        break
      }

      case 'selecao_multipla': {
        if (info.obrigatorio) {
          schemaFields[fieldName] = z
            .array(z.string())
            .min(1, 'Selecione pelo menos uma opção')
        } else {
          schemaFields[fieldName] = z.array(z.string()).optional()
        }
        break
      }
    }
  }

  return z.object(schemaFields)
}

function createDefaultValues(informacoes: InformacaoComplementar[]) {
  const values: Record<string, unknown> = {}

  for (const info of informacoes) {
    const fieldName = `field_${info.id}`

    switch (info.tipo_campo) {
      case 'resposta_curta':
        values[fieldName] = ''
        break
      case 'resposta_numerica':
        values[fieldName] = ''
        break
      case 'selecao_unica':
        values[fieldName] = ''
        break
      case 'selecao_multipla':
        values[fieldName] = []
        break
    }
  }

  return values
}

export function PerguntasAdicionaisContent({
  vagaId,
  informacoesComplementares,
}: PerguntasAdicionaisContentProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successDrawerOpen, setSuccessDrawerOpen] = useState(false)

  const schema = createDynamicSchema(informacoesComplementares)
  const defaultValues = createDefaultValues(informacoesComplementares)

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  const { control, formState, handleSubmit } = form
  const { errors } = formState

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      // TODO: Enviar dados para a API
      console.log('Dados a enviar:', data)

      // Formatar dados para o formato esperado pela API
      const respostas = informacoesComplementares.map(info => ({
        id_informacao_complementar: info.id,
        resposta: data[`field_${info.id}`],
      }))

      console.log('Respostas formatadas:', respostas)

      // Disparar confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 },
      })

      // Abrir drawer de sucesso
      setSuccessDrawerOpen(true)
    } catch (error) {
      console.error('Erro ao finalizar inscrição:', error)
      toast.error('Erro ao finalizar inscrição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onError = (errors: Record<string, unknown>) => {
    console.log('Erros de validação:', errors)
    toast.error('Por favor, preencha todos os campos obrigatórios.')
  }

  const handleSuccessDrawerClose = () => {
    setSuccessDrawerOpen(false)
    router.push('/servicos/empregos')
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <SecondaryHeader
          fixed={false}
          className="max-w-4xl mx-auto"
          route={`/servicos/empregos/${vagaId}/inscricao/confirmar-informacoes`}
        />
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-120px)] overflow-x-hidden">
            <div className="text-left shrink-0 pb-6 pt-2">
              <h1 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                Perguntas adicionais
              </h1>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 space-y-6">
              {informacoesComplementares.map(info => {
                const fieldName = `field_${info.id}`
                const error = errors[fieldName]?.message as string | undefined

                return (
                  <div key={info.id}>
                    {info.tipo_campo === 'resposta_curta' && (
                      <Controller
                        control={control}
                        name={fieldName}
                        render={({ field }) => (
                          <CustomInput
                            {...field}
                            label={info.titulo}
                            placeholder="Escreva aqui"
                            error={error}
                            isRequired={info.obrigatorio}
                            className="rounded-xl border-2 border-border h-16 bg-transparent text-sm shadow-none placeholder:text-sm placeholder:text-foreground-light dark:placeholder:text-muted-foreground focus:bg-card"
                            containerClassName="space-y-3"
                          />
                        )}
                      />
                    )}

                    {info.tipo_campo === 'resposta_numerica' && (
                      <Controller
                        control={control}
                        name={fieldName}
                        render={({ field }) => (
                          <CustomInput
                            {...field}
                            type="number"
                            label={info.titulo}
                            placeholder="Escreva aqui"
                            error={error}
                            isRequired={info.obrigatorio}
                            min={info.valor_minimo ?? undefined}
                            max={info.valor_maximo ?? undefined}
                            onChange={e => {
                              const value = e.target.value
                              field.onChange(value === '' ? '' : Number(value))
                            }}
                            value={field.value === '' ? '' : field.value}
                            className="rounded-xl border-2 border-border h-16 bg-transparent text-sm shadow-none placeholder:text-sm placeholder:text-foreground-light dark:placeholder:text-muted-foreground focus:bg-card"
                            containerClassName="space-y-3"
                          />
                        )}
                      />
                    )}

                    {info.tipo_campo === 'selecao_unica' && (
                      <Controller
                        control={control}
                        name={fieldName}
                        render={({ field }) => {
                          const hasSelection = Boolean(field.value)

                          return (
                            <ActionDiv
                              ref={field.ref}
                              label={info.titulo}
                              isRequired={info.obrigatorio}
                              content={
                                hasSelection ? (
                                  field.value
                                ) : (
                                  <span className="text-foreground-light dark:text-muted-foreground">
                                    Selecionar
                                  </span>
                                )
                              }
                              disabled
                              variant="default"
                              error={error}
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
                                <UnicaSelecaoDrawerContent
                                  fieldName={fieldName}
                                  opcoes={info.opcoes ?? []}
                                />
                              }
                              drawerTitle={info.titulo}
                              containerClassName="space-y-3"
                            />
                          )
                        }}
                      />
                    )}

                    {info.tipo_campo === 'selecao_multipla' && (
                      <Controller
                        control={control}
                        name={fieldName}
                        render={({ field }) => {
                          const value = (field.value as string[]) ?? []
                          const hasSelection = value.length > 0

                          return (
                            <ActionDiv
                              ref={field.ref}
                              label={info.titulo}
                              isRequired={info.obrigatorio}
                              content={
                                hasSelection ? (
                                  <span className="line-clamp-2">
                                    {value.join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-foreground-light dark:text-muted-foreground">
                                    Selecionar
                                  </span>
                                )
                              }
                              disabled
                              variant="default"
                              error={error}
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
                                <MultiplaSelecaoDrawerContent
                                  fieldName={fieldName}
                                  opcoes={info.opcoes ?? []}
                                />
                              }
                              drawerTitle={info.titulo}
                              containerClassName="space-y-3"
                            />
                          )
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="shrink-0 pt-6 pb-8">
              <CustomButton
                type="submit"
                size="lg"
                fullWidth
                variant="primary"
                className="rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar inscrição'}
              </CustomButton>
            </div>
          </div>
        </form>
      </FormProvider>

      {/* Drawer de Sucesso */}
      <Drawer open={successDrawerOpen} modal dismissible={false}>
        <DrawerHeader className="sr-only">
          <DrawerTitle className="sr-only">
            Candidatura enviada e currículo atualizado
          </DrawerTitle>
        </DrawerHeader>
        <DrawerContent className="max-w-none mx-auto rounded-t-none min-h-screen 3xl:justify-center flex flex-col">
          <div className="flex flex-col min-h-screen 3xl:min-h-[70vh] justify-between bg-background px-4 py-12 max-w-4xl mx-auto w-full">
            <div className="flex flex-col flex-1 gap-6">
              <ThemeAwareVideo
                source={VIDEO_SOURCES.jobApplicationSuccess}
                containerClassName="flex items-center justify-center h-[min(328px,40vh)] max-h-[328px]"
              />

              <div className="flex flex-col text-left">
                <h2 className="text-foreground text-4xl font-medium leading-10">
                  Candidatura enviada e currículo atualizado
                </h2>

                <p className="text-foreground-light text-sm font-normal leading-5">
                  Obrigado por submeter sua candidatura! Ela será analisada e
                  você receberá uma resposta por e-mail ou WhatsApp.
                </p>
              </div>
            </div>

            <CustomButton
              size="xl"
              fullWidth
              onClick={handleSuccessDrawerClose}
              className="rounded-full"
            >
              Voltar para a tela inicial
            </CustomButton>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
