import { SearchIcon } from '@/assets/icons'
import { PrefLogo } from '@/assets/icons/pref-logo'
import Link from 'next/link'
import HeaderUserLink from './header-user-link'

interface MainHeaderProps {
  userName: string
  isLoggedIn: boolean
  showSearchIcon?: boolean
  searchUrl?: string
  userAvatarUrl?: string | null
  userAvatarName?: string | null
  isLoading?: boolean
  menuHref?: string
  returnUrl?: string
  logoHref?: string
  hideAvatar?: boolean
}

export default function MainHeader({
  userName,
  isLoggedIn,
  showSearchIcon = false,
  searchUrl,
  userAvatarUrl,
  userAvatarName,
  isLoading = false,
  menuHref,
  returnUrl,
  logoHref,
  hideAvatar = false,
}: MainHeaderProps) {
  return (
    <header className="relative w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
        {/* Left side - Logo */}
        {logoHref ? (
          <Link href={logoHref}>
            <PrefLogo fill="var(--primary)" className="h-8 w-20" />
          </Link>
        ) : (
          <PrefLogo fill="var(--primary)" className="h-8 w-20" />
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showSearchIcon && searchUrl && (
            <Link
              href={searchUrl}
              className="rounded-full bg-card hover:bg-secondary p-3 flex items-center justify-center"
            >
              <SearchIcon className="h-5 w-5 text-foreground" />
            </Link>
          )}
          <HeaderUserLink
            userName={userName}
            isLoggedIn={isLoggedIn}
            userAvatarUrl={userAvatarUrl}
            userAvatarName={userAvatarName}
            isLoading={isLoading}
            menuHref={menuHref}
            returnUrl={returnUrl}
            hideAvatar={hideAvatar}
          />
        </div>
      </div>
    </header>
  )
}
