'use client'

import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'
import type React from 'react'

interface MostAccessedService {
  id: string
  href: string
  icon: string
  title: string
  description: string
}

interface MostAccessedServiceLinkProps {
  service: MostAccessedService
  position: number
  children: React.ReactNode
  className?: string
}

export function MostAccessedServiceLink({
  service,
  position,
  children,
  className,
}: MostAccessedServiceLinkProps) {
  const handleClick = () => {
    sendGAEvent('event', 'most_accessed_service_click', {
      event_timestamp: new Date().toISOString(),
      title: service.title,
      description: service.description,
      position: position,
      category: service.href.split('/')[3], // Extract category from href
    })
  }

  return (
    <Link href={service.href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
