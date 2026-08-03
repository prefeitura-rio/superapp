'use client'

import { ChevronLeftIcon } from '@/assets/icons'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  getModelById,
  isOtherBrand,
  isOtherModel,
} from './mocks/vehicle-catalog'
import {
  type VehicleFormData,
  toCreateVehiclePayload,
  vehicleFormSchema,
} from './schema'
import { SerialPhotosSlide } from './slides/serial-photos-slide'
import { VehicleInfoSlide } from './slides/vehicle-info-slide'
import { VehicleRegisteredDrawer } from './vehicle-registered-drawer'

import 'swiper/css'

export interface VehicleRegistrationOwnerInfo {
  cpf: string
  name: string
  phoneDisplay: string
  emailDisplay: string
  ownerPhone?: string
  ownerEmail?: string
}

interface VehicleRegistrationFlowProps {
  ownerInfo: VehicleRegistrationOwnerInfo
}

export function VehicleRegistrationFlow({
  ownerInfo,
}: VehicleRegistrationFlowProps) {
  const router = useRouter()
  const swiperRef = useRef<SwiperType | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createdVehicleId, setCreatedVehicleId] = useState('mock-vehicle-id')
  const [isPending, startTransition] = useTransition()

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    mode: 'onChange',
    defaultValues: {
      display_name: '',
      brand_id: '',
      brand_other: '',
      model_id: '',
      model_other: '',
      vehicle_type: undefined,
      color: '',
      serial_number: '',
      serial_number_photo_url: '',
      serial_number_photo_name: '',
      serial_number_photo_size: undefined,
      vehicle_photo_url: '',
      vehicle_photo_name: '',
      vehicle_photo_size: undefined,
      has_invoice: null,
      invoice_photo_url: '',
      invoice_photo_name: '',
      invoice_photo_size: undefined,
      self_declaration: false,
      owner_phone: ownerInfo.ownerPhone,
      owner_email: ownerInfo.ownerEmail,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when slide/content height changes
  useEffect(() => {
    swiperRef.current?.updateAutoHeight?.(0)
  }, [
    currentIndex,
    watchedValues.brand_id,
    watchedValues.model_id,
    watchedValues.serial_number_photo_name,
    watchedValues.vehicle_photo_name,
    watchedValues.invoice_photo_name,
    watchedValues.has_invoice,
  ])

  const goToNext = useCallback(() => {
    swiperRef.current?.slideNext()
    window.scrollTo({ top: 0 })
  }, [])

  const goToPrev = useCallback(() => {
    if (currentIndex === 0) {
      router.back()
      return
    }
    swiperRef.current?.slidePrev()
    window.scrollTo({ top: 0 })
  }, [currentIndex, router])

  const isSlide1Valid = useCallback(() => {
    const hasName = !!watchedValues.display_name?.trim()
    const hasColor = !!watchedValues.color
    const hasBrand = !!watchedValues.brand_id
    const hasModel = !!watchedValues.model_id
    const brandOk =
      !isOtherBrand(watchedValues.brand_id) ||
      !!watchedValues.brand_other?.trim()
    const modelOk =
      !isOtherModel(watchedValues.model_id) ||
      !!watchedValues.model_other?.trim()

    const typeResolved = (() => {
      if (
        isOtherBrand(watchedValues.brand_id) ||
        isOtherModel(watchedValues.model_id)
      ) {
        return !!watchedValues.vehicle_type
      }
      return !!getModelById(watchedValues.model_id)?.vehicle_type
    })()

    return (
      hasName &&
      hasColor &&
      hasBrand &&
      hasModel &&
      brandOk &&
      modelOk &&
      typeResolved
    )
  }, [watchedValues])

  const isSlide2Valid = useCallback(() => {
    const hasInvoiceFile =
      watchedValues.has_invoice !== true || !!watchedValues.invoice_photo_url

    return (
      !!watchedValues.serial_number?.trim() &&
      !!watchedValues.serial_number_photo_url &&
      !!watchedValues.vehicle_photo_url &&
      typeof watchedValues.has_invoice === 'boolean' &&
      hasInvoiceFile &&
      watchedValues.self_declaration === true
    )
  }, [watchedValues])

  const isCurrentSlideValid = useCallback(() => {
    return currentIndex === 0 ? isSlide1Valid() : isSlide2Valid()
  }, [currentIndex, isSlide1Valid, isSlide2Valid])

  const isLastSlide = currentIndex === 1

  const handleSubmit = useCallback(() => {
    startTransition(async () => {
      const isValid = await form.trigger()
      if (!isValid) return

      const data = form.getValues()
      const payload = toCreateVehiclePayload(data)

      // Mock create — trocar por action/Orval POST /citizen/{cpf}/vehicles
      await new Promise(resolve => setTimeout(resolve, 600))
      console.info('[riomob] mock create vehicle payload', payload)

      const mockId = `mock-vehicle-${Date.now()}`
      setCreatedVehicleId(mockId)
      setDrawerOpen(true)
    })
  }, [form])

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-4xl mx-auto pt-8 pb-12">
        <div className="relative px-4 h-11 mb-6 flex items-center">
          <CustomButton
            variant="secondary"
            className="bg-card text-muted-foreground rounded-full w-11 h-11 hover:bg-card/80 outline-none focus:ring-0 disabled:opacity-100"
            onClick={goToPrev}
            disabled={isPending}
          >
            <ChevronLeftIcon className="text-foreground" />
          </CustomButton>
        </div>

        <Swiper
          allowTouchMove={false}
          autoHeight
          onSwiper={swiper => {
            swiperRef.current = swiper
          }}
          onSlideChange={swiper => setCurrentIndex(swiper.activeIndex)}
          className="w-full"
        >
          <SwiperSlide key="vehicle-info" className="h-auto!">
            <VehicleInfoSlide
              form={form}
              ownerName={ownerInfo.name}
              ownerCpf={ownerInfo.cpf}
              phoneDisplay={ownerInfo.phoneDisplay}
              emailDisplay={ownerInfo.emailDisplay}
            />
          </SwiperSlide>

          <SwiperSlide key="serial-photos" className="h-auto!">
            <SerialPhotosSlide form={form} />
          </SwiperSlide>
        </Swiper>

        <div className="mt-8 px-4">
          <CustomButton
            onClick={isLastSlide ? handleSubmit : goToNext}
            disabled={!isCurrentSlideValid() || isPending}
            loading={isPending}
            size="xl"
            fullWidth
            variant="primary"
          >
            {isLastSlide ? 'Concluir cadastro' : 'Continuar'}
          </CustomButton>
        </div>
      </div>

      <VehicleRegisteredDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vehicleId={createdVehicleId}
      />
    </div>
  )
}
