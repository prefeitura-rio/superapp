'use client'
import { useRouter } from 'next/navigation'
import type React from 'react'

interface Category {
  name: string
  icon: React.ReactNode
  tag?: string
}

interface CategoryGridProps {
  title: React.ReactNode
  categories: Category[]
}

export function CategoryGrid({ title, categories }: CategoryGridProps) {
  const router = useRouter()
  return (
    <div className="text-foreground space-y-4 px-5 pt-4 pb-24">
      <h2 className="text-md font-medium">{title}</h2>
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="relative bg-card/45 w-full aspect-square rounded-xl flex items-center justify-center hover:bg-card/30 transition border-2 border-card"
              {...(index === 0
                ? {
                    onClick: () => router.push('/services/category'),
                    style: { cursor: 'pointer' },
                  }
                : {})}
            >
              <div className="flex items-center justify-center w-full h-full text-foreground">
                {category.icon}
              </div>
              {category.tag && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-white bg-orange-600 px-2 py-0.5 rounded-full">
                  {category.tag}
                </span>
              )}
            </div>
            <span className="mt-2 text-sm text-center text-foreground">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
