'use client'

import { RecaptchaEnterprise } from '@/components/ui/recaptcha-enterprise'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/lib/categories'
import { fetchCategories } from '@/lib/categories'
import { useRecaptcha } from '@/providers/recaptcha-provider'
import { useEffect, useState } from 'react'
import { CategoryGrid } from './category-grid'

interface CategoryGridWithRecaptchaProps {
  title: React.ReactNode
  isLoggedIn: boolean
}

export function CategoryGridWithRecaptcha({
  title,
  isLoggedIn,
}: CategoryGridWithRecaptchaProps) {
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
    return <CategoryGridSkeleton title={title} />
  }

  // Show reCAPTCHA challenge for non-authenticated users
  if (showRecaptcha && !isLoggedIn) {
    return (
      <div className="text-foreground space-y-2 px-4 pt-8 pb-24">
        <h2 className="text-md font-medium">{title}</h2>
        {/* Show skeleton loading while reCAPTCHA is active */}
        <CategoryGridSkeleton title={null} />

        {/* Hidden reCAPTCHA Component */}
        <div className="hidden">
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
    return <CategoryGrid title={title} categories={categories} />
  }

  // Fallback loading state
  return <CategoryGridSkeleton title={title} />
}

function CategoryGridSkeleton({ title }: { title: React.ReactNode }) {
  return (
    <div className="text-foreground space-y-2 px-4 pt-8 pb-24">
      {title && <h2 className="text-md font-medium">{title}</h2>}
      <div className="grid grid-cols-2 min-[360px]:grid-cols-3 min-[900px]:grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="w-full aspect-square rounded-xl max-h-[90px]" />
            <Skeleton className="mt-2 h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
