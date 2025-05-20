import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Briefcase,
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
    <div className="pb-25 pt-20 max-w-md mx-auto text-white flex flex-col">
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
        <p className="text-sm text-gray-500">408.567.553-13</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-5">
        <nav className="space-y-1">
          <MenuItem
            icon={<User className="h-5 w-5" />}
            label="Informações pessoais"
            href="/user-profile/user-personal-info"
            isFirst={true}
          />
          <MenuItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Trabalho"
            href="/user-profile/user-job-info"
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
  isFirst = false,
}: { icon: React.ReactNode; label: string; href?: string; isFirst?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center justify-between py-5 text-white',
        'border-b color-border', isFirst && 'border-t color-border',
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
