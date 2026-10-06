'use client'

import { UserIcon } from '@/assets/icons'
import { MenuIcon } from '@/assets/icons/menu-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { buildAuthUrl } from '@/constants/url'
import { sendGAEvent } from '@next/third-parties/google'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderUserLinkProps {
  userName: string
  isLoggedIn: boolean
  userAvatarUrl?: string | null
  userAvatarName?: string | null
  isLoading?: boolean
  menuHref?: string
  returnUrl?: string
  hideAvatar?: boolean
}

export default function HeaderUserLink({
  userName,
  isLoggedIn,
  userAvatarUrl,
  userAvatarName,
  isLoading = false,
  menuHref,
  returnUrl = '/',
  hideAvatar = false,
}: HeaderUserLinkProps) {
  const handleClick = () => {
    if (isLoggedIn) {
      sendGAEvent('event', 'user_profile_header_cta', {
        event_timestamp: new Date().toISOString(),
      })
    } else {
      sendGAEvent('event', 'ola_visitante_cta', {
        event_timestamp: new Date().toISOString(),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        {!hideAvatar && <Skeleton className="rounded-full h-11 w-11" />}
        <Skeleton className="rounded-full h-11 w-11" />
      </div>
    )
  }

  const profileHref = isLoggedIn ? '/meu-perfil' : buildAuthUrl(returnUrl)
  const resolvedMenuHref =
    menuHref ?? (isLoggedIn ? undefined : buildAuthUrl(returnUrl))

  return (
    <div className="flex items-center space-x-2">
      {!hideAvatar && (
        <Link
          href={profileHref}
          className="rounded-full bg-card hover:bg-secondary w-11 h-11 flex items-center justify-center overflow-hidden"
          onClick={handleClick}
        >
          {isLoggedIn && userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userAvatarName || 'Avatar do usuário'}
              width={48}
              height={48}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </Link>
      )}
      {resolvedMenuHref ? (
        <Link
          href={resolvedMenuHref}
          className="rounded-full bg-card hover:bg-secondary p-3 flex items-center justify-center"
        >
          <MenuIcon className="h-5 w-5 text-foreground" />
          <span className="sr-only">Menu</span>
        </Link>
      ) : (
        <button
          type="button"
          className="rounded-full bg-card p-3 flex items-center justify-center"
        >
          <MenuIcon className="h-5 w-5 text-foreground" />
          <span className="sr-only">Menu</span>
        </button>
      )}
    </div>
  )
}
