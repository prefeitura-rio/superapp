import { SecondaryHeader } from '@/app/components/secondary-header'
import type { ModelsAvatarsListResponse } from '@/http/models'
import { getDalAvatars, getDalCitizenCpfAvatar } from '@/lib/dal'
import { getUserInfoFromToken } from '@/lib/user-info'
import { AvatarSelector } from './components/avatar-selector'

// Revalidate this page when needed
export const revalidate = 0

export default async function AvatarPage() {
  const userInfo = await getUserInfoFromToken()

  let avatars: ModelsAvatarsListResponse = {
    data: [],
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0,
  }
  let currentUserAvatar: string | null = null
  let error = null

  try {
    // Fetch available avatars using DAL
    const avatarsResponse = await getDalAvatars()
    if (avatarsResponse.status === 200) {
      avatars = avatarsResponse.data
    } else {
      error = 'Erro ao carregar avatares'
    }

    // Fetch user's current avatar if avatars were loaded successfully
    if (!error && userInfo.cpf) {
      try {
        const userAvatarResponse = await getDalCitizenCpfAvatar(userInfo.cpf)
        if (
          userAvatarResponse.status === 200 &&
          userAvatarResponse.data.avatar_id
        ) {
          currentUserAvatar = userAvatarResponse.data.avatar_id
        }
      } catch (avatarErr) {
        // Silently fail for current avatar - not critical
        console.log('Could not fetch current user avatar:', avatarErr)
      }
    }
  } catch (err) {
    error = 'Erro ao carregar avatares'
    console.error('Error fetching avatars:', err)
  }

  if (error) {
    return (
      <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
        <SecondaryHeader title="" route="/meu-perfil" className="max-w-xl" />
        <div className="px-4 mt-6 text-center">
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    )
  }

  // Filter out inactive avatars, ensure required fields exist, and only show Avatar 1-12
  const availableAvatars =
    avatars.data?.filter(
      avatar => avatar.is_active && avatar.id && avatar.url && avatar.name
    ) || []

  if (availableAvatars.length === 0) {
    return (
      <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
        <SecondaryHeader title="" route="/meu-perfil" className="max-w-xl" />
        <div className="px-4 mt-6 text-center">
          <p className="text-muted-foreground">
            Nenhum avatar disponível no momento
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Tente novamente mais tarde
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-4 min-h-lvh max-w-xl mx-auto text-foreground flex flex-col">
      {/* Header */}
      <SecondaryHeader title="" route="/meu-perfil" className="max-w-xl" />

      {/* Avatar Grid */}
      <AvatarSelector
        avatars={availableAvatars}
        currentAvatarId={currentUserAvatar}
      />
    </div>
  )
}
