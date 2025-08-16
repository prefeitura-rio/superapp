'use client'

import { UserIcon } from '@/assets/icons'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import { formatUserName } from '@/lib/utils'
import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'

interface HeaderUserLinkProps {
  userName: string
  isLoggedIn: boolean
}

export default function HeaderUserLink({
  userName,
  isLoggedIn,
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

  return (
    <Link
      href={
        isLoggedIn ? '/user-profile' : REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
      }
      className="flex items-center space-x-3"
      onClick={handleClick}
    >
      <div className="rounded-full bg-card p-3">
        <UserIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-medium text-foreground">
          {isLoggedIn ? formatUserName(userName) : 'Olá, Visitante!'}
        </span>
        <span className="text-sm font-normal text-muted-foreground">
          {isLoggedIn ? '' : 'Faça seu login'}
        </span>
      </div>
    </Link>
  )
}
