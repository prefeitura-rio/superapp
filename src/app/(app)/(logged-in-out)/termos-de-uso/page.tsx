import HeaderWrapperClient from '@/app/components/header-wrapper-client'
import { TERMOS_DE_USO_PLATFORMS } from '@/constants/termos-de-uso/platforms'
import type { Metadata } from 'next'
import { BackButton } from './components/back-button'
import { PlatformList } from './components/platform-list'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Termos de uso',
  description:
    'Termos de uso das plataformas da Prefeitura do Rio e as condições de utilização de cada serviço.',
}

export default function TermosDeUsoPage() {
  return (
    <div className="w-full bg-background text-foreground">
      <HeaderWrapperClient />
      <main className="mx-auto w-full max-w-4xl px-4 pb-10">
        <BackButton fallbackHref="/" />

        <h1 className="mt-4 text-3xl font-medium leading-9 tracking-tight text-foreground">
          Termos de uso
        </h1>
        <p className="mt-1 text-sm leading-5 text-foreground-light">
          Encontre os termos de uso das nossas plataformas e saiba mais sobre as
          condições de utilização de cada serviço
        </p>

        <PlatformList platforms={TERMOS_DE_USO_PLATFORMS} />
      </main>
    </div>
  )
}
