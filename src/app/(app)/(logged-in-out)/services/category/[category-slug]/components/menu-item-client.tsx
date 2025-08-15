'use client'

import { sendGAEvent } from '@next/third-parties/google'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

interface MenuItemClientProps {
  href: string
  children: React.ReactNode
  title: string
  description: string
  category: string
  listPosition: number
  disabled?: boolean
}

export function MenuItemClient({
  href,
  children,
  title,
  description,
  category,
  listPosition,
  disabled = false,
}: MenuItemClientProps) {
  const handleClick = () => {
    sendGAEvent('event', 'category_service_click', {
      event_timestamp: new Date().toISOString(),
      title,
      description,
      category,
      list_position: listPosition,
    })
  }

  const content = (
    <div className="border-b border-border flex items-center justify-between py-5">
      <div className="flex items-center justify-between flex-1 pr-4">
        {children}
      </div>
      <ChevronRight className="h-5 w-5 text-primary" />
    </div>
  )

  return (
    <Link
      href={href}
      className="hover:brightness-90 transition-colors"
      onClick={handleClick}
    >
      {content}
    </Link>
  )
}
