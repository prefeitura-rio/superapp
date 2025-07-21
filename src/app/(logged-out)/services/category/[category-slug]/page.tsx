import { SecondaryHeader } from '@/app/components/secondary-header'
import {
  fetchServicesByCategory,
  getCategoryNameBySlug,
} from '@/lib/services-utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ 'category-slug': string }>
}) {
  const { 'category-slug': categorySlug } = await params
  const categoryName = await getCategoryNameBySlug(categorySlug)

  // Fetch services data from API
  const servicesData = await fetchServicesByCategory(categorySlug)

  return (
    <div className="min-h-lvh max-w-md mx-auto flex flex-col">
      <SecondaryHeader title={categoryName} showSearchButton />
      <div className="min-h-screen text-white">
        <div className="max-w-md mx-auto pt-20 px-4 pb-20">
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
            ) : (
              <div className="py-8 text-center text-card-foreground">
                <p>Nenhum serviço encontrado para esta categoria.</p>
              </div>
            )}
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
