'use client'

import { registerPet } from '@/actions/pets/register-pet'
import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { z } from 'zod'
import { ConfirmUserDataSlide } from './confirm-user-data-slide'
import { PetRegisteredDrawer } from './pet-registered-drawer'

import 'swiper/css'

const SPECIES_OPTIONS = [
  'Cachorro',
  'Gato',
  'Cavalo',
  'Boi / Vaca',
  'Carneiro / Ovelha',
  'Bode / Cabra',
  'Outros',
] as const

const SEX_OPTIONS = ['Macho', 'Fêmea'] as const
const CASTRATED_OPTIONS = ['Sim', 'Não'] as const

function isValidDate(day: string, month: string, year: string): boolean {
  const y = Number.parseInt(year, 10)
  const m = Number.parseInt(month, 10)
  const d = day ? Number.parseInt(day, 10) : 1

  if (Number.isNaN(y) || Number.isNaN(m) || (day && Number.isNaN(d)))
    return false
  if (m < 1 || m > 12) return false
  if (day && (d < 1 || d > 31)) return false

  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1) return false
  if (day && date.getDate() !== d) return false

  const now = new Date()
  if (date > now) return false

  const fiftyYearsAgo = new Date()
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50)
  if (date < fiftyYearsAgo) return false

  return true
}

const petFormSchema = z
  .object({
    nome: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(20, 'Máximo de 20 caracteres'),
    especie: z.string().min(1, 'Selecione uma espécie'),
    sexo: z.enum(['Macho', 'Fêmea'], {
      required_error: 'Selecione o sexo',
    }),
    castrado: z.enum(['Sim', 'Não'], {
      required_error: 'Selecione uma opção',
    }),
    birthDay: z.string().optional(),
    birthMonth: z.string().min(1, 'Mês é obrigatório'),
    birthYear: z.string().min(1, 'Ano é obrigatório'),
  })
  .refine(
    data => {
      if (!data.birthMonth || !data.birthYear) return true
      return isValidDate(data.birthDay || '', data.birthMonth, data.birthYear)
    },
    {
      message: 'Data inválida',
      path: ['birthDate'],
    }
  )

type PetFormData = z.infer<typeof petFormSchema>

interface ConfirmSlideUserInfo {
  cpf: string
  name: string
  email: unknown
  phone: unknown
  genero?: string
  escolaridade?: string
  renda_familiar?: string
  deficiencia?: string
}

interface PetRegistrationFlowProps {
  shouldShowConfirmation: boolean
  confirmSlideProps?: {
    userInfo: ConfirmSlideUserInfo
    userAuthInfo: { cpf: string; name: string }
    contactUpdateStatus?: {
      phoneNeedsUpdate: boolean
      emailNeedsUpdate: boolean
    }
  }
}

