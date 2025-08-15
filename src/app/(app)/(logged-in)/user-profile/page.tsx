import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import InstallPWAButtonClient from '@/app/components/install-pwa-button-client'
import { LogoutButton } from '@/app/components/logout-button'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { UserIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { USER_PROFILE_MENU_ITEMS } from '@/constants/user-profile-menu-items'
import { formatCpf } from '@/lib/format-cpf'
import { getUserInfoFromToken } from '@/lib/user-info'
import { formatUserName } from '@/lib/utils'

export default async function ProfilePage() {
  const userInfo = await getUserInfoFromToken()

  return (
    <div className="pt-20 min-h-lvh max-w-4xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Perfil" />

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6 mb-10">
        <Avatar className="h-24 w-24 mb-4 border-2 border-border">
          <AvatarFallback className="bg-background">
            <UserIcon className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-1">
          {formatUserName(userInfo.name)}
        </h2>
        <p className="text-sm text-primary">{formatCpf(userInfo.cpf)}</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4">
        <nav className="space-y-1">
          {USER_PROFILE_MENU_ITEMS.map((item, index) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              variant={item.variant}
              isFirst={index === 0}
              isLast={false}
            />
          ))}

          {/* //Option to install the PWA */}
          <InstallPWAButtonClient />

          <LogoutButton />
        </nav>
      </div>
    </div>
  )
}
