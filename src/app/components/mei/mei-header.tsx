'use client'

import { UserIcon } from '@/assets/icons'
import { MenuIcon } from '@/assets/icons/menu-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  oportunidadesCariocasLogo,
  oportunidadesCariocasLogoDark,
} from '@/constants/bucket'
import { buildAuthUrl } from '@/constants/url'
import Image from 'next/image'
import Link from 'next/link'

interface MeiHeaderProps {
  isLoggedIn: boolean
  isLoading?: boolean
  userAvatarUrl?: string | null
  userAvatarName?: string | null
}

export function MeiHeader({
  isLoggedIn,
  isLoading = false,
  userAvatarUrl,
  userAvatarName,
}: MeiHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
      <div className="mx-auto md:px-4 flex max-w-4xl items-center justify-between">
        <div className="flex justify-center">
          <Image
            src={oportunidadesCariocasLogo}
            alt="Oportunidades Cariocas Logo"
            width={170}
            height={38}
            className="dark:hidden"
            priority
          />
          <Image
            src={oportunidadesCariocasLogoDark}
            alt="Oportunidades Cariocas Logo"
            width={170}
            height={38}
            className="hidden dark:block"
            priority
          />
        </div>

        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Skeleton className="rounded-full h-11 w-11" />
          ) : isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <Link href="/meu-perfil">
                <div className="rounded-full bg-card hover:bg-secondary w-11 h-11 flex items-center justify-center overflow-hidden">
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt={userAvatarName || 'Avatar'}
                      width={44}
                      height={44}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
              </Link>
              <Link
                href="/servicos/mei/menu"
                className="rounded-full bg-card hover:bg-secondary p-3 flex items-center justify-center"
              >
                <MenuIcon className="h-5 w-5 text-foreground" />
                <span className="sr-only">Menu</span>
              </Link>
            </div>
          ) : (
            <Link href={buildAuthUrl('/')} className="flex items-center gap-2">
              <span className="text-sm font-normal text-muted-foreground">
                Login
              </span>
              <div className="rounded-full bg-card hover:bg-secondary w-11 h-11 flex items-center justify-center">
                <UserIcon className="h-5 w-5" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
