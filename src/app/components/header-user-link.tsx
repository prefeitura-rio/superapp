'use client'

import { UserIcon } from '@/assets/icons'
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
}

export default function HeaderUserLink({
  userName,
  isLoggedIn,
  userAvatarUrl,
  userAvatarName,
  isLoading = false,
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
      <div className="flex items-center space-x-3">
        <Skeleton className="rounded-full h-11 w-11" />
      </div>
    )
  }

  // When not logged in, redirect to auth with home as return URL
  // When logged in, go to profile page
  const href = isLoggedIn ? '/meu-perfil' : buildAuthUrl('/')

  return (
    <Link
      href={href}
      className="flex items-center space-x-3"
      onClick={handleClick}
    >
      {!isLoggedIn && (
        <span className="text-sm font-normal text-muted-foreground">
          Faça seu login
        </span>
      )}
      <div className="rounded-full bg-card w-11 h-11 flex items-center justify-center overflow-hidden">
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
      </div>
    </Link>
  )
}
