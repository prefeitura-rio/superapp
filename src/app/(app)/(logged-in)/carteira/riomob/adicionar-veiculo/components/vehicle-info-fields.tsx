'use client'

import { ActionDiv } from '@/app/components/action-div'
import { ChevronDownIcon } from '@/assets/icons/chevron-down-icon'
import { EditIcon } from '@/assets/icons/edit-icon'
import { CustomInput } from '@/components/ui/custom/custom-input'
import { formatCpf } from '@/lib/format-cpf'
import { cn, formatTitleCase } from '@/lib/utils'
import type { UseFormReturn } from 'react-hook-form'
import { SelectOptionDrawerContent } from '../drawers/select-option-drawer-content'
import {
  VEHICLE_BRANDS,
  VEHICLE_COLORS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_TYPE_OPTIONS,
  type VehicleType,
  getBrandById,
  getModelById,
  getModelsByBrandId,
  isOtherBrand,
  isOtherModel,
} from '../mocks/vehicle-catalog'

export interface VehicleInfoFormValues {
  display_name: string
  brand_id: string
  brand_other?: string
  model_id: string
  model_other?: string
  vehicle_type?: VehicleType
  color: string
}

interface VehicleInfoFieldsProps<T extends VehicleInfoFormValues> {
  form: UseFormReturn<T>
  ownerName: string
  ownerCpf: string
  phoneDisplay: string
  emailDisplay: string
  returnUrl: string
  showTitle?: boolean
}

