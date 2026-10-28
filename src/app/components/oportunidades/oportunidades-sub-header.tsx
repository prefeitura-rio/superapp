'use client'

import MainHeader from '@/app/components/main-header'
import { SearchIcon } from '@/assets/icons'
import { useAuthHeader } from '@/providers/auth-header-provider'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LOGO_LIGHT =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/banner/oportunidades-cariocas.png'
const LOGO_DARK =
  'https://storage.googleapis.com/rj-escritorio-dev-public/superapp/png/banner/oportunidades-cariocas-dark.png'

interface OportunidadesSubHeaderProps {
  menuHref: string
  logoHref: string
  showSearchIcon?: boolean
  searchUrl?: string
  /** Botão de busca ao lado do logo do Oportunidades Cariocas. */
  searchButtonUrl?: string
}

export function OportunidadesSubHeader({
  menuHref,
  logoHref,
  showSearchIcon,
  searchUrl,
  searchButtonUrl,
}: OportunidadesSubHeaderProps) {
  const { data, isLoading } = useAuthHeader()
  const pathname = usePathname()

  return (
    <div className="w-full">
      {/* Faixa 1 — PrefRio */}
      <MainHeader
        userName={data?.userAvatarName ?? ''}
        isLoggedIn={data?.isLoggedIn ?? false}
        userAvatarUrl={data?.userAvatarUrl ?? null}
        userAvatarName={data?.userAvatarName ?? null}
        isLoading={isLoading}
        showSearchIcon={showSearchIcon}
        searchUrl={searchUrl}
        menuHref={menuHref}
        returnUrl={pathname}
        logoHref="/"
      />

      {/* Faixa 2 — Oportunidades Cariocas */}
      <div
        className="w-full px-4 py-4"
        style={{
          background:
            'linear-gradient(180deg, var(--card) 0%, var(--card) 100%)',
        }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between md:px-4">
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
          {searchButtonUrl && (
            <Link
              href={searchButtonUrl}
              aria-label="Buscar oportunidades"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background transition-colors hover:bg-secondary"
            >
              <SearchIcon className="size-6 text-foreground" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
