'use client'

import { sendGAEvent } from '@next/third-parties/google'
import type React from 'react'

interface Category {
  categorySlug: string
  name: string
  icon: React.ReactNode
}

interface CategoryButtonProps {
  category: Category
  position: number
  children: React.ReactNode
  onClick: () => void
}

export function CategoryButton({
  category,
  position,
  children,
  onClick,
}: CategoryButtonProps) {
  const handleClick = () => {
    sendGAEvent('event', 'category_click', {
      event_timestamp: new Date().toISOString(),
      category_name: category.name,
      position: position,
    })
    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative bg-card hover:bg-card/50 w-full aspect-square rounded-xl flex items-center justify-center transition cursor-pointer max-h-[90px]"
    >
      {children}
    </button>
  )
}
