'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchServicesByCategory } from '@/lib/services-utils'
import { useRecaptcha } from '@/providers/recaptcha-provider'
import type { ServicesApiResponse } from '@/types/service'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'

interface CategoryWithRecaptchaProps {
  categorySlug: string
  isLoggedIn: boolean
  categoryName: string
}

export default function CategoryWithRecaptcha({
  categorySlug,
  isLoggedIn,
  categoryName,
}: CategoryWithRecaptchaProps) {
  const [servicesData, setServicesData] = useState<ServicesApiResponse | null>(
    null
  )
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { recaptchaToken, setRecaptchaToken, isVerified } = useRecaptcha()

  useEffect(() => {
    // If user is logged in, fetch services immediately
    if (isLoggedIn) {
      fetchServicesData()
      return
    }

    // If reCAPTCHA is not configured, fetch services immediately
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      fetchServicesData()
      return
    }

    // If already verified, fetch services
    if (isVerified && recaptchaToken) {
      fetchServicesData(recaptchaToken)
      return
    }

    // For non-authenticated users, show reCAPTCHA challenge
    setShowRecaptcha(true)
  }, [isLoggedIn, isVerified, recaptchaToken])

  const fetchServicesData = async (token?: string) => {
    setIsLoading(true)
    try {
      const data = await fetchServicesByCategory(categorySlug, token)
      setServicesData(data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setRecaptchaError('Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaToken = async (token: string) => {
    console.log('reCAPTCHA verification successful for category services...')
    setRecaptchaToken(token)
    setShowRecaptcha(false)
    await fetchServicesData(token)
  }

  const handleRecaptchaError = (error: string) => {
    console.error('reCAPTCHA error:', error)
    setRecaptchaError(error)
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
        <SecondaryHeader title={categoryName} showSearchButton />
        <div className="min-h-screen text-white">
          <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-20">
            <nav className="flex flex-col">
              {/* Show skeleton loading while reCAPTCHA is active */}
              {Array.from({ length: 8 }, (_, index) => (
                <SkeletonMenuItem key={index} />
              ))}
            </nav>
          </div>
        </div>

        {/* Hidden reCAPTCHA Component */}
        <div className="hidden">
          <RecaptchaEnterprise
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            action="fetch_services"
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
        <SecondaryHeader title={categoryName} showSearchButton />
        <div className="min-h-screen text-white">
          <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-20">
            <nav className="flex flex-col">
              {/* Generate multiple skeleton menu items */}
              {Array.from({ length: 8 }, (_, index) => (
                <SkeletonMenuItem key={index} />
              ))}
            </nav>
          </div>
        </div>
      </div>
    )
  }

  // Show the actual content with services data
  return (
    <div className="min-h-lvh max-w-4xl mx-auto flex flex-col">
      <SecondaryHeader title={categoryName} showSearchButton />
      <div className="min-h-screen text-white">
        <div className="max-w-4xl mx-auto pt-20 md:pt-22 px-4 pb-20">
          <nav className="flex flex-col">
            {servicesData?.hits?.length ? (
              servicesData.hits.map(hit => (
                <MenuItem
                  key={hit.document.id}
                  href={`/services/category/${categorySlug}/${hit.document.id}/${hit.document.collection}`}
                >
                  <span className="text-card-foreground">
                    {hit.document.titulo}
                  </span>
                </MenuItem>
              ))
            ) : servicesData && servicesData.hits?.length === 0 ? (
              <div className="py-8 text-center text-card-foreground">
                <p>Nenhum serviço encontrado para esta categoria.</p>
              </div>
            ) : null}
          </nav>
        </div>
      </div>
    </div>
  )
}

interface MenuItemProps {
  href: string
  children: React.ReactNode
  disabled?: boolean
}

function MenuItem({ href, children, disabled = false }: MenuItemProps) {
  const content = (
    <div className="border-b border-border flex items-center justify-between py-5">
      <div className="flex items-center justify-between flex-1 pr-4">
        {children}
      </div>
      <ChevronRight className="h-5 w-5 text-primary" />
    </div>
  )

  return (
    <Link href={href} className="hover:brightness-90 transition-colors">
      {content}
    </Link>
  )
}

function SkeletonMenuItem() {
  return (
    <div className="border-b border-border flex items-center justify-between py-5">
      <div className="flex items-center justify-between flex-1 pr-4">
        <Skeleton className="h-5 w-3/4" />
      </div>
      <ChevronRight className="h-5 w-5 text-primary opacity-50" />
    </div>
  )
}
