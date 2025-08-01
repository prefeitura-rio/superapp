'use client'

import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import { useRecaptcha } from '@/providers/recaptcha-provider'
import { useEffect, useState } from 'react'

interface ServicesWithRecaptchaProps {
  children: React.ReactNode
  isLoggedIn: boolean
}

export default function ServicesWithRecaptcha({
  children,
  isLoggedIn,
}: ServicesWithRecaptchaProps) {
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  const { setRecaptchaToken, isVerified } = useRecaptcha()

  useEffect(() => {
    // If user is logged in, no reCAPTCHA needed
    if (isLoggedIn) {
      return
    }

    // If reCAPTCHA is not configured, no verification needed
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      return
    }

    // If already verified, no need to show reCAPTCHA
    if (isVerified) {
      return
    }

    // For non-authenticated users, show reCAPTCHA challenge
    setShowRecaptcha(true)
  }, [isLoggedIn, isVerified])

  const handleRecaptchaToken = async (token: string) => {
    console.log('reCAPTCHA verification successful for services...')
    setRecaptchaToken(token)
    setShowRecaptcha(false)
  }

  const handleRecaptchaError = (error: string) => {
    console.error('reCAPTCHA error:', error)
    setRecaptchaError(error)
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <main className="flex max-w-4xl mx-auto flex-col bg-background text-foreground">
        {/* Header Skeleton */}
        <header className="px-4 py-6 flex justify-between items-start">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
        </header>

        {/* Most Accessed Service Cards Skeleton */}
        <div className="px-4 mb-6">
          <div className="h-6 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 h-32 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Category Grid Skeleton */}
        <div className="px-4">
          <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="aspect-square bg-muted animate-pulse rounded-lg"
              />
            ))}
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
      </main>
    )
  }

  // Show the actual content
  return <>{children}</>
}
