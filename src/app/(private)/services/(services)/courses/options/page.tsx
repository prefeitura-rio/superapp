'use client'

import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import { cn } from '@/lib/utils'
import {
  Bell,
  Book,
  ChevronRight,
  MessageCircleQuestion,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import type React from 'react'

export default function ProfilePage() {
  return (
    <div className="pb-25 pt-20 max-w-md mx-auto text-white flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" />

      {/* Menu Items */}
      <div className="flex-1 px-5">
        <nav className="space-y-1">
          <MenuItem
            icon={<Book className="h-5 w-5" />}
            label="Meus cursos"
            href="/services/courses/subscribed-courses"
            isFirst={true}
          />
          <MenuItem
            icon={<Star className="h-5 w-5" />}
            label="Favoritos"
            href="/services/courses/favorites"
          />
          <MenuItem
            icon={<Bell className="h-5 w-5" />}
            label="Alertas"
            // href="/user-profile/user-address"
            href="/services/courses/alerts"
          />
          <MenuItem
            icon={<MessageCircleQuestion className="h-5 w-5" />}
            label="FAQ"
            href="/services/courses/faq"
          />
        </nav>
      </div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  href = '#',
  onClick,
  isFirst = false,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  isFirst?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between py-5 text-white',
        'border-b color-border',
        isFirst && 'border-t color-border'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-primary" />
    </Link>
  )
}
