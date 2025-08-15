import { UserIcon } from '@/assets/icons'
import { PrefLogo } from '@/assets/icons/pref-logo'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/constants/url'
import Link from 'next/link'

interface MainHeaderProps {
  userName: string
  isLoggedIn: boolean
  showSearchIcon?: boolean
}

export default function MainHeader({
  userName,
  isLoggedIn,
  showSearchIcon = true,
}: MainHeaderProps) {
  return (
    <header className="relative  w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-4xl items-center justify-between">
        {/* Left side - User info with icon */}
        <Link
          href={
            isLoggedIn ? '/user-profile' : REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
          }
          className="flex items-center space-x-3"
        >
          <div className="rounded-full bg-card p-3">
            <UserIcon className="h-5 w-5" />
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
