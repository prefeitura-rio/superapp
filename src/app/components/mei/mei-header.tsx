'use client'

import { SearchIcon } from '@/assets/icons'
import { HelpCircleIcon } from '@/assets/icons/help-circle-icon'
import { MenuIcon } from '@/assets/icons/menu-icon'
import OportunidadesCariocas from '@/assets/oportunidades-cariocas-icon.png'
import Image from 'next/image'
import Link from 'next/link'

interface MeiHeaderProps {
  isLoggedIn: boolean
}

export function MeiHeader({ isLoggedIn }: MeiHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background text-foreground px-4 py-3">
      <div className="mx-auto md:px-4 flex max-w-4xl items-center justify-between">
        <div className="flex justify-center">
          <Image
            src={OportunidadesCariocas}
            alt="Oportunidades Cariocas Logo"
            width={170}
            height={38}
            className="rounded-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/servicos/mei/busca"
            className="rounded-full bg-transparent p-4"
          >
            <SearchIcon className="h-5 w-5 text-foreground" />
            <span className="sr-only">Buscar oportunidades</span>
          </Link>
          {isLoggedIn ? (
            <Link
              href="/servicos/mei/menu"
              className="rounded-full bg-transparent p-4"
            >
              <MenuIcon className="h-5 w-5 text-foreground" />
              <span className="sr-only">Menu</span>
            </Link>
          ) : (
            <Link
              href="/servicos/mei/faq"
              className="rounded-full bg-transparent p-4"
            >
              <HelpCircleIcon className="h-5 w-5 text-foreground" />
              <span className="sr-only">Ajuda</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
