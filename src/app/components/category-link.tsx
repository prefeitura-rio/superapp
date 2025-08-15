'use client'

import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'
import type React from 'react'

interface Category {
  categorySlug: string
  name: string
  icon: React.ReactNode
}

interface CategoryLinkProps {
  category: Category
  position: number
  children: React.ReactNode
  href: string
}

export function CategoryLink({
  category,
  position,
  children,
  href,
}: CategoryLinkProps) {
  const handleClick = () => {
    sendGAEvent('event', 'category_click', {
      event_timestamp: new Date().toISOString(),
      category_name: category.name,
      position: position,
    })
  }

  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}
