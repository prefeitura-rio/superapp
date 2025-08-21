'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { Bell, Book, MessageCircleQuestion, Star } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="pb-25 pt-20 max-w-4xl mx-auto text-white flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" />

      {/* Menu Items */}
      <div className="flex-1 px-4">
        <nav className="space-y-1">
          <MenuItem
            icon={<Book className="h-5 w-5" />}
            label="Candidaturas"
            href="/services/jobs/applications"
            isFirst={true}
          />
          <MenuItem
            icon={<Star className="h-5 w-5" />}
            label="Favoritos"
            href="/services/jobs/favorites"
          />
          <MenuItem
            icon={<Bell className="h-5 w-5" />}
            label="Alertas"
            // href="/meu-perfil/endereco"
            href="/services/jobs/alerts"
          />
          <MenuItem
            icon={<MessageCircleQuestion className="h-5 w-5" />}
            label="FAQ"
            href="/services/jobs/faq"
          />
        </nav>
      </div>
    </div>
  )
}
