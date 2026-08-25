'use client'

import { PrefLogo } from '@/assets/icons/pref-logo'
import { useHeaderData } from '@/hooks/use-header-data'
import { GlobalMenuTrigger } from './global-menu/global-menu-trigger'
import HeaderUserLink from './header-user-link'

export default function MainHeader() {
  const { data, isLoading } = useHeaderData()

  return (
    <header className="relative  w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
        {/* Left side - Logo */}
        <PrefLogo fill="var(--primary)" className="h-8 w-20" />

        {/* Right side - perfil + menu global.
            O acesso ao perfil segue aqui até o handoff do novo Header chegar;
            depois dele o menu global passa a ser o único ponto de entrada. */}
        <div className="flex items-center gap-2">
          <HeaderUserLink
            userName={data.userName}
            isLoggedIn={data.isLoggedIn}
            userAvatarUrl={data.userAvatarUrl}
            userAvatarName={data.userAvatarName}
            isLoading={isLoading}
          />
          <GlobalMenuTrigger />
        </div>
      </div>
    </header>
  )
}
