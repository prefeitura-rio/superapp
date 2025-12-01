import { PrefLogo } from '@/assets/icons/pref-logo'
import HeaderUserLink from './header-user-link'

interface MainHeaderProps {
  userName: string
  isLoggedIn: boolean
  showSearchIcon?: boolean
  userAvatarUrl?: string | null
  userAvatarName?: string | null
  isLoading?: boolean
}

export default function MainHeader({
  userName,
  isLoggedIn,
  showSearchIcon = true,
  userAvatarUrl,
  userAvatarName,
  isLoading = false,
}: MainHeaderProps) {
  return (
    <header className="relative  w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
        {/* Left side - Logo */}
        <PrefLogo fill="var(--primary)" className="h-8 w-20" />

        {/* Right side - User info with icon */}
        <HeaderUserLink
          userName={userName}
          isLoggedIn={isLoggedIn}
          userAvatarUrl={userAvatarUrl}
          userAvatarName={userAvatarName}
          isLoading={isLoading}
        />
      </div>
    </header>
  )
}
