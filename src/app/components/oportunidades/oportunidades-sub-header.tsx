'use client'

import { UserIcon } from '@/assets/icons'
import { MenuIcon } from '@/assets/icons/menu-icon'
import { PrefLogo } from '@/assets/icons/pref-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { buildAuthUrl } from '@/constants/url'
import { useAuthHeader } from '@/providers/auth-header-provider'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LOGO_LIGHT =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/banner/oportunidades-cariocas.png'
const LOGO_DARK =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/banner/oportunidades-cariocas.png'

interface OportunidadesSubHeaderProps {
  menuHref: string
  logoHref: string
}

export function OportunidadesSubHeader({
  menuHref,
  logoHref,
}: OportunidadesSubHeaderProps) {
  const { data, isLoading } = useAuthHeader()
  const pathname = usePathname()

  return (
    <div className="w-full">
      {/* Faixa 1 — Pref.Rio */}
      <div className="bg-background w-full px-4 py-4">
        <div className="mx-auto md:px-4 flex max-w-4xl items-center justify-between">
          <Link href="/">
            <PrefLogo fill="var(--primary)" className="h-8 w-20" />
          </Link>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Skeleton className="rounded-full h-11 w-11" />
            ) : data.isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link href="/meu-perfil">
                  <div className="rounded-full bg-card hover:bg-secondary w-11 h-11 flex items-center justify-center overflow-hidden">
                    {data.userAvatarUrl ? (
                      <Image
                        src={data.userAvatarUrl}
                        alt={data.userAvatarName || 'Avatar'}
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
                  href={menuHref}
                  className="rounded-full bg-card hover:bg-secondary p-3 flex items-center justify-center"
                >
                  <MenuIcon className="h-5 w-5 text-foreground" />
                  <span className="sr-only">Menu</span>
                </Link>
              </div>
            ) : (
              <Link
                href={buildAuthUrl(pathname)}
                className="flex items-center gap-2"
              >
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
      </div>

      {/* Faixa 2 — Oportunidades Cariocas */}
      <div
        className="w-full px-4 py-4"
        style={{
          background: 'linear-gradient(180deg, var(--card) 0%, #F1F1F4 100%)',
        }}
      >
        <div className="mx-auto md:px-4 max-w-4xl">
          <Link href={logoHref}>
            <Image
              src={LOGO_LIGHT}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              className="dark:hidden"
              priority
            />
            <Image
              src={LOGO_DARK}
              alt="Oportunidades Cariocas"
              width={170}
              height={38}
              className="hidden dark:block"
              priority
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
