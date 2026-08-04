'use client'

import { ActionDiv } from '@/app/components/action-div'
import { ChevronDownIcon } from '@/assets/icons/chevron-down-icon'
import { Checkbox } from '@/components/ui/checkbox'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { SelectOptionDrawerContent } from '../drawers/select-option-drawer-content'
import { SerialNumberInfoDrawer } from '../drawers/serial-number-info-drawer'
import { FileUploadField } from './file-upload-field'

export interface SerialPhotosFormValues {
  serial_number: string
  serial_number_photo_url: string
  serial_number_photo_name?: string
  serial_number_photo_size?: number
  vehicle_photo_url: string
  vehicle_photo_name?: string
  vehicle_photo_size?: number
  has_invoice: boolean | null
  invoice_photo_url?: string
  invoice_photo_name?: string
  invoice_photo_size?: number
  self_declaration: boolean
}

interface SerialPhotosFieldsProps<T extends SerialPhotosFormValues> {
  form: UseFormReturn<T>
  showTitle?: boolean
  showSelfDeclaration?: boolean
}

const HAS_INVOICE_OPTIONS = [
  { label: 'Sim', value: 'true' },
  { label: 'Não', value: 'false' },
]

export function SerialPhotosFields<T extends SerialPhotosFormValues>({
  form,
  showTitle = true,
  showSelfDeclaration = true,
}: SerialPhotosFieldsProps<T>) {
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
      {showTitle && (
        <div className="px-4 pb-8 text-left">
          <h2 className="text-xl font-medium leading-6 text-foreground">
            Número de Série e Fotos
          </h2>
        </div>
      )}

      <div className="space-y-4 px-4!">
        <CustomInput
          id="serial-number"
          label="Número de série"
          placeholder="Escreva o número de série"
          value={values.serial_number}
          onChange={event =>
            setValue('serial_number' as never, event.target.value as never, {
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
            setValue('serial_number_photo_url' as never, previewUrl as never, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_name' as never, _file.name as never, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_size' as never, _file.size as never, {
              shouldValidate: true,
            })
          }}
          onFileRemove={() => {
            if (values.serial_number_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.serial_number_photo_url)
            }
            setValue('serial_number_photo_url' as never, '' as never, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_name' as never, '' as never, {
              shouldValidate: true,
            })
            setValue('serial_number_photo_size' as never, undefined as never, {
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
            setValue('vehicle_photo_url' as never, previewUrl as never, {
              shouldValidate: true,
            })
            setValue('vehicle_photo_name' as never, _file.name as never, {
              shouldValidate: true,
            })
            setValue('vehicle_photo_size' as never, _file.size as never, {
              shouldValidate: true,
            })
          }}
          onFileRemove={() => {
            if (values.vehicle_photo_url?.startsWith('blob:')) {
              URL.revokeObjectURL(values.vehicle_photo_url)
            }
            setValue('vehicle_photo_url' as never, '' as never, {
              shouldValidate: true,
            })
            setValue('vehicle_photo_name' as never, '' as never, {
              shouldValidate: true,
            })
            setValue('vehicle_photo_size' as never, undefined as never, {
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
                setValue('has_invoice' as never, hasInvoice as never, {
                  shouldValidate: true,
                })
                if (!hasInvoice) {
                  if (values.invoice_photo_url?.startsWith('blob:')) {
                    URL.revokeObjectURL(values.invoice_photo_url)
                  }
                  setValue('invoice_photo_url' as never, '' as never, {
                    shouldValidate: true,
                  })
                  setValue('invoice_photo_name' as never, '' as never, {
                    shouldValidate: true,
                  })
                  setValue('invoice_photo_size' as never, undefined as never, {
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
              setValue('invoice_photo_url' as never, previewUrl as never, {
                shouldValidate: true,
              })
              setValue('invoice_photo_name' as never, _file.name as never, {
                shouldValidate: true,
              })
              setValue('invoice_photo_size' as never, _file.size as never, {
                shouldValidate: true,
              })
            }}
            onFileRemove={() => {
              if (values.invoice_photo_url?.startsWith('blob:')) {
                URL.revokeObjectURL(values.invoice_photo_url)
              }
              setValue('invoice_photo_url' as never, '' as never, {
                shouldValidate: true,
              })
              setValue('invoice_photo_name' as never, '' as never, {
                shouldValidate: true,
              })
              setValue('invoice_photo_size' as never, undefined as never, {
                shouldValidate: true,
              })
            }}
          />
        )}

        {showSelfDeclaration && (
          <div className="flex flex-col gap-1 py-2">
            <p className="text-sm font-normal leading-5 text-primary">
              Autodeclaração
            </p>
            <p className="text-sm font-normal leading-5 text-foreground-light">
              Declaro, sob minha responsabilidade, que sou o proprietário do
              veículo elétrico leve cadastrado e que todas as informações
              prestadas são verdadeiras e estão atualizadas.
            </p>
            <div className="flex items-center justify-between gap-3 pt-2">
              <label
                htmlFor="self-declaration"
                className="cursor-pointer text-sm font-normal leading-5 text-foreground"
              >
                Confirmo a declaração acima
              </label>
              <Checkbox
                id="self-declaration"
                checked={values.self_declaration === true}
                onCheckedChange={checked =>
                  setValue(
                    'self_declaration' as never,
                    (checked === true) as never,
                    { shouldValidate: true }
                  )
                }
              />
            </div>
          </div>
        )}
      </div>

      <SerialNumberInfoDrawer
        open={serialInfoOpen}
        onOpenChange={setSerialInfoOpen}
      />
    </div>
  )
}
