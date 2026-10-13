'use client'

import { useAuthHeader } from '@/providers/auth-header-provider'
import MainHeader from './main-header'

interface ProfileHeaderWrapperProps {
  hideAvatar?: boolean
  menuHref?: string
  /**
   * Título da página, renderizado como `<h1>` visualmente oculto (`sr-only`).
   * O MainHeader não exibe título, então sem isto a página fica sem h1 para
   * leitores de tela — que era papel do antigo SecondaryHeader.
   */
  title?: string
}

export function ProfileHeaderWrapper({
  hideAvatar = false,
  menuHref,
  title,
}: ProfileHeaderWrapperProps) {
  const { data, isLoading } = useAuthHeader()

  return (
    <>
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
      {title && <h1 className="sr-only">{title}</h1>}
    </>
  )
}
