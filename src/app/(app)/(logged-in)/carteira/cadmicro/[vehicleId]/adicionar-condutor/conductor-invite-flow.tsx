'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { useInviteConductorMutation } from '@/hooks/cadmicro/use-cadmicro-mutations'
import { applyMask } from '@/lib/input-mask'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
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
  const detailPath = `/carteira/cadmicro/${vehicleId}`
  const inviteMutation = useInviteConductorMutation(vehicleId)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [invitedName, setInvitedName] = useState('')

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

  const isPending = inviteMutation.isPending

  const handleSubmit = useCallback(async () => {
    const isFormValid = await form.trigger()
    if (!isFormValid) return

    const data = getValues()
    const payload = toInviteConductorPayload(data, vehicleId)

    try {
      const result = await inviteMutation.mutateAsync(payload)
      if (!result.success) {
        toast.error(result.error || 'Não foi possível enviar o convite')
        return
      }

      setInvitedName(data.name.trim())
      setDrawerOpen(true)
    } catch {
      toast.error('Não foi possível enviar o convite')
    }
  }, [form, getValues, inviteMutation, vehicleId])

  const handleAddAnother = useCallback(() => {
    reset({
      name: '',
      cpf: '',
      email: '',
    })
    setInvitedName('')
  }, [reset])

  return (
    <div className="mx-auto flex min-h-lvh w-full max-w-[896px] flex-col justify-between bg-background pb-10">
      <div>
        <SecondaryHeader
          route={detailPath}
          className="max-w-[896px]"
          fixed={false}
          disabled={isPending}
        />

        <div className="px-4 pb-6 pt-2">
          <h1 className="text-xl font-medium leading-6 text-foreground">
            Outros condutores
          </h1>
          <p className="mt-2 text-sm font-normal leading-5 text-foreground-light">
            Informe quem, além de você, está autorizado a utilizar esse veículo.
            Os condutores indicados receberão um convite para que o uso do
            equipamento seja habilitado.
          </p>
        </div>

        <div className="px-4">
          <div className="flex flex-col gap-4 rounded-xl bg-card p-4">
            <CustomInput
              id="conductor-name"
              label="Nome"
              placeholder="Digite o nome completo"
              className="bg-background shadow-none focus:bg-background"
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
                  className="bg-background shadow-none focus:bg-background"
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
              className="bg-background shadow-none focus:bg-background"
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

      <ConductorInvitedDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        conductorName={invitedName}
        onAddAnother={handleAddAnother}
      />
    </div>
  )
}
