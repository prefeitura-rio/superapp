import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import InstallPWAButtonClient from '@/app/components/install-pwa-button-client'
import { LogoutButton } from '@/app/components/logout-button'
import { SecondaryHeader } from '@/app/components/secondary-header'
import { UserIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { USER_PROFILE_MENU_ITEMS } from '@/constants/user-profile-menu-items'
import { getDalCitizenCpf, getDalCitizenCpfAvatar } from '@/lib/dal'
import { formatCpf } from '@/lib/format-cpf'
import { getUserInfoFromToken } from '@/lib/user-info'
import { formatUserName, getDisplayName } from '@/lib/utils'

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
        userDisplayName = formatUserName(userInfo.name)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      userDisplayName = formatUserName(userInfo.name)
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
        <Avatar className="h-24 w-24 mb-4 border-2 border-border">
          {userAvatarUrl ? (
            <AvatarImage
              src={userAvatarUrl}
              alt={userAvatarName || 'Avatar do usuário'}
            />
          ) : null}
          <AvatarFallback className="bg-background">
            <UserIcon className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
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