export function PetRegistrationFlow({
  shouldShowConfirmation,
  confirmSlideProps,
}: PetRegistrationFlowProps) {
  const router = useRouter()
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      especie: '',
      sexo: undefined,
      castrado: undefined,
      birthDay: '',
      birthMonth: '',
      birthYear: '',
    },
  })

  const { watch, setValue, formState } = form
  const watchedValues = watch()
  const errors = formState.errors

  const totalSlides = shouldShowConfirmation ? 7 : 6
  const petSlideOffset = shouldShowConfirmation ? 1 : 0

  const goToNext = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  const goToPrev = useCallback(() => {
    if (currentIndex === 0) {
      router.back()
      return
    }
    swiperRef.current?.slidePrev()
  }, [currentIndex, router])

  const handleSubmit = useCallback(() => {
    startTransition(async () => {
      const data = form.getValues()

      const month = data.birthMonth.padStart(2, '0')
      const day = data.birthDay ? data.birthDay.padStart(2, '0') : '01'
      const nascimentoData = `${data.birthYear}-${month}-${day}`

      const result = await registerPet({
        nome: data.nome,
        especie: data.especie,
        sexo: data.sexo === 'Macho' ? 'M' : 'F',
        castrado: data.castrado === 'Sim',
        nascimentoData,
      })

      if (result.success) {
        setDrawerOpen(true)
      } else {
        console.error('Error registering pet:', result.error)
      }
    })
  }, [form])

  const isCurrentSlideValid = useCallback(() => {
    const adjustedIndex = currentIndex - petSlideOffset

    if (shouldShowConfirmation && currentIndex === 0) return true

    switch (adjustedIndex) {
      case 0:
        return (
          !!watchedValues.nome &&
          watchedValues.nome.length > 0 &&
          watchedValues.nome.length <= 20 &&
          !errors.nome
        )
      case 1:
        return !!watchedValues.especie
      case 2:
        return !!watchedValues.sexo
      case 3:
        return !!watchedValues.castrado
      case 4: {
        if (!watchedValues.birthMonth || !watchedValues.birthYear) return false
        return isValidDate(
          watchedValues.birthDay || '',
          watchedValues.birthMonth,
          watchedValues.birthYear
        )
      }
      case 5:
        return true
      default:
        return false
    }
  }, [
    currentIndex,
    petSlideOffset,
    shouldShowConfirmation,
    watchedValues,
    errors.nome,
  ])

  const isLastSlide = currentIndex === totalSlides - 1

  const getSexArticle = (sexo: string) => (sexo === 'Fêmea' ? 'A' : 'O')
  const getCastratedLabel = (sexo: string) =>
    sexo === 'Fêmea' ? 'castrada' : 'castrado'

  const formatBirthDate = () => {
    const day = watchedValues.birthDay
      ? watchedValues.birthDay.padStart(2, '0')
      : '--'
    const month = watchedValues.birthMonth
      ? watchedValues.birthMonth.padStart(2, '0')
      : '--'
    const year = watchedValues.birthYear || '----'
    return `${day}/${month}/${year}`
  }

  const hasDateError =
    !!watchedValues.birthMonth &&
    !!watchedValues.birthYear &&
    !isValidDate(
      watchedValues.birthDay || '',
      watchedValues.birthMonth,
      watchedValues.birthYear
    )

  return (
    <div className="fixed inset-0 w-full bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col h-full">
        {/* Back button */}
        <div className="relative h-11 pb-4 shrink-0 pt-8 justify-self-start self-start flex items-center">
          <CustomButton
            className="bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0"
            onClick={goToPrev}
            disabled={isPending}
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

        {/* Slides */}
        <div className="flex-1 flex flex-col overflow-hidden py-8">
          <Swiper
            allowTouchMove={false}
            onSwiper={swiper => {
              swiperRef.current = swiper
            }}
            onSlideChange={swiper => setCurrentIndex(swiper.activeIndex)}
            className="overflow-hidden! w-full h-full"
          >
            {/* Slide 1: Confirmar informações (condicional) */}
            {shouldShowConfirmation && confirmSlideProps && (
              <SwiperSlide key="confirm-user-data" className="h-auto!">
                <ConfirmUserDataSlide
                  userInfo={confirmSlideProps.userInfo}
                  userAuthInfo={confirmSlideProps.userAuthInfo}
                  contactUpdateStatus={confirmSlideProps.contactUpdateStatus}
                />
              </SwiperSlide>
            )}

            {/* Slide 2: Nome do pet */}
            <SwiperSlide key="nome" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    <span className="text-primary">Qual é o nome</span> do seu
                    animal de estimação?
                  </h2>
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Escreva aqui o nome completo do seu pet"
                    value={watchedValues.nome}
                    onChange={e => {
                      setValue('nome', e.target.value, {
                        shouldValidate: true,
                      })
                    }}
                    maxLength={20}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground mt-2 text-right">
                    {watchedValues.nome?.length || 0}/20
                  </p>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 3: Espécie */}
            <SwiperSlide key="especie" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    <span className="text-primary">Qual é a espécie</span> de{' '}
                    {watchedValues.nome || 'seu pet'}?
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {SPECIES_OPTIONS.map((option, index) => (
                    <div key={option}>
                      {index > 0 && (
                        <div className="h-px w-full bg-border" />
                      )}
                      <label className="flex items-center py-4 cursor-pointer">
                        <input
                          type="radio"
                          name="especie"
                          value={option}
                          checked={watchedValues.especie === option}
                          onChange={() =>
                            setValue('especie', option, {
                              shouldValidate: true,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${
                            watchedValues.especie === option
                              ? 'border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {watchedValues.especie === option && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-foreground text-base">
                          {option}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 4: Sexo */}
            <SwiperSlide key="sexo" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    <span className="text-primary">Qual é o sexo</span> de{' '}
                    {watchedValues.nome || 'seu pet'}?
                  </h2>
                </div>
                <div className="flex-1">
                  {SEX_OPTIONS.map((option, index) => (
                    <div key={option}>
                      {index > 0 && (
                        <div className="h-px w-full bg-border" />
                      )}
                      <label className="flex items-center py-4 cursor-pointer">
                        <input
                          type="radio"
                          name="sexo"
                          value={option}
                          checked={watchedValues.sexo === option}
                          onChange={() =>
                            setValue('sexo', option as 'Macho' | 'Fêmea', {
                              shouldValidate: true,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${
                            watchedValues.sexo === option
                              ? 'border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {watchedValues.sexo === option && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-foreground text-base">
                          {option}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 5: Castrado */}
            <SwiperSlide key="castrado" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    {getSexArticle(watchedValues.sexo)}{' '}
                    {watchedValues.nome || 'seu pet'} é{' '}
                    {getCastratedLabel(watchedValues.sexo)}?
                  </h2>
                </div>
                <div className="flex-1">
                  {CASTRATED_OPTIONS.map((option, index) => (
                    <div key={option}>
                      {index > 0 && (
                        <div className="h-px w-full bg-border" />
                      )}
                      <label className="flex items-center py-4 cursor-pointer">
                        <input
                          type="radio"
                          name="castrado"
                          value={option}
                          checked={watchedValues.castrado === option}
                          onChange={() =>
                            setValue('castrado', option as 'Sim' | 'Não', {
                              shouldValidate: true,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 ${
                            watchedValues.castrado === option
                              ? 'border-primary'
                              : 'border-muted-foreground'
                          }`}
                        >
                          {watchedValues.castrado === option && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-foreground text-base">
                          {option}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 6: Data de nascimento */}
            <SwiperSlide key="birth-date" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    <span className="text-primary">
                      Qual é a data de nascimento
                    </span>{' '}
                    de {watchedValues.nome || 'seu pet'}?
                  </h2>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Dia
                      </label>
                      <Input
                        placeholder="DD"
                        value={watchedValues.birthDay || ''}
                        onChange={e => {
                          const val = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 2)
                          setValue('birthDay', val)
                        }}
                        inputMode="numeric"
                        className="text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Mês
                      </label>
                      <Input
                        placeholder="MM"
                        value={watchedValues.birthMonth || ''}
                        onChange={e => {
                          const val = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 2)
                          setValue('birthMonth', val)
                        }}
                        inputMode="numeric"
                        className="text-center"
                      />
                    </div>
                    <div className="flex-[1.5]">
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Ano
                      </label>
                      <Input
                        placeholder="AAAA"
                        value={watchedValues.birthYear || ''}
                        onChange={e => {
                          const val = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 4)
                          setValue('birthYear', val)
                        }}
                        inputMode="numeric"
                        className="text-center"
                      />
                    </div>
                  </div>
                  {hasDateError && (
                    <p className="text-destructive text-sm mt-2">
                      Data inválida
                    </p>
                  )}
                  <p className="text-sm text-foreground-light mt-3">
                    Caso você não saiba a data exata, estime apenas o mês e o
                    ano de nascimento do seu animal.
                  </p>
                </div>
              </div>
            </SwiperSlide>

            {/* Slide 7: Resumo */}
            <SwiperSlide key="summary" className="h-auto!">
              <div className="w-full h-full flex flex-col">
                <div className="text-left shrink-0 pb-6">
                  <h2 className="text-3xl font-medium text-foreground leading-9 tracking-tight">
                    Antes de finalizar,{' '}
                    <span className="text-primary">confira as informações</span>
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="py-3">
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="text-sm text-foreground">
                      {watchedValues.nome}
                    </p>
                  </div>
                  <div className="h-px w-full bg-border" />
                  <div className="py-3">
                    <p className="text-sm text-muted-foreground">Espécie</p>
                    <p className="text-sm text-foreground">
                      {watchedValues.especie}
                    </p>
                  </div>
                  <div className="h-px w-full bg-border" />
                  <div className="py-3">
                    <p className="text-sm text-muted-foreground">Sexo</p>
                    <p className="text-sm text-foreground">
                      {watchedValues.sexo}
                    </p>
                  </div>
                  <div className="h-px w-full bg-border" />
                  <div className="py-3">
                    <p className="text-sm text-muted-foreground">
                      Data de nascimento
                    </p>
                    <p className="text-sm text-foreground">
                      {formatBirthDate()}
                    </p>
                  </div>
                  <div className="h-px w-full bg-border" />
                  <div className="py-3">
                    <p className="text-sm text-muted-foreground">Castrado</p>
                    <p className="text-sm text-foreground">
                      {watchedValues.castrado}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Footer button */}
        <div className="shrink-0 pb-12">
          <CustomButton
            onClick={isLastSlide ? handleSubmit : goToNext}
            disabled={!isCurrentSlideValid() || isPending}
            loading={isPending}
            className="rounded-full"
            size="xl"
            fullWidth
          >
            {isLastSlide ? 'Finalizar cadastro' : 'Continuar'}
          </CustomButton>
        </div>
      </div>

      <PetRegisteredDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        petName={watchedValues.nome}
      />
    </div>
  )
}
