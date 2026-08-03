'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { applyMask } from '@/lib/input-mask'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ConductorInvitedDrawer } from './conductor-invited-drawer'
import {
  type ConductorInviteFormData,
  conductorInviteFormSchema,
  toInviteConductorPayload,
} from './schema'

interface ConductorInviteFlowProps {
  vehicleId: string
}

export function ConductorInviteFlow({ vehicleId }: ConductorInviteFlowProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [invitedName, setInvitedName] = useState('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<ConductorInviteFormData>({
    resolver: zodResolver(conductorInviteFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      cpf: '',
      email: '',
    },
  })

  const {
    control,
    register,
    formState: { isValid, errors },
    getValues,
    reset,
  } = form

  const handleSubmit = useCallback(() => {
    startTransition(async () => {
      const isFormValid = await form.trigger()
      if (!isFormValid) return

      const data = getValues()
      const payload = toInviteConductorPayload(data, vehicleId)

      // Mock invite — trocar por action/Orval POST …/conductors
      await new Promise(resolve => setTimeout(resolve, 600))
      console.info('[riomob] mock invite conductor payload', payload)

      setInvitedName(data.name.trim())
      setDrawerOpen(true)
    })
  }, [form, getValues, vehicleId])

  const handleAddAnother = useCallback(() => {
    reset({
      name: '',
      cpf: '',
      email: '',
    })
    setInvitedName('')
  }, [reset])

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-4xl mx-auto pt-8 pb-12 flex flex-col min-h-screen justify-between">
        <div>
          <div className="relative px-4 h-11 mb-6 flex items-center">
            <CustomButton
              variant="secondary"
              className="bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 disabled:opacity-100"
              onClick={() => router.back()}
              disabled={isPending}
            >
              <ChevronLeftIcon className="text-foreground" />
            </CustomButton>
          </div>

          <div className="px-4 pb-6">
            <h1 className="text-xl font-medium text-foreground leading-6">
              Outros condutores
            </h1>
            <p className="mt-2 text-sm font-normal leading-5 text-foreground-light">
              Informe quem, além de você, está autorizado a utilizar esse
              veículo. Os condutores indicados receberão um convite para que o
              uso do equipamento seja habilitado.
            </p>
          </div>

          <div className="px-4">
            <div className="bg-card rounded-xl p-4 flex flex-col gap-4">
              <CustomInput
                id="conductor-name"
                label="Nome"
                placeholder="Digite o nome completo"
                className="bg-background focus:bg-background"
                error={errors.name?.message}
                disabled={isPending}
                {...register('name')}
              />

              <Controller
                name="cpf"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    id="conductor-cpf"
                    label="CPF"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    className="bg-background focus:bg-background"
                    error={errors.cpf?.message}
                    disabled={isPending}
                    value={field.value}
                    onChange={e =>
                      field.onChange(applyMask(e.target.value, 'cpf'))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />

              <CustomInput
                id="conductor-email"
                label="Email"
                type="email"
                placeholder="nome@email.com"
                inputMode="email"
                className="bg-background focus:bg-background"
                error={errors.email?.message}
                disabled={isPending}
                {...register('email')}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 px-4">
          <CustomButton
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            loading={isPending}
            size="xl"
            fullWidth
            variant="primary"
          >
            Enviar convite
          </CustomButton>
        </div>
      </div>

      <ConductorInvitedDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        conductorName={invitedName}
        onAddAnother={handleAddAnother}
      />
    </div>
  )
}
