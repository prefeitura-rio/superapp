'use client'

import { useAuthHeader } from '@/providers/auth-header-provider'
import MainHeader from './main-header'

interface ProfileHeaderWrapperProps {
  hideAvatar?: boolean
  menuHref?: string
}

export function ProfileHeaderWrapper({
  hideAvatar = false,
  menuHref,
}: ProfileHeaderWrapperProps) {
  const { data, isLoading } = useAuthHeader()

  return (
    <MainHeader
      userName={data?.userAvatarName ?? ''}
      isLoggedIn={data?.isLoggedIn ?? false}
      userAvatarUrl={data?.userAvatarUrl ?? null}
      userAvatarName={data?.userAvatarName ?? null}
      isLoading={isLoading}
      menuHref={menuHref}
      logoHref="/"
      hideAvatar={hideAvatar}
    />
  )
}
