'use client'

import { Service1746Component } from '@/app/(app)/(logged-in-out)/services/category/[category-slug]/[...service-params]/components/1746-service'
import { CariocaDigitalServiceComponent } from '@/app/(app)/(logged-in-out)/services/category/[category-slug]/[...service-params]/components/carioca-digital-service'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchServiceById } from '@/lib/services-utils'
import { useRecaptcha } from '@/providers/recaptcha-provider'
import type { Service1746 } from '@/types/1746'
import type { CariocaDigitalService } from '@/types/carioca-digital'
import { useEffect, useState } from 'react'

interface ServiceWithRecaptchaProps {
  collection: string
  serviceId: string
  isLoggedIn: boolean
}

export default function ServiceWithRecaptcha({
  collection,
  serviceId,
  isLoggedIn,
}: ServiceWithRecaptchaProps) {
  const [serviceData, setServiceData] = useState<
    CariocaDigitalService | Service1746 | null
  >(null)
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { recaptchaToken, setRecaptchaToken, isVerified } = useRecaptcha()

  useEffect(() => {
    // If user is logged in, fetch service immediately
    if (isLoggedIn) {
      fetchServiceData()
      return
    }

    // If reCAPTCHA is not configured, fetch service immediately
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      fetchServiceData()
      return
    }

    // If already verified, fetch service
    if (isVerified && recaptchaToken) {
      fetchServiceData(recaptchaToken)
      return
    }

    // For non-authenticated users, show reCAPTCHA challenge
    setShowRecaptcha(true)
  }, [isLoggedIn, isVerified, recaptchaToken])

  const fetchServiceData = async (token?: string) => {
    setIsLoading(true)
    try {
      const data = await fetchServiceById(collection, serviceId, token)
      setServiceData(data)
    } catch (error) {
      console.error('Failed to fetch service:', error)
      setRecaptchaError('Failed to load service')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaToken = async (token: string) => {
    console.log('reCAPTCHA verification successful for service...')
    setRecaptchaToken(token)
    setShowRecaptcha(false)
    await fetchServiceData(token)
  }

  const handleRecaptchaError = (error: string) => {
    console.error('reCAPTCHA error:', error)
    setRecaptchaError(error)
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
        <SecondaryHeader title="Descrição do Serviço" showSearchButton />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-20 md:pt-22 pb-20">
            {/* Show skeleton loading while reCAPTCHA is active */}
            {/* Service Title Skeleton */}
            <Skeleton className="h-8 w-3/4 mb-2" />

            {/* Service Description Skeleton */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />

            {/* Access Service Button Skeleton */}
            <Skeleton className="h-12 w-48 mb-6 rounded-full" />

            {/* Divider */}
            <div className="border-b border-border mb-6" />

            {/* Prazo Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Custo Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Como solicitar Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Additional sections skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        {/* Hidden reCAPTCHA Component */}
        <div className="hidden">
          <RecaptchaEnterprise
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            action="fetch_service"
            onTokenReceived={handleRecaptchaToken}
            onError={handleRecaptchaError}
          />
        </div>

        {recaptchaError && (
          <div className="mt-4 text-sm text-destructive text-center">
            Erro na verificação: {recaptchaError}
          </div>
        )}
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
        <SecondaryHeader title="Descrição do Serviço" showSearchButton />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-20 md:pt-22 pb-20">
            {/* Service Title Skeleton */}
            <Skeleton className="h-8 w-3/4 mb-2" />

            {/* Service Description Skeleton */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />

            {/* Access Service Button Skeleton */}
            <Skeleton className="h-12 w-48 mb-6 rounded-full" />

            {/* Divider */}
            <div className="border-b border-border mb-6" />

            {/* Prazo Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Custo Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Como solicitar Section Skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Additional sections skeleton */}
            <div className="mb-4">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show the actual content with service data
  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title="Descrição do Serviço" showSearchButton />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-20 md:pt-22 pb-20">
          {collection === 'carioca-digital' && serviceData && (
            <CariocaDigitalServiceComponent
              serviceData={serviceData as CariocaDigitalService}
            />
          )}

          {collection === '1746' && serviceData && (
            <Service1746Component serviceData={serviceData as Service1746} />
          )}
        </div>
      </div>
    </div>
  )
}
