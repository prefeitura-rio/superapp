'use client'

import { ArrowUpRight } from '@/assets/icons/arrow-up-right'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import type { ModelsServiceDocument } from '@/http-busca-search/models/modelsServiceDocument'
import type { AppSubcategory } from '@/lib/carta-servicos/types'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface CategorySubcategoriesAccordionProps {
  categorySlug: string
  categoryName?: string
  subcategories: AppSubcategory[]
  /** When SSR failed to load subcategories, refetch on the client. */
  shouldRefetch?: boolean
}

interface SubcategoryWithServices extends AppSubcategory {
  services?: ModelsServiceDocument[]
  isLoading?: boolean
}

function getSubcategoryKey(subcategory: AppSubcategory): string {
  return subcategory.slug ?? subcategory.name ?? ''
}

export function CategorySubcategoriesAccordion({
  categorySlug,
  categoryName,
  subcategories,
  shouldRefetch = false,
}: CategorySubcategoriesAccordionProps) {
  const [openItem, setOpenItem] = useState<string>('')
  const [isRefetchingList, setIsRefetchingList] = useState(shouldRefetch)
  const [subcategoriesWithServices, setSubcategoriesWithServices] = useState<
    SubcategoryWithServices[]
  >(subcategories.map(sub => ({ ...sub })))

  // Recover from intermittent SSR failures without waiting for ISR
  useEffect(() => {
    if (!shouldRefetch) return

    let cancelled = false

    const refetchSubcategories = async () => {
      setIsRefetchingList(true)
      try {
        const response = await fetch(
          `/api/categories/${encodeURIComponent(categorySlug)}/subcategories`
        )

        if (!response.ok) {
          throw new Error(`Failed to refetch subcategories: ${response.status}`)
        }

        const data = await response.json()
        const nextSubcategories: AppSubcategory[] = data?.subcategories || []

        if (!cancelled) {
          setSubcategoriesWithServices(
            nextSubcategories.map(sub => ({ ...sub }))
          )
        }
      } catch (error) {
        console.error('Error refetching subcategories:', error)
      } finally {
        if (!cancelled) {
          setIsRefetchingList(false)
        }
      }
    }

    refetchSubcategories()

    return () => {
      cancelled = true
    }
  }, [shouldRefetch, categorySlug])

  // Fetch services when a subcategory is opened
  useEffect(() => {
    if (!openItem) return

    setSubcategoriesWithServices(prev => {
      const subcategory = prev.find(sub => getSubcategoryKey(sub) === openItem)

      // Only fetch if services haven't been loaded yet
      if (subcategory && !subcategory.services && !subcategory.isLoading) {
        // Mark as loading
        const updated = prev.map(sub =>
          getSubcategoryKey(sub) === openItem
            ? { ...sub, isLoading: true }
            : sub
        )

        // Fetch services
        const loadServices = async () => {
          try {
            const encodedSubcategory = encodeURIComponent(openItem)
            const categoryParam = categoryName
              ? `&category=${encodeURIComponent(categoryName)}`
              : ''
            const response = await fetch(
              `/api/subcategories/${encodedSubcategory}/services?page=1&per_page=50${categoryParam}`
            )

            if (!response.ok) {
              throw new Error(`Failed to fetch services: ${response.status}`)
            }

            const data = await response.json()
            const services = data?.services || []

            setSubcategoriesWithServices(current =>
              current.map(sub =>
                getSubcategoryKey(sub) === openItem
                  ? { ...sub, services, isLoading: false }
                  : sub
              )
            )
          } catch (error) {
            console.error('Error loading services:', error)
            setSubcategoriesWithServices(current =>
              current.map(sub =>
                getSubcategoryKey(sub) === openItem
                  ? { ...sub, services: [], isLoading: false }
                  : sub
              )
            )
          }
        }

        loadServices()
        return updated
      }

      return prev
    })
  }, [openItem, categoryName])

  if (isRefetchingList && subcategoriesWithServices.length === 0) {
    return (
      <div className="px-4 mt-6 pb-20 space-y-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="rounded-2xl h-14 w-full bg-card" />
        ))}
      </div>
    )
  }

  if (subcategoriesWithServices.length === 0) {
    return null
  }

  return (
    <div className="px-4 mt-6 pb-20">
      <Accordion
        type="single"
        collapsible
        className="space-y-2"
        value={openItem}
        onValueChange={setOpenItem}
      >
        {subcategoriesWithServices.map(subcategory => {
          const subcategoryId = getSubcategoryKey(subcategory)
          const services = subcategory.services || []
          const isLoading = subcategory.isLoading

          return (
            <AccordionItem
              key={subcategoryId}
              value={subcategoryId}
              className="rounded-2xl bg-card px-4"
            >
              <AccordionTrigger
                className="hover:no-underline py-4 items-center"
                chevronClassName="text-primary"
              >
                <span className="text-sm sm:text-base font-medium text-foreground">
                  {subcategory.name}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }, (_, index) => (
                      <Skeleton
                        key={index}
                        className="flex items-center justify-between rounded-md bg-secondary h-12"
                      />
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="space-y-2">
                    {services.map(service => {
                      if (!service.slug || !service.title) return null

                      return (
                        <Link
                          key={service.slug}
                          href={`/servicos/categoria/${categorySlug}/${service.slug}`}
                          className="flex bg-secondary! items-center justify-between rounded-md p-4 transition-colors group"
                        >
                          <span className="text-sm text-foreground flex-1 pr-2">
                            {service.title}
                          </span>
                          <ArrowUpRight className="size-5 text-primary! shrink-0 group-hover:text-foreground transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-foreground-light">
                    Nenhum serviço encontrado nesta subcategoria.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
