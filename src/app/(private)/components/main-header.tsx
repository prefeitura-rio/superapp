import { SearchIcon, UserIcon } from '@/assets/icons'
import Link from 'next/link'

interface MainHeaderProps {
  userName: string
  showSearchIcon?: boolean
}

export default function MainHeader({
  userName,
  showSearchIcon = true,
}: MainHeaderProps) {
  return (
    <header className="relative  w-full z-50 bg-background text-foreground py-4">
      <div className="mx-auto px-4 flex max-w-md items-center justify-between">
        {/* Left side - User info with icon */}
        <Link href="/user-profile" className="flex items-center space-x-3">
          <div className="rounded-full bg-card p-4">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-normal text-foreground">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground">
              Prefeitura do Rio
            </span>
          </div>
        </Link>

        {/* Right side - Search icon with fade transition and debug background */}
        <Link href="/search" className="rounded-full p-4 opacity-100 bg-card">
          {showSearchIcon && <SearchIcon className="text-foreground h-5 w-5" />}
          <span className="sr-only">Search</span>
        </Link>
      </div>
    </header>
  )
}
