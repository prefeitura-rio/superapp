'use client'

import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'
import type React from 'react'

interface NavigationItem {
  href: string
  icon: React.ElementType
  label: string
}

interface NavigationLinkProps {
  item: NavigationItem
  isActive: boolean
  children: React.ReactNode
}

export function NavigationLink({
  item,
  isActive,
  children,
}: NavigationLinkProps) {
  const handleClick = () => {
    sendGAEvent('event', 'float_navigation_click', {
      event_timestamp: new Date().toISOString(),
      navigation_item: item.label,
      navigation_url: item.href,
    })
  }

  return (
    <Link
      href={item.href}
      className="group flex items-center justify-center"
      aria-label={item.label}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
