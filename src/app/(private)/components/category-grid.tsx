'use client'
import type { Category } from '@/lib/categories'
import { useRouter } from 'next/navigation'
import type React from 'react'

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
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category, index) => (
          <div
            key={category.categorySlug}
            className="flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => handleCategoryClick(category.categorySlug)}
              className="relative bg-card hover:bg-card/50 w-full aspect-square rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              <div className="flex items-center justify-center w-full h-full text-foreground">
                {category.icon}
              </div>
            </button>
            <span className="mt-2 text-sm text-center text-foreground">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
