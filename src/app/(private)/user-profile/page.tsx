import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  ChevronRight,
  LogOut,
  MapIcon,
  Settings,
  User,
} from 'lucide-react'
import Link from 'next/link'
import type React from 'react'
import { SecondaryHeader } from '../components/secondary-header'

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-20 max-w-md mx-auto text-white flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Perfil" />

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6 mb-10">
        <Avatar className="h-24 w-24 mb-4 border-2 border-gray-700">
          <AvatarFallback className="bg-gray-800 text-gray-400">
            <User className="h-6 w-6 text-gray-100" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-1">Marina Duarte</h2>
        <p className="text-gray-400">408.567.553-13</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4">
        <nav className="space-y-1">
          <MenuItem
            icon={<User className="h-5 w-5" />}
            label="Informações pessoais"
            href="/user-profile/user-personal-info"
          />
          <MenuItem
            icon={<MapIcon className="h-5 w-5" />}
            label="Endereço"
            href="/user-profile/user-address"
          />
          <MenuItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Autorizações"
            href="/user-profile/user-authorizations"
          />
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            label="Configurações"
            href="/user-profile/user-settings"
          />
          <MenuItem
            icon={<LogOut className="h-5 w-5" />}
            label="Sair"
            href="/api/auth/logout"
            isLast
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
  isLast = false,
}: { icon: React.ReactNode; label: string; href?: string; isLast?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between py-4 text-white',
        !isLast && 'border-b border-gray-800'
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-500" />
    </Link>
  )
}
