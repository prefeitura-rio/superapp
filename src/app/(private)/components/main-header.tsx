import { Bell, Search, User } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
}

export default function MainHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
      <div className="mx-auto md:px-4 flex max-w-md items-center justify-between">
        <Link
          href="/notifications"
          className="relative p-4 cursor-pointer  rounded-full bg-card"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-3 right-3 block h-3 w-3 rounded-full bg-primary border-2 border-card" />
        </Link>

        <div className="flex items-center space-x-2">
          <Link href="/search" className="rounded-full bg-card p-4">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Link>

          <Link href="/user-profile" className="rounded-full bg-card p-4">
            <User className="h-5 w-5" />
            <span className="sr-only">User Settings</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
