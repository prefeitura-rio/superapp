'use client'

import { SecondaryHeader } from '@/app/components/secondary-header'
import { MenuItem } from '@/components/ui/custom/menu-item'

export default function ProfilePage() {
  return (
    <div className="pb-25 pt-20 max-w-4xl mx-auto text-white flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" backURL="/services/courses" />

      {/* Menu Items */}
      <div className="flex-1 px-4">
        <nav className="space-y-1">
          <MenuItem
            label="Meus cursos"
            href="/services/courses/my-courses"
            isFirst={true}
          />
          <MenuItem
            label="Favoritos"
            href="/services/courses/my-courses?favorites=true"
          />
          <MenuItem label="FAQ" href="/services/courses/faq" />
        </nav>
      </div>
    </div>
  )
}
