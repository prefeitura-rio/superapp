'use client'

import type { AddressFormSchema } from '@/app/(app)/(logged-in)/user-profile/user-address/address-form/page'
import {
  BottomSheet,
  BottomSheetFooter,
} from '@/components/ui/custom/bottom-sheet'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { InputField } from '@/components/ui/custom/input-field'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useViewportHeight } from '@/hooks/useViewport'
import { useRouter } from 'next/navigation'
import type React from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface AddressDetailsDrawerContentProps {
  selectedAddress: any
  form: UseFormReturn<AddressFormSchema>
  onSubmit: (data: AddressFormSchema) => Promise<void>
  drawerOpen: boolean
  setDrawerOpen: (value: boolean) => void
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AddressDetailsDrawerContent({
  selectedAddress,
  form,
  onSubmit,
  drawerOpen,
  setDrawerOpen,
  handleCepChange,
}: AddressDetailsDrawerContentProps) {
  const { isBelowBreakpoint } = useViewportHeight()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = form

  const noNumber = watch('noNumber')
  const noComplement = watch('noComplement')
  const noCep = watch('noCep')
  const router = useRouter()

  return (
    <BottomSheet
      contentClassName="[@media(max-height:700px)]:min-h-[90lvh] flex flex-col"
      className={`${isBelowBreakpoint && 'overflow-y-scroll'} min-h-screen`}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      title={<p>Detalhes do Endereço</p>}
    >
      <div className={`"max-h-[95vh]" ${isBelowBreakpoint && 'h-[95vh]'}`}>
        <div className="text-center pt-6">
          <div className="text-lg font-normal">
            {selectedAddress?.main_text}
          </div>
          <div className="text-muted-foreground text-base">
            {selectedAddress?.secondary_text}
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 flex-1 flex flex-col pt-5 gap-4 "
        >
          <div>
            <InputField
              className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground focus:ring-1"
              placeholder={noNumber ? 'Sem número' : 'Escreva o número'}
              {...register('number')}
              disabled={noNumber}
              inputMode="numeric"
              pattern="[0-9]*"
              showClearButton={!noNumber}
              onClear={() => setValue('number', '')}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '')
                setValue('number', value)
                trigger('number')
              }}
              value={watch('number')}
            />
            {errors.number && !noNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.number.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Switch
              checked={noNumber}
              onCheckedChange={checked => setValue('noNumber', checked)}
              id="no-number"
            />
            <Label
              htmlFor="no-number"
              className={`text-muted-foreground font-normal text-base select-none ${noNumber && 'text-foreground'}`}
            >
              Sem número
            </Label>
          </div>
          <div>
            <InputField
              className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground focus:ring-1"
              {...register('complement')}
              placeholder={
                noComplement ? 'Sem complemento' : 'Escreva o complemento'
              }
              onClear={() => setValue('complement', '')}
              state="default"
              showClearButton={!noComplement}
              value={watch('complement')}
              onChange={e => {
                setValue('complement', e.target.value)
                trigger('complement')
              }}
              disabled={noComplement}
            />
            {errors.complement && !noComplement && (
              <p className="text-red-500 text-sm mt-1">
                {errors.complement.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Switch
              checked={noComplement}
              onCheckedChange={checked => setValue('noComplement', checked)}
              id="no-complement"
            />
            <Label
              htmlFor="no-complement"
              className={`text-muted-foreground font-normal text-base select-none ${noComplement && 'text-foreground'}`}
            >
              Sem complemento
            </Label>
          </div>
          <div>
            <InputField
              className="bg-card outline-none border-none text-lg placeholder:text-muted-foreground focus:ring-1"
              placeholder={noCep ? 'Sem CEP' : 'Escreva o CEP'}
              {...register('cep')}
              disabled={noCep}
              showClearButton={!noCep}
              onClear={() => setValue('cep', '')}
              state="default"
              maxLength={9}
              onChange={handleCepChange}
              value={watch('cep')}
            />
            {errors.cep && !noCep && (
              <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Switch
              checked={noCep}
              onCheckedChange={checked => setValue('noCep', checked)}
              id="no-cep"
            />
            <Label
              htmlFor="no-cep"
              className={`text-muted-foreground font-normal text-base select-none ${noCep && 'text-foreground'}`}
            >
              Sem CEP
            </Label>
          </div>
          <BottomSheetFooter className="px-0 gap-1.5">
            <CustomButton
              size="lg"
              className="flex-1 py-2 text-sm font-normal"
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </CustomButton>
            <CustomButton
              size="lg"
              className="flex-1 py-2 text-sm font-normal"
              variant="outline"
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                router.back()
              }}
            >
              Cancelar
            </CustomButton>
          </BottomSheetFooter>
        </form>
      </div>
    </BottomSheet>
  )
}
