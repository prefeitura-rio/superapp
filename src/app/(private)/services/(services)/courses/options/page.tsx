'use client'

import { SecondaryHeader } from '@/app/(private)/components/secondary-header'
import { Bell, Book, MessageCircleQuestion, Star } from 'lucide-react'
import { MenuItem } from '../../../../../../components/ui/custom/menu-item'

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