export function VehicleInfoFields<T extends VehicleInfoFormValues>({
  form,
  ownerName,
  ownerCpf,
  phoneDisplay,
  emailDisplay,
  returnUrl,
  showTitle = true,
}: VehicleInfoFieldsProps<T>) {
  const { watch, setValue } = form
  const values = watch()

  const brand = getBrandById(values.brand_id)
  const model = getModelById(values.model_id)
  const brandIsOther = isOtherBrand(values.brand_id)
  const modelIsOther = isOtherModel(values.model_id)
  const models = values.brand_id ? getModelsByBrandId(values.brand_id) : []
  const typeIsSelectable = brandIsOther || modelIsOther

  const brandHasValue = !!values.brand_id
  const brandDisplay = brand?.name || 'Selecionar'

  const modelHasValue = !!values.model_id
  const modelDisplay = !values.brand_id
    ? 'Selecione a marca primeiro'
    : model?.name || 'Selecionar'

  const colorHasValue = !!values.color
  const colorDisplay = values.color || 'Informe qual é a cor do seu veículo'

  const typeHasValue = !!values.vehicle_type
  const typeDisplay = values.vehicle_type
    ? VEHICLE_TYPE_LABELS[values.vehicle_type]
    : 'Selecione a marca e o modelo do veículo'

  const selectContent = (text: string, hasValue: boolean) => (
    <span className={cn(!hasValue && 'text-muted-foreground')}>{text}</span>
  )

  const chevronIcon = (
    <ChevronDownIcon className="size-6 text-muted-foreground" />
  )

  const encodedReturnUrl = encodeURIComponent(returnUrl)

  const handleBrandSelect = (brandId: string) => {
    setValue('brand_id' as never, brandId as never, { shouldValidate: true })
    setValue('brand_other' as never, '' as never, { shouldValidate: true })
    setValue('model_id' as never, '' as never, { shouldValidate: true })
    setValue('model_other' as never, '' as never, { shouldValidate: true })
    setValue('vehicle_type' as never, undefined as never, {
      shouldValidate: true,
    })
  }

  const handleModelSelect = (modelId: string) => {
    setValue('model_id' as never, modelId as never, { shouldValidate: true })
    setValue('model_other' as never, '' as never, { shouldValidate: true })

    if (isOtherModel(modelId) || isOtherBrand(values.brand_id)) {
      setValue('vehicle_type' as never, undefined as never, {
        shouldValidate: true,
      })
      return
    }

    const selectedModel = getModelById(modelId)
    if (selectedModel) {
      setValue('vehicle_type' as never, selectedModel.vehicle_type as never, {
        shouldValidate: true,
      })
    }
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="px-4 pb-8 text-left">
          <h2 className="text-3xl font-medium leading-9 tracking-tight text-foreground">
            Informações do Veículo
          </h2>
        </div>
      )}

      <div className="space-y-4 px-4!">
        <CustomInput
          id="owner-name"
          label="Proprietário"
          value={formatTitleCase(ownerName) || 'Informação indisponível'}
          isEditable={false}
          hint="Apenas o proprietário pode cadastrar veículos"
        />

        <CustomInput
          id="owner-cpf"
          label="CPF"
          value={formatCpf(ownerCpf)}
          isEditable={false}
        />

        <ActionDiv
          label="Celular"
          content={phoneDisplay}
          disabled
          rightIcon={<EditIcon />}
          redirectLink={`/meu-perfil/informacoes-pessoais/atualizar-telefone?returnUrl=${encodedReturnUrl}`}
        />

        <ActionDiv
          label="Email"
          content={emailDisplay}
          disabled
          rightIcon={<EditIcon />}
          redirectLink={`/meu-perfil/informacoes-pessoais/atualizar-email?returnUrl=${encodedReturnUrl}`}
        />

        <CustomInput
          id="display-name"
          label="Nome do Veículo"
          placeholder="Dê um nome ou apelido para seu veículo"
          value={values.display_name}
          onChange={event =>
            setValue('display_name' as never, event.target.value as never, {
              shouldValidate: true,
            })
          }
        />

        <ActionDiv
          label="Cor do Veículo"
          content={selectContent(colorDisplay, colorHasValue)}
          disabled
          rightIcon={chevronIcon}
          drawerTitle="Cor do Veículo"
          drawerContent={
            <SelectOptionDrawerContent
              name="vehicle-color"
              options={[...VEHICLE_COLORS]}
              value={values.color}
              onSelect={color =>
                setValue('color' as never, color as never, {
                  shouldValidate: true,
                })
              }
            />
          }
        />

        <ActionDiv
          label="Marca do Veículo"
          content={selectContent(brandDisplay, brandHasValue)}
          disabled
          rightIcon={chevronIcon}
          drawerTitle="Marca do Veículo"
          drawerContent={
            <SelectOptionDrawerContent
              name="vehicle-brand"
              options={VEHICLE_BRANDS.map(item => ({
                label: item.name,
                value: item.id,
              }))}
              value={values.brand_id}
              onSelect={handleBrandSelect}
            />
          }
        />

        {brandIsOther && (
          <CustomInput
            id="brand-other"
            label="Qual é a marca?"
            placeholder="Digite a marca do veículo"
            value={values.brand_other || ''}
            onChange={event =>
              setValue('brand_other' as never, event.target.value as never, {
                shouldValidate: true,
              })
            }
          />
        )}

        {brandHasValue ? (
          <ActionDiv
            label="Modelo do Veículo"
            content={selectContent(modelDisplay, modelHasValue)}
            disabled
            rightIcon={chevronIcon}
            drawerTitle="Modelo do Veículo"
            drawerContent={
              <SelectOptionDrawerContent
                name="vehicle-model"
                options={models.map(item => ({
                  label: item.name,
                  value: item.id,
                }))}
                value={values.model_id}
                onSelect={handleModelSelect}
              />
            }
          />
        ) : (
          <CustomInput
            id="vehicle-model"
            label="Modelo do Veículo"
            value="Selecione a marca primeiro"
            isEditable={false}
            rightIcon={chevronIcon}
          />
        )}

        {modelIsOther && (
          <CustomInput
            id="model-other"
            label="Qual é o modelo?"
            placeholder="Digite o modelo do veículo"
            value={values.model_other || ''}
            onChange={event =>
              setValue('model_other' as never, event.target.value as never, {
                shouldValidate: true,
              })
            }
          />
        )}

        {typeIsSelectable ? (
          <ActionDiv
            label="Tipo de veículo"
            content={selectContent(
              typeHasValue
                ? VEHICLE_TYPE_LABELS[values.vehicle_type as VehicleType]
                : 'Selecionar',
              typeHasValue
            )}
            disabled
            rightIcon={chevronIcon}
            drawerTitle="Tipo de veículo"
            drawerContent={
              <SelectOptionDrawerContent
                name="vehicle-type"
                options={VEHICLE_TYPE_OPTIONS}
                value={values.vehicle_type}
                onSelect={type =>
                  setValue('vehicle_type' as never, type as never, {
                    shouldValidate: true,
                  })
                }
              />
            }
          />
        ) : (
          <CustomInput
            id="vehicle-type"
            label="Tipo de veículo"
            value={typeDisplay}
            isEditable={false}
          />
        )}
      </div>
    </div>
  )
}
