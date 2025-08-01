'use client'

import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import type { Category } from '@/lib/categories'
import { fetchCategories } from '@/lib/categories'
import { useRecaptcha } from '@/providers/recaptcha-provider'
import { useEffect, useState } from 'react'
import HomeCategoriesGrid from './home-categories-grid'

interface HomeWithRecaptchaProps {
  isLoggedIn: boolean
}

export default function HomeWithRecaptcha({
  isLoggedIn,
}: HomeWithRecaptchaProps) {
  const [categories, setCategories] = useState<Category[] | undefined>(
    undefined
  )
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRecaptcha, setShowRecaptcha] = useState(false)

  const { recaptchaToken, setRecaptchaToken, isVerified } = useRecaptcha()

  useEffect(() => {
    // If user is logged in, fetch categories immediately
    if (isLoggedIn) {
      fetchCategoriesData()
      return
    }

    // If reCAPTCHA is not configured, fetch categories immediately
    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      console.warn(
        'reCAPTCHA site key not configured, fetching categories without verification'
      )
      fetchCategoriesData()
      return
    }

    // If already verified, fetch categories
    if (isVerified && recaptchaToken) {
      fetchCategoriesData(recaptchaToken)
      return
    }

    // For non-authenticated users, show reCAPTCHA challenge
    setShowRecaptcha(true)
  }, [isLoggedIn, isVerified, recaptchaToken])

  const fetchCategoriesData = async (token?: string) => {
    setIsLoading(true)
    try {
      const categoriesData = await fetchCategories(token)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setRecaptchaError('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaToken = async (token: string) => {
    console.log('reCAPTCHA verification successful, fetching categories...')
    setRecaptchaToken(token)
    setShowRecaptcha(false) // Hide reCAPTCHA after successful verification
    await fetchCategoriesData(token)
  }

  const handleRecaptchaError = (error: string) => {
    console.error('reCAPTCHA error:', error)
    setRecaptchaError(error)
    // Don't hide reCAPTCHA on error - let user try again
  }

  // Show loading state while fetching categories
  if (isLoading) {
    return <HomeCategoriesGrid categories={undefined} isLoading={true} />
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <div className="px-4 pb-4">
        <h3 className="pb-2 text-base font-medium text-foreground leading-5">
          Serviços
        </h3>
        {/* Show skeleton loading while reCAPTCHA is active */}
        <HomeCategoriesGrid categories={undefined} isLoading={true} />

        {/* Hidden reCAPTCHA Component */}
        <div>
          <RecaptchaEnterprise
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            action="fetch_categories"
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

  // Show categories if available
  if (categories) {
    return <HomeCategoriesGrid categories={categories} isLoading={false} />
  }

  // Fallback loading state
  return <HomeCategoriesGrid categories={undefined} isLoading={true} />
}
