'use client'

import CicloCariocaIcon from '@/assets/ciclocarioca-icon.png'
import { HomeIcon } from '@/assets/icons'
import { MenuIcon } from '@/assets/icons/menu-icon'
import type { UserInfo } from '@/lib/user-info'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CoursesHeader({ userInfo }: { userInfo: UserInfo }) {
  const router = useRouter()
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
      <div className="mx-auto md:px-4 flex max-w-4xl items-center justify-between">
        <div className="flex justify-center">
          <Image
            src={CicloCariocaIcon}
            alt="Ciclo Carioca Logo"
            width={170}
            height={38}
            className="rounded-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/" className="rounded-full bg-card p-4">
            <HomeIcon className="h-5 w-5 text-foreground" />
            <span className="sr-only">Search</span>
          </Link>

          <Link
            href="/servicos/cursos/opcoes"
            className="rounded-full bg-card p-4"
          >
            <MenuIcon className="h-5 w-5 text-foreground" />
            <span className="sr-only">Options</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
