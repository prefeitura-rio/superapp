'use client'

import { createVehicle } from '@/actions/riomob'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { CustomButton } from '@/components/ui/custom/custom-button'
import { useInvalidateRiomobQueries } from '@/hooks/riomob/use-invalidate-riomob-queries'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import type { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import {
  type VehicleFormData,
  isSerialPhotosSlideValid,
  isVehicleInfoSlideValid,
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
  phoneNeedsUpdate?: boolean
  emailNeedsUpdate?: boolean
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
  const [swiperReady, setSwiperReady] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createdVehicleId, setCreatedVehicleId] = useState('')
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [isPending, startTransition] = useTransition()
  const invalidate = useInvalidateRiomobQueries()

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

  // Recalcula altura do Swiper quando o conteúdo do slide muda (erros, campos condicionais, uploads).
  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper || !swiperReady) return

    const slideEl = swiper.slides[currentIndex] as HTMLElement | undefined
    if (!slideEl || typeof ResizeObserver === 'undefined') {
      swiper.updateAutoHeight?.(0)
      return
    }

    const observer = new ResizeObserver(() => {
      swiper.updateAutoHeight?.(0)
    })
    observer.observe(slideEl)

    return () => observer.disconnect()
  }, [currentIndex, swiperReady])

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
    const contactOk = !ownerInfo.phoneNeedsUpdate && !ownerInfo.emailNeedsUpdate
    return contactOk && isVehicleInfoSlideValid(watchedValues)
  }, [watchedValues, ownerInfo.phoneNeedsUpdate, ownerInfo.emailNeedsUpdate])

  const isSlide2Valid = useCallback(() => {
    return isSerialPhotosSlideValid(watchedValues)
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

      const result = await createVehicle(payload)
      if (!result.success || !result.data?.id) {
        toast.error(result.error || 'Não foi possível cadastrar o veículo')
        return
      }

      await invalidate.afterCreate()
      setCreatedVehicleId(result.data.id)
      setDrawerOpen(true)
    })
  }, [form, invalidate])

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-4xl mx-auto pb-12">
        <SecondaryHeader
          fixed={false}
          onBack={goToPrev}
          disabled={isPending}
          className="max-w-4xl mb-2 md:mb-0"
        />

        <Swiper
          allowTouchMove={false}
          autoHeight
          onSwiper={swiper => {
            swiperRef.current = swiper
            setSwiperReady(true)
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
              phoneNeedsUpdate={ownerInfo.phoneNeedsUpdate}
              emailNeedsUpdate={ownerInfo.emailNeedsUpdate}
            />
          </SwiperSlide>

          <SwiperSlide key="serial-photos" className="h-auto!">
            <SerialPhotosSlide
              form={form}
              onUploadingChange={setIsUploadingFiles}
            />
          </SwiperSlide>
        </Swiper>

        <div className="mt-8 px-4">
          <CustomButton
            onClick={isLastSlide ? handleSubmit : goToNext}
            disabled={!isCurrentSlideValid() || isPending || isUploadingFiles}
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
