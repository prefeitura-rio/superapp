'use client'
import type { Category } from '@/lib/categories'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { CategoryButton } from './category-button'

interface CategoryGridProps {
  title: React.ReactNode
  categories: Category[]
}

export function CategoryGrid({ title, categories }: CategoryGridProps) {
  const router = useRouter()

  const handleCategoryClick = (slug: string) => {
    router.push(`/services/category/${slug}`)
  }

  return (
    <div className="text-foreground space-y-2 px-4 pt-8 pb-24">
      <h2 className="text-md font-medium">{title}</h2>
      <div className="grid grid-cols-2 min-[360px]:grid-cols-3 min-[900px]:grid-cols-4 gap-2 mb-12">
        {categories.map((category, index) => (
          <div
            key={category.categorySlug}
            className="flex flex-col items-center"
          >
            <CategoryButton
              category={category}
              position={index + 1}
              onClick={() => handleCategoryClick(category.categorySlug)}
            >
              <div className="flex items-center justify-center w-full h-full text-foreground">
                {category.icon}
              </div>
            </CategoryButton>
            <span className="mt-2 text-sm text-center text-foreground">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
