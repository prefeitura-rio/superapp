import { PrefLogo } from '@/assets/icons/pref-logo'
import HeaderUserLink from './header-user-link'

interface MainHeaderProps {
  userName: string
  isLoggedIn: boolean
  showSearchIcon?: boolean
  userAvatarUrl?: string | null
  userAvatarName?: string | null
}

export default function MainHeader({
  userName,
  isLoggedIn,
  showSearchIcon = true,
  userAvatarUrl,
  userAvatarName,
}: MainHeaderProps) {
  return (
    <header className="relative  w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
        {/* Left side - User info with icon */}
        <HeaderUserLink 
          userName={userName} 
          isLoggedIn={isLoggedIn} 
          userAvatarUrl={userAvatarUrl}
          userAvatarName={userAvatarName}
        />

        {/* Right side - Search icon with fade transition and debug background */}
        {/* <Link href="/search" className="rounded-full p-4 opacity-100 bg-card"> */}
        {/* {showSearchIcon && <SearchIcon className="text-foreground h-5 w-5" />} */}
        <PrefLogo fill="var(--primary)" className="h-8 w-20" />
        <span className="sr-only">Search</span>
        {/* </Link> */}
      </div>
    </header>
  )
}
