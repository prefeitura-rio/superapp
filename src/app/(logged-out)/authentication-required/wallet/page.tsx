'use client'

import { FloatNavigation } from '@/app/components/float-navigation'
import { WalletIcon } from '@/assets/icons'
import { PrefLogo } from '@/assets/icons/pref-logo'
import { Button } from '@/components/ui/button'
import { REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE } from '@/middleware'
import Link from 'next/link'

export default function WalletAuthenticationRequired() {
  const handleLogin = () => {
    window.location.href = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 pb-32">
        <div className="flex max-w-md mx-auto flex-col items-center gap-8 text-center">
          {/* Logo */}
          <div className="w-full flex justify-center mb-4">
            <PrefLogo fill="var(--primary)" className="h-10 w-24" />
          </div>

          {/* Wallet Icon */}
          <div className="rounded-full bg-card p-6">
            <WalletIcon className="h-12 w-12 text-primary" />
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Acesso à Carteira
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Para acessar sua carteira digital e visualizar seus documentos e
              serviços, você precisa fazer login com sua conta Gov.br.
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full max-w-sm h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            Fazer Login com Gov.br
          </Button>

          {/* Back to Home */}
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar para o início
          </Link>
        </div>
      </main>

      {/* Float Navigation */}
      <FloatNavigation />
    </>
  )
}
