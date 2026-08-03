'use client'

import { ActionDiv } from '@/app/components/action-div'
import { ChevronDownIcon } from '@/assets/icons/chevron-down-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FileUploadField } from '../components/file-upload-field'
import { SelectOptionDrawerContent } from '../drawers/select-option-drawer-content'
import { SerialNumberInfoDrawer } from '../drawers/serial-number-info-drawer'
import type { VehicleFormData } from '../schema'

interface SerialPhotosSlideProps {
  form: UseFormReturn<VehicleFormData>
}

const HAS_INVOICE_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
]

export function SerialPhotosSlide({ form }: SerialPhotosSlideProps) {
  const { watch, setValue } = form
  const values = watch()
  const [serialInfoOpen, setSerialInfoOpen] = useState(false)

  const hasInvoiceSelected = typeof values.has_invoice === 'boolean'
  const hasInvoiceLabel = hasInvoiceSelected
    ? values.has_invoice
      ? 'Sim'
      : 'Não'
    : 'Selecionar'

  return (
    <div className="w-full">
      <div className="text-left pb-8 px-4">
        <h2 className="text-xl font-medium text-foreground leading-6">
          Número de Série e Fotos
        </h2>
      </div>

      <div className="space-y-4 px-4!">
        <CustomInput
          id="serial-number"
          label="Número de série"
          placeholder="Escreva o número de série"
          value={values.serial_number}
          onChange={event =>
            setValue('serial_number', event.target.value, {
              shouldValidate: true,
            })
          }
        />

        <FileUploadField
          label="Foto do número de série"
          showInfoIcon
          onInfoClick={() => setSerialInfoOpen(true)}
          description="Para realizar o cadastro, é obrigatório o envio de uma foto do número de série. São aceitos os formatos PNG, JPEG e PDF no tamanho máximo de 7mb."
          buttonLabel="Enviar número de série"
          fileName={values.serial_number_photo_name}
          fileSize={values.serial_number_photo_size}
          onFileSelect={(_file, previewUrl) => {
            if (values.serial_number_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.serial_number_photo_url)
            }
            setValue('serial_number_photo_url', previewUrl, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_name', _file.name, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_size', _file.size, {
              shouldValidate: true,
            })
          }}
          onFileRemove={() => {
            if (values.serial_number_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.serial_number_photo_url)
            }
            setValue('serial_number_photo_url', '', { shouldValidate: true })
            setValue('serial_number_photo_name', '', { shouldValidate: true })
            setValue('serial_number_photo_size', undefined, {
              shouldValidate: true,
            })
          }}
        />

        <FileUploadField
          label="Fotos do veículo"
          description="Para realizar o cadastro, é obrigatório o envio de uma foto do veículo. São aceitos os formatos PNG, JPEG e PDF no tamanho máximo de 7mb."
          buttonLabel="Enviar foto"
          fileName={values.vehicle_photo_name}
          fileSize={values.vehicle_photo_size}
          onFileSelect={(_file, previewUrl) => {
            if (values.vehicle_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.vehicle_photo_url)
            }
            setValue('vehicle_photo_url', previewUrl, { shouldValidate: true })
            setValue('vehicle_photo_name', _file.name, {
              shouldValidate: true,
            })
            setValue('vehicle_photo_size', _file.size, {
              shouldValidate: true,
            })
          }}
          onFileRemove={() => {
            if (values.vehicle_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.vehicle_photo_url)
            }
            setValue('vehicle_photo_url', '', { shouldValidate: true })
            setValue('vehicle_photo_name', '', { shouldValidate: true })
            setValue('vehicle_photo_size', undefined, {
              shouldValidate: true,
            })
          }}
        />

        <ActionDiv
          label="Possui a Nota Fiscal?"
          content={
            <span
              className={cn(!hasInvoiceSelected && 'text-muted-foreground')}
            >
              {hasInvoiceLabel}
            </span>
          }
          disabled
          rightIcon={
            <ChevronDownIcon className="size-6 text-muted-foreground" />
          }
          drawerTitle="Possui a Nota Fiscal?"
          drawerContent={
            <SelectOptionDrawerContent
              name="has-invoice"
              options={HAS_INVOICE_OPTIONS}
              value={
                hasInvoiceSelected ? String(values.has_invoice) : undefined
              }
              onSelect={value => {
                const hasInvoice = value === 'true'
                setValue('has_invoice', hasInvoice, {
                  shouldValidate: true,
                })
                if (!hasInvoice) {
                  if (values.invoice_photo_url?.startsWith('blob:')) {
                    URL.revokeObjectURL(values.invoice_photo_url)
                  }
                  setValue('invoice_photo_url', '', { shouldValidate: true })
                  setValue('invoice_photo_name', '', { shouldValidate: true })
                  setValue('invoice_photo_size', undefined, {
                    shouldValidate: true,
                  })
                }
              }}
            />
          }
        />

        {values.has_invoice === true && (
          <FileUploadField
            label="Nota Fiscal"
            description="Caso possua, envie um arquivo ou foto da Nota Fiscal. São aceitos os formatos PNG, JPEG e PDF no tamanho máximo de 7mb."
            buttonLabel="Enviar Nota Fiscal"
            fileName={values.invoice_photo_name}
            fileSize={values.invoice_photo_size}
            onFileSelect={(_file, previewUrl) => {
              if (values.invoice_photo_url?.startsWith('blob:')) {
                URL.revokeObjectURL(values.invoice_photo_url)
              }
              setValue('invoice_photo_url', previewUrl, {
                shouldValidate: true,
              })
              setValue('invoice_photo_name', _file.name, {
                shouldValidate: true,
              })
              setValue('invoice_photo_size', _file.size, {
                shouldValidate: true,
              })
            }}
            onFileRemove={() => {
              if (values.invoice_photo_url?.startsWith('blob:')) {
                URL.revokeObjectURL(values.invoice_photo_url)
              }
              setValue('invoice_photo_url', '', { shouldValidate: true })
              setValue('invoice_photo_name', '', { shouldValidate: true })
              setValue('invoice_photo_size', undefined, {
                shouldValidate: true,
              })
            }}
          />
        )}

        <div className="flex flex-col gap-1 py-2">
          <p className="text-sm text-primary font-normal leading-5">
            Autodeclaração
          </p>
          <p className="text-sm text-foreground-light font-normal leading-5">
            Declaro, sob minha responsabilidade, que sou o proprietário do
            veículo elétrico leve cadastrado e que todas as informações
            prestadas são verdadeiras e estão atualizadas.
          </p>
          <div className="flex items-center justify-between gap-3 pt-2">
            <label
              htmlFor="self-declaration"
              className={cn(
                'text-sm text-foreground font-normal leading-5 cursor-pointer'
              )}
            >
              Confirmo a declaração acima
            </label>
            <Checkbox
              id="self-declaration"
              checked={values.self_declaration === true}
              onCheckedChange={checked =>
                setValue('self_declaration', checked === true, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        </div>
      </div>

      <SerialNumberInfoDrawer
        open={serialInfoOpen}
        onOpenChange={setSerialInfoOpen}
      />
    </div>
  )
}
