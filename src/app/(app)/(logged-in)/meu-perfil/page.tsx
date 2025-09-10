import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import InstallPWAButtonClient from '@/app/components/install-pwa-button-client'
import { LogoutButton } from '@/app/components/logout-button'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { EditIcon, UserIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { USER_PROFILE_MENU_ITEMS } from '@/constants/user-profile-menu-items'
import { getDalCitizenCpf, getDalCitizenCpfAvatar } from '@/lib/dal'
import { formatCpf } from '@/lib/format-cpf'
import { getUserInfoFromToken } from '@/lib/user-info'
import { getDisplayName } from '@/lib/utils'
import Link from 'next/link'

// Revalidate this page when needed
export const revalidate = 0

export default async function ProfilePage() {
  const userInfo = await getUserInfoFromToken()

  let userAvatarUrl: string | null = null
  let userAvatarName: string | null = null
  let userDisplayName = ''

  // Buscar dados completos do usuário para obter nome_exibicao
  if (userInfo.cpf) {
    try {
      const userDataResponse = await getDalCitizenCpf(userInfo.cpf)
      if (userDataResponse.status === 200) {
        const userData = userDataResponse.data
        userDisplayName = getDisplayName(userData.nome_exibicao, userInfo.name)
      } else {
        userDisplayName = getDisplayName(undefined, userInfo.name)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      userDisplayName = getDisplayName(undefined, userInfo.name)
    }
  }

  try {
    const userAvatarResponse = await getDalCitizenCpfAvatar(userInfo.cpf)
    if (userAvatarResponse.status === 200 && userAvatarResponse.data.avatar) {
      userAvatarUrl = userAvatarResponse.data.avatar.url || null
      userAvatarName = userAvatarResponse.data.avatar.name || null
    }
  } catch (error) {
    console.log('Could not fetch user avatar:', error)
  }

  return (
    <div className="pt-20 min-h-lvh max-w-4xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="Perfil" route="/" />

      {/* Profile Info */}
      <div className="flex flex-col items-center mt-6 mb-10">
        <Link href="/meu-perfil/avatar" className="group relative">
          <div className="relative">
            <Avatar className="h-24 w-24 mb-4 bg-card border-2 border-border group-hover:shadow-lg transition-shadow duration-300">
              {userAvatarUrl ? (
                <AvatarImage
                  src={userAvatarUrl}
                  alt={userAvatarName || 'Avatar do usuário'}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              ) : null}
              <AvatarFallback className="bg-background">
                <UserIcon className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>

            {/* Overlay com ícone de lápis no hover */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <EditIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </Link>
        <h2 className="text-xl font-semibold mb-1">{userDisplayName}</h2>
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
