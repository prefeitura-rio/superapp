'use client'

import { UserIcon } from '@/assets/icons'
import { Skeleton } from '@/components/ui/skeleton'
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
        <Skeleton className="rounded-full h-10 w-10" />
        <div className="flex flex-col space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href="/meu-perfil"
      className="flex items-center space-x-3"
      onClick={handleClick}
    >
      <div className="rounded-full bg-card w-10 h-10 flex items-center justify-center overflow-hidden">
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
      <div className="flex flex-col">
        <span className="text-base font-medium text-foreground">
          {isLoggedIn ? userName : 'Olá, Visitante!'}
        </span>
        <span className="text-sm font-normal text-muted-foreground">
          {isLoggedIn ? '' : 'Faça seu login'}
        </span>
      </div>
    </Link>
  )
}
